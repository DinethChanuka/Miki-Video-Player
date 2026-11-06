import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { execFile } from 'node:child_process';

const host = process.env.TAURI_DEV_HOST;

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  '.mp4',
  '.m4v',
  '.webm',
  '.mkv',
  '.mov',
  '.avi',
  '.mp3',
  '.wav',
  '.flac',
  '.m4a',
  '.aac',
  '.ogg',
  '.ts',
  '.m3u8',
  '.m3u',
]);

const MIME_MAP: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.ts': 'video/mp2t',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.m3u': 'audio/x-mpegurl',
};

// Hardened local media streaming middleware (HTTP 206 Partial Content)
function localMediaStreamerPlugin() {
  const ytStreamCache = new Map<string, { url: string; expires: number }>();

  return {
    name: 'local-media-streamer',
    configureServer(server: any) {
      server.middlewares.use('/api/stream-audio', (req: any, res: any) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost:1420');
          const id = urlObj.searchParams.get('id') || '';
          const rawUrl = urlObj.searchParams.get('url') || '';
          const redirect = urlObj.searchParams.get('redirect') === 'true';
          const isStream = urlObj.searchParams.get('stream') === 'true' || Boolean(req.headers.range);

          const pipeAudioStream = (streamUrl: string) => {
            try {
              const parsedTarget = new URL(streamUrl);
              const clientRange = req.headers.range || 'bytes=0-';
              const upstreamReq = https.request(
                parsedTarget,
                {
                  method: 'GET',
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
                    Range: clientRange,
                  },
                },
                (upstreamRes) => {
                  res.statusCode = upstreamRes.statusCode || 200;
                  res.setHeader('Content-Type', upstreamRes.headers['content-type'] || 'audio/mp4');
                  res.setHeader('Accept-Ranges', 'bytes');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader(
                    'Access-Control-Expose-Headers',
                    'Content-Length, Content-Range, Accept-Ranges'
                  );
                  res.setHeader('Cache-Control', 'no-store');
                  if (upstreamRes.headers['content-length']) {
                    res.setHeader('Content-Length', upstreamRes.headers['content-length']);
                  }
                  if (upstreamRes.headers['content-range']) {
                    res.setHeader('Content-Range', upstreamRes.headers['content-range']);
                  }
                  upstreamRes.pipe(res);
                }
              );
              upstreamReq.on('error', () => {
                if (!res.headersSent) {
                  res.statusCode = 502;
                  res.end();
                }
              });
              upstreamReq.end();
            } catch {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end();
              }
            }
          };

          let videoId = id.trim();
          if (!videoId && rawUrl) {
            const match = rawUrl.match(/([a-zA-Z0-9_-]{11})/);
            if (match) videoId = match[1];
          }

          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'missing_id' }));
            return;
          }

          const cached = ytStreamCache.get(videoId);
          if (cached && cached.expires > Date.now()) {
            if (redirect) {
              res.statusCode = 302;
              res.setHeader('Location', cached.url);
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end();
              return;
            }
            if (isStream) {
              pipeAudioStream(cached.url);
              return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ url: cached.url, id: videoId, source: 'youtube', kind: 'direct_stream' }));
            return;
          }

          const ytDlpPath = path.resolve(process.cwd(), 'bin/yt-dlp');
          execFile(
            ytDlpPath,
            [
              '--extractor-args', 'youtube:skip=hls,dash,translated_subs',
              '-f', 'bestaudio[ext=m4a]/bestaudio[ext=mp4]/bestaudio',
              '--no-warnings',
              '--no-playlist',
              '-g',
              `https://www.youtube.com/watch?v=${videoId}`
            ],
            { timeout: 15000 },
            (err, stdout) => {
              if (err || !stdout.trim()) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}`, id: videoId, fallback: true }));
                return;
              }

              const directUrl = stdout.trim().split('\n')[0].trim();
              ytStreamCache.set(videoId, { url: directUrl, expires: Date.now() + 14400 * 1000 });

              if (redirect) {
                res.statusCode = 302;
                res.setHeader('Location', directUrl);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end();
                return;
              }

              if (isStream) {
                pipeAudioStream(directUrl);
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ url: directUrl, id: videoId, source: 'youtube', kind: 'direct_stream' }));
            }
          );
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e?.message || 'Server error' }));
        }
      });

      server.middlewares.use('/@media-stream', (req: any, res: any) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost:1420');
          const rawFilePath = urlObj.searchParams.get('path');
          if (!rawFilePath) {
            res.statusCode = 400;
            res.end('Missing file path');
            return;
          }

          let filePath = decodeURIComponent(rawFilePath).replace(/^file:\/\//, '');
          if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(process.cwd(), filePath);
          }

          // Canonical path normalization to resolve symlinks and prevent traversal tricks
          let canonicalPath = filePath;
          try {
            canonicalPath = fs.realpathSync(filePath);
          } catch {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          // Strict media extension allowlist
          const ext = path.extname(canonicalPath).toLowerCase();
          if (!ALLOWED_MEDIA_EXTENSIONS.has(ext)) {
            res.statusCode = 403;
            res.end('Access denied: not an allowed media file');
            return;
          }

          if (!fs.existsSync(canonicalPath)) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          const stat = fs.statSync(canonicalPath);
          if (!stat.isFile()) {
            res.statusCode = 403;
            res.end('Access denied: target is not a regular file');
            return;
          }

          const fileSize = stat.size;
          const range = req.headers.range;
          const contentType = MIME_MAP[ext] || 'application/octet-stream';

          // Safe CORS: Only allow localhost / local app origins (no wildcard '*')
          const origin = req.headers.origin || '';
          const isAllowedOrigin =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            origin === 'tauri://localhost';
          const corsOrigin = isAllowedOrigin ? origin : 'http://localhost:1420';

          const commonHeaders = {
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
            'X-Content-Type-Options': 'nosniff',
          };

          if (req.method === 'OPTIONS') {
            res.writeHead(204, commonHeaders);
            res.end();
            return;
          }

          if (range) {
            const rangeMatch = range.match(/^bytes=(\d*)-(\d*)$/);
            if (!rangeMatch) {
              res.writeHead(416, {
                'Content-Range': `bytes */${fileSize}`,
                ...commonHeaders,
              });
              res.end('Range Not Satisfiable');
              return;
            }

            const rawStart = rangeMatch[1];
            const rawEnd = rangeMatch[2];

            let start: number;
            let end: number;

            if (rawStart === '' && rawEnd !== '') {
              // Suffix byte range: e.g. bytes=-500 (last 500 bytes)
              const suffixLength = parseInt(rawEnd, 10);
              start = Math.max(0, fileSize - suffixLength);
              end = fileSize - 1;
            } else {
              start = rawStart ? parseInt(rawStart, 10) : 0;
              end = rawEnd ? parseInt(rawEnd, 10) : fileSize - 1;
            }

            // HTTP 416 Validation
            if (
              isNaN(start) ||
              isNaN(end) ||
              start > end ||
              start >= fileSize ||
              end >= fileSize
            ) {
              res.writeHead(416, {
                'Content-Range': `bytes */${fileSize}`,
                ...commonHeaders,
              });
              res.end('Range Not Satisfiable');
              return;
            }

            const chunkSize = end - start + 1;
            const fileStream = fs.createReadStream(canonicalPath, { start, end });

            fileStream.on('error', (err) => {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end('Stream error');
              }
            });

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Content-Length': chunkSize,
              ...commonHeaders,
            });
            fileStream.pipe(res);
          } else {
            const fileStream = fs.createReadStream(canonicalPath);
            fileStream.on('error', (err) => {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end('Stream error');
              }
            });

            res.writeHead(200, {
              'Content-Length': fileSize,
              ...commonHeaders,
            });
            fileStream.pipe(res);
          }
        } catch (err) {
          res.statusCode = 500;
          res.end('Internal media streamer error');
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), localMediaStreamerPlugin()],
  clearScreen: false,
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});

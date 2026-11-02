import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

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
  return {
    name: 'local-media-streamer',
    configureServer(server: any) {
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

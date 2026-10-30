import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const host = process.env.TAURI_DEV_HOST;

// Custom high-performance local media streaming middleware (HTTP 206 Partial Content)
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

          if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end(`File not found: ${filePath}`);
            return;
          }

          const stat = fs.statSync(filePath);
          const fileSize = stat.size;
          const range = req.headers.range;

          const ext = path.extname(filePath).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.mp4': 'video/mp4',
            '.m4v': 'video/mp4',
            '.webm': 'video/webm',
            '.mkv': 'video/mp4', // Modern WebKit handles H.264/HEVC in MKV/MP4 container
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac',
          };
          const contentType = mimeMap[ext] || 'video/mp4';

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize,
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
            });
            fileStream.pipe(res);
          } else {
            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes',
              'Access-Control-Allow-Origin': '*',
            });
            fs.createReadStream(filePath).pipe(res);
          }
        } catch (err) {
          console.error('[MediaStreamer] Error streaming media file:', err);
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

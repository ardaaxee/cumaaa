import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const mount = '/cumaaa/yks/';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(mount)) { response.writeHead(404); response.end(); return; }
    const file = resolve(root, pathname.slice(mount.length) || 'index.html');
    if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(Number(process.env.PORT) || 4173, '127.0.0.1');
process.on('SIGTERM', () => server.close());

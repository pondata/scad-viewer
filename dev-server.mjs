// Local dev server — emulates the Vercel runtime so we can test api/render.js
// end to end before deploying. NOT used in production (Vercel serves directly).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from './api/render.js';

const PORT = process.env.PORT || 8000;

function enhance(res) {
  res.status = c => { res.statusCode = c; return res; };
  res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  res.send = b => { res.end(b); return res; };
  return res;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/index.html'))) {
      const html = await readFile(new URL('./index.html', import.meta.url));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(html);
    }
    if (req.url.startsWith('/api/render')) {
      return handler(req, enhance(res));
    }
    res.statusCode = 404;
    res.end('not found');
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
});

server.listen(PORT, () => console.log(`dev server on http://localhost:${PORT}`));

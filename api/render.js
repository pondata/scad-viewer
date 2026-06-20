// Vercel serverless function: POST a .scad body, get back an STL mesh.
// Also runs locally via dev-server.mjs (which polyfills res.status/json/send).
import { compileScadToStl } from '../lib/compile.mjs';

export const config = { maxDuration: 30 };

const MAX_BYTES = 2_000_000;

async function readBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object' && typeof req.body.code === 'string') return req.body.code;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST a .scad body to this endpoint' });

  let code;
  try { code = (await readBody(req) || '').trim(); }
  catch { return res.status(400).json({ error: 'could not read request body' }); }
  if (!code) return res.status(400).json({ error: 'empty .scad' });
  if (code.length > MAX_BYTES) return res.status(413).json({ error: 'file too large (2 MB max)' });

  try {
    const { stl, log, backend } = await compileScadToStl(code);
    if (!stl) return res.status(422).json({ error: 'OpenSCAD produced no output — check your .scad', log });
    res.setHeader('Content-Type', 'model/stl');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Scad-Backend', backend);
    return res.status(200).send(stl);
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}

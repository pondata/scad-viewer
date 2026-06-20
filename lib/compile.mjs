// Server-side OpenSCAD compile. Runs the same openscad-wasm engine used in the
// browser, but on the server — so weak phones (e.g. iPhone SE) never load the
// 13.9 MB engine or run CAD compute on-device; they just render the returned mesh.
import { createOpenSCAD } from 'openscad-wasm';

// One attempt on a fresh instance. callMain is one-shot per instance (a 2nd call
// crashes it) and instantiation is only ~150 ms, so we make a new one each time.
async function renderWith(code, backendArgs) {
  const errors = [];
  let osc = await createOpenSCAD({ print() {}, printErr: t => errors.push(t) });
  try {
    const inst = osc.getInstance();
    inst.FS.writeFile('/in.scad', code);
    let threw = false;
    try { inst.callMain(['/in.scad', ...backendArgs, '-o', '/out.stl']); }
    catch { threw = true; }
    let data = null;
    try { data = inst.FS.readFile('/out.stl'); } catch {}
    if (threw || !data || data.length === 0) return { stl: null, log: errors.join('\n') };
    return { stl: Buffer.from(data), log: errors.join('\n') };
  } finally {
    osc = null; // let the Emscripten heap be GC'd
  }
}

// Manifold backend is ~100x faster than CGAL; fall back to CGAL for non-manifold models.
export async function compileScadToStl(code) {
  let r = await renderWith(code, ['--backend=manifold']);
  if (r.stl) return { ...r, backend: 'manifold' };
  r = await renderWith(code, []);
  return { ...r, backend: 'cgal' };
}

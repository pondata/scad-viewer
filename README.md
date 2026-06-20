# SCAD Viewer

Upload an OpenSCAD `.scad` file and preview it in 3D.

- **Static (in-browser):** https://pondata.github.io/scad-viewer/ — compiles in your browser. Great on desktop.
- **Server version (recommended for phones):** deploy to Vercel (below) — the server compiles and the
  phone only renders the mesh. Needed for weak devices like an iPhone SE, where the in-browser engine is too heavy.

## How it works

- `.scad` → STL is compiled by **real OpenSCAD** ([`openscad-wasm`](https://www.npmjs.com/package/openscad-wasm))
  using the fast **Manifold** backend, with a CGAL fallback for non-manifold models.
- When a backend is available (`/api/render`), the compile runs **server-side** and the browser just
  fetches the mesh — no 14 MB engine download, no CAD compute on-device. Otherwise it falls back to
  compiling **in-browser** (the GitHub Pages copy).
- The STL is rendered with [three.js](https://threejs.org/) — Z-up→Y-up corrected, auto-centered,
  camera auto-fit. The WebGL context is created lazily and released while hidden so mobile Safari
  won't reload the tab when the file picker opens.

## Project layout

```
index.html        the whole front-end (no build step)
api/render.js     Vercel serverless function: POST a .scad body → STL
lib/compile.mjs   shared OpenSCAD-WASM compile (used by the function and dev server)
dev-server.mjs    local server that emulates the Vercel runtime for testing
```

## Run locally (with the server compile)

```sh
npm install
npm run dev          # http://localhost:8000  (serves index.html + /api/render)
```

Or static-only (in-browser compile), no install needed:

```sh
python3 -m http.server 8000
```

## Deploy the server version (Vercel, free)

1. Go to **https://vercel.com/new** and sign in with GitHub.
2. Import the **`pondata/scad-viewer`** repo and click **Deploy** (zero config — Vercel detects the
   static page and the `api/` function automatically).
3. Open the resulting `*.vercel.app` URL on your phone. Uploads now compile on the server.

Test the API directly:

```sh
printf 'cube([10,10,10]);' | curl -X POST --data-binary @- https://YOUR-APP.vercel.app/api/render -o out.stl
```

## Limits

- The server compile is capped at a 2 MB `.scad` and a 30 s timeout.
- This OpenSCAD-WASM build ships without bundled fonts/MCAD, so `text()` and `use <MCAD/...>`
  will error; primitive/CSG geometry renders fine.

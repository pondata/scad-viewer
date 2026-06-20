# SCAD Viewer

Upload an OpenSCAD `.scad` file and preview it in 3D — entirely in your browser.

**Live:** https://pondata.github.io/scad-viewer/

## How it works

- `.scad` → STL is compiled by **real OpenSCAD** running as WebAssembly
  ([`openscad-wasm`](https://www.npmjs.com/package/openscad-wasm), loaded once from a CDN).
- The STL is rendered with [three.js](https://threejs.org/) — Z-up→Y-up corrected,
  auto-centered on the grid, camera auto-fit, soft shadows.
- 100% client-side. Nothing is uploaded to any server.

## Features

- Drag-and-drop or browse for a `.scad` file (or **Load sample**)
- Editable source pane — tweak and re-render
- Orbit / zoom / pan, plus wireframe, auto-rotate, grid, and reset-view toggles
- Live OpenSCAD console output (errors included)

## Run locally

ES-module pages must be served over HTTP (not opened as `file://`):

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Limits

- Renders with OpenSCAD's fast **Manifold** backend (`--backend=manifold`), falling back to
  the slower CGAL kernel only for non-manifold models. Very high `$fn` can still take a moment.
- This WASM build ships without bundled fonts/MCAD, so `text()` and `use <MCAD/...>`
  will error in the console; primitive/CSG geometry renders fine.

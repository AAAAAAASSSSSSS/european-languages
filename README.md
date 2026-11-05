# Tongues of Europe
Static site (GitHub Pages: publish the repo root). Open `index.html`; no build step needed to run.
- `data/languages.txt` is the single source of truth (tree + area definitions). Edit it, then run `python3 tools/build_areas.py` (needs `pip install shapely`) to regenerate `data/areas.js`, `data/tree.js`, `data/base.js`.
- `data/sources.js` holds the sources shown behind the [i] button. `data/europe-definition.js` holds the owner's definition of Europe (implemented as `MASK` in the build script).
- The two Natural Earth GeoJSON files in `tools/` are only needed to rebuild; delete them from the published repo if you want it lighter.

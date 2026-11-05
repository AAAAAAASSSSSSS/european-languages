#!/usr/bin/env python3
"""Build data/areas.js, data/base.js, data/tree.js from data/languages.txt.

Needs Natural Earth 10m GeoJSON (public domain) next to this script:
  ne_10m_admin_0_countries.geojson, ne_10m_admin_1_states_provinces.geojson
  https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
Needs: pip install shapely
Run:   python3 tools/build_areas.py
"""
import json, re, sys, unicodedata, os
from shapely.geometry import shape, box, Polygon, mapping
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
def norm(s): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", str(s).lower()).encode("ascii", "ignore").decode())

a0 = json.load(open(os.path.join(HERE, "ne_10m_admin_0_countries.geojson")))["features"]
a1 = json.load(open(os.path.join(HERE, "ne_10m_admin_1_states_provinces.geojson")))["features"]
TOL = 0.02
C = {f["properties"]["ADM0_A3"]: shape(f["geometry"]).simplify(TOL) for f in a0}
R = {}
for f in a1:
    R.setdefault(f["properties"]["adm0_a3"], {})[norm(f["properties"]["name"])] = shape(f["geometry"]).simplify(TOL)

# Europe drawing mask (see EUROPE_DEFINITION): continent + islands, Urals at 60E, Caucasus ridge, Thrace, Cyprus.
ASIA = Polygon([(29.2, 35.9), (29.2, 41.1), (41.5, 41.2), (44, 41.9), (47.5, 41.2), (49.5, 40.3), (51, 40), (60, 40), (60, 35.9)])
MASK = box(-32, 27, 60, 82).difference(ASIA).difference(box(-5.5, 35.7, -5.2, 36.0)).difference(box(-3.1, 35.1, -2.8, 35.4))  # minus Ceuta, Melilla
warn = set()

def term_geom(t):
    m = re.match(r"^([A-Z]{3})(?::([^@]*))?(?:@(.*))?$", t.strip())
    if not m: warn.add("bad term " + t); return None
    c, regs, bb = m.groups()
    if c not in C: warn.add("no country " + c); return None
    if regs is None: g = C[c]
    else:
        neg = regs.startswith("!"); names = [norm(x) for x in regs.lstrip("!").split("|")]
        have = R.get(c, {})
        for n in names:
            if n not in have: warn.add(f"{c}: region '{n}' not found")
        parts = [have[k] for k in have if (k in names) != neg]
        g = unary_union(parts) if parts else None
        if g is None: return None
    if bb:
        w, s, e, n = map(float, bb.split(",")); g = g.intersection(box(w, s, e, n))
    return g

def area(spec):
    gs = [g for g in (term_geom(t) for t in spec.split(";") if t.strip()) if g is not None and not g.is_empty]
    if not gs: return None
    g = unary_union(gs).buffer(0.01).intersection(MASK).simplify(TOL)
    return None if g.is_empty else g

def flat(ring): return [round(v, 2) for p in ring.coords for v in p]
def multi(g):
    polys = [g] if g.geom_type == "Polygon" else [p for p in g.geoms if p.geom_type == "Polygon"]
    return [[flat(p.exterior)] + [flat(h) for h in p.interiors if h.area > 0.002] for p in polys if p.area > 0.0003]

FL = re.compile(r"^[LDxdsn]*$")
tree, areas = [], {}
for line in open(os.path.join(ROOT, "data", "languages.txt"), encoding="utf-8"):
    line = line.rstrip("\n")
    if not line.strip() or line.startswith("#"): continue
    t = line.split("|"); id_, name, parent = t[0], t[1], (t[2] if len(t) > 2 else ""); rest = t[3:]
    note = ""
    if rest and not FL.match(rest[-1]): note = rest.pop()
    flags = rest.pop() if rest else ""
    spec = "|".join(rest).strip("|")
    tree.append([id_, name, parent, flags, note])
    if spec:
        g = area(spec)
        if g is None: warn.add(f"{id_}: empty area")
        else: areas[id_] = multi(g)
ids = {n[0] for n in tree}
for n in tree:
    if n[2] and n[2] not in ids: warn.add(f"{n[0]}: unknown parent {n[2]}")

base = []
clip = box(-35, 24, 70, 82)
for f in a0:
    g = shape(f["geometry"]).intersection(clip)
    if not g.is_empty: base.append([f["properties"]["ADM0_A3"], multi(g.simplify(0.04))])

open(os.path.join(ROOT, "data", "areas.js"), "w").write("window.AREAS=" + json.dumps(areas, separators=(",", ":")) + ";")
open(os.path.join(ROOT, "data", "base.js"), "w").write("window.BASE=" + json.dumps(base, separators=(",", ":")) + ";")
open(os.path.join(ROOT, "data", "tree.js"), "w", encoding="utf-8").write("window.TREE=" + json.dumps(tree, ensure_ascii=False, separators=(",", ":")) + ";")
print(len(tree), "nodes,", len(areas), "areas")
for w in sorted(warn): print("WARN", w)

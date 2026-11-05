#!/usr/bin/env python3
"""Build data/areas.js, data/base.js, data/tree.js from data/languages.txt.

Needs Natural Earth 10m GeoJSON (public domain) next to this script:
  ne_10m_admin_0_countries.geojson, ne_10m_admin_1_states_provinces.geojson
  https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
Needs: pip install shapely
Run:   python3 tools/build_areas.py
"""
import json, re, sys, unicodedata, os, math
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
# Uninhabited islands and island groups carry no language.
EXCL = unary_union([box(44, 79.5, 66, 82), box(50, 70.6, 69, 77.3), box(-9.6, 70.8, -7.4, 71.3), box(18.4, 74.2, 19.6, 74.7),
                    box(25, 76.3, 25.8, 76.7), box(26, 78.6, 29, 79.2), box(18, 79.0, 28, 80.9), box(19.5, 77.2, 24, 78.6)])
KEEP = unary_union([box(-5.4, 36.1, -5.3, 36.2), box(7.4, 43.72, 7.45, 43.76), box(12.44, 41.9, 12.46, 41.91)])  # Gibraltar, Monaco, Vatican
def clean(g):
    g = g.difference(EXCL)
    ps = [g] if g.geom_type == "Polygon" else [p for p in getattr(g, "geoms", []) if p.geom_type == "Polygon"]
    out = []
    for p in ps:
        if p.area < 0.004 and not p.intersects(KEEP): continue
        out.append(Polygon(p.exterior, [h for h in p.interiors if Polygon(h).area > 0.02]))
    return out

def blob(w, s, e, n):
    """Soft shape inside the box (ellipse for small boxes, rounded square for big ones) so no hard rectangles appear."""
    cx, cy, a, b = (w + e) / 2, (s + n) / 2, (e - w) / 2, (n - s) / 2
    sp = max(e - w, n - s); ex = 2 if sp < 1.6 else 3 if sp < 4 else 6
    pts = []
    for i in range(72):
        t = i / 72 * 2 * math.pi; c, d = math.cos(t), math.sin(t)
        pts.append((cx + a * math.copysign(abs(c) ** (2 / ex), c), cy + b * math.copysign(abs(d) ** (2 / ex), d)))
    return Polygon(pts)

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
        g = g.intersection(blob(*map(float, bb.split(","))))
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

def multi(polys):
    return [[flat(p.exterior)] + [flat(h) for h in p.interiors] for p in polys]

FL = re.compile(r"^[LDxdsn]*$")
tree, own = [], {}
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
        else: own[id_] = g
ids = {n[0] for n in tree}
kids = {}
for n in tree:
    if n[2] and n[2] not in ids: warn.add(f"{n[0]}: unknown parent {n[2]}")
    kids.setdefault(n[2], []).append(n[0])
done = {}
def final(i):
    """Own spec if given, otherwise the dissolved union of the children (closes seams so borders between children vanish)."""
    if i in done: return done[i]
    if i in own: g = own[i]
    else:
        ks = [x for x in (final(k) for k in kids.get(i, [])) if x is not None]
        g = unary_union(ks).buffer(0.03).buffer(-0.03).simplify(0.02) if ks else None
    if g is not None:
        ps = clean(g); g = unary_union(ps) if ps else None
        if g is not None: g = Polygon() if g.is_empty else g
    done[i] = g if g is not None and not g.is_empty else None
    return done[i]
areas = {}
for n in tree:
    g = final(n[0])
    if g is not None:
        areas[n[0]] = multi([g] if g.geom_type == "Polygon" else [p for p in g.geoms if p.geom_type == "Polygon"])

base = []
clip = box(-35, 24, 70, 82)
for f in a0:
    g = shape(f["geometry"]).intersection(clip)
    if not g.is_empty:
        g = g.simplify(0.04); base.append([f["properties"]["ADM0_A3"], multi([g] if g.geom_type == "Polygon" else [p for p in g.geoms if p.geom_type == "Polygon"])])

open(os.path.join(ROOT, "data", "areas.js"), "w").write("window.AREAS=" + json.dumps(areas, separators=(",", ":")) + ";")
open(os.path.join(ROOT, "data", "base.js"), "w").write("window.BASE=" + json.dumps(base, separators=(",", ":")) + ";")
open(os.path.join(ROOT, "data", "tree.js"), "w", encoding="utf-8").write("window.TREE=" + json.dumps(tree, ensure_ascii=False, separators=(",", ":")) + ";")
print(len(tree), "nodes,", len(areas), "areas")
for w in sorted(warn): print("WARN", w)

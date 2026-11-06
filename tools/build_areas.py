#!/usr/bin/env python3
"""Build data/areas.js, data/base.js, data/tree.js from data/languages.txt.

Needs Natural Earth 10m GeoJSON (public domain) next to this script:
  ne_10m_admin_0_countries.geojson, ne_10m_admin_1_states_provinces.geojson
  https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
Needs: pip install shapely
Run:   python3 tools/build_areas.py
"""
import json, re, sys, unicodedata, os, math
from shapely.geometry import shape, box, Polygon, Point, mapping
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
def norm(s): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", str(s).lower()).encode("ascii", "ignore").decode())

# Shapes are switched off for now. Run with POLYGONS=1 (and the two Natural Earth GeoJSON files in tools/) to build them again.
POLYGONS = os.environ.get("POLYGONS") == "1"
read = lambda f: json.load(open(os.path.join(HERE, f)))["features"] if POLYGONS else []
a0 = read("ne_10m_admin_0_countries.geojson")
a1 = read("ne_10m_admin_1_states_provinces.geojson")
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

# ---------- 1. my nodes (data/languages.txt: ids, areas, flags) ----------
FL = re.compile(r"^[LDxdsn]*$")
mine, own_my = [], {}
for line in open(os.path.join(ROOT, "data", "languages.txt"), encoding="utf-8"):
    line = line.rstrip("\n")
    if not line.strip() or line.startswith("#"): continue
    t = line.split("|"); id_, name, parent = t[0], t[1], (t[2] if len(t) > 2 else ""); rest = t[3:]
    note = ""
    if rest and not FL.match(rest[-1]): note = rest.pop()
    flags = rest.pop() if rest else ""
    spec = "|".join(rest).strip("|")
    mine.append(dict(id=id_, name=name, parent=parent, flags=flags, note=note))
    if spec and POLYGONS:
        g = area(spec)
        if g is None: warn.add(f"{id_}: empty area")
        else: own_my[id_] = g
M = {n["id"]: n for n in mine}

# ---------- 2. Glottolog classification (tools/glottolog.json, made by fetch_glottolog.py) ----------
sys.path.insert(0, HERE); from iso_map import ISO
GL = json.load(open(os.path.join(HERE, "glottolog.json"), encoding="utf-8"))
GK = {}
for g in GL.values():
    if g["parent"]: GK.setdefault(g["parent"], []).append(g["id"])
isoix, nmix = {}, {}
for g in GL.values():
    if g["iso"]: isoix.setdefault(g["iso"], []).append(g)
    nmix.setdefault(norm(g["name"]), []).append(g)
def top(c):
    while GL[c]["parent"]: c = GL[c]["parent"]
    return c
BAD = re.compile(r"sign|pidgin|mixed|bookkeeping|unclass|unattested|artificial|speech register|spurious", re.I)
bad = lambda g: bool(BAD.search(GL[top(g["id"])]["name"]))
EXTRA = [box(-18.6, 27.4, -13, 29.6), box(-17.5, 32.3, -16, 33.2), box(23, 34.8, 26.5, 35.8), box(32, 34.5, 34.7, 35.9), box(14, 35.7, 14.7, 36.2)]
def inEurope(g):
    try: pt = Point(float(g["lon"]), float(g["lat"]))
    except ValueError: return False
    return (pt.y >= 35.9 and MASK.contains(pt)) or any(b.contains(pt) for b in EXTRA)
def pick(cs, family):
    cs = [c for c in cs if not bad(c)]
    if not cs: return None
    cs.sort(key=lambda c: (c["level"] != ("family" if family else "language"), not inEurope(c)))
    return cs[0]
used, code_of = set(), {}
for n in mine:
    k = ISO.get(n["id"]); cs = (isoix.get(k) or nmix.get(norm(k))) if k else None
    if not cs: cs = nmix.get(norm(n["name"]))
    g = pick(cs, family=not n["flags"]) if cs else None
    if g and g["id"] not in used: used.add(g["id"]); code_of[n["id"]] = g["id"]

# ---------- 3. which nodes exist: matched ones, their Glottolog ancestors, Europe-located languages, dialects, my own extras ----------
inc = set()
def add_chain(c):
    while c and c not in inc: inc.add(c); c = GL[c]["parent"]
for c in code_of.values(): add_chain(c)
for g in GL.values():
    if g["level"] == "language" and inEurope(g) and not bad(g): add_chain(g["id"])
def add_dialects(c):
    for k in GK.get(c, []):
        if GL[k]["level"] == "dialect" and k not in inc: inc.add(k)
        if GL[k]["level"] == "dialect": add_dialects(k)
for c in set(code_of.values()) | {c for c in inc if GL[c]["level"] == "language" and inEurope(GL[c])}:
    if GL[c]["level"] == "language": add_dialects(c)
fin = {}   # final id -> row
for c in inc:
    g = GL[c]; fin[c] = dict(id=c, name=g["name"], parent=g["parent"] if g["parent"] in inc else "", code=c,
        flags={"language": "L", "dialect": "D"}.get(g["level"], "") + ("x" if g["status"] == "extinct" else ""), note=("ISO 639-3: " + g["iso"]) if g["iso"] else "", my=None)
final_of = dict(code_of)
for n in mine:
    if n["id"] in code_of:
        r = fin[code_of[n["id"]]]; r["my"] = n["id"]
        r["flags"] = "".join(sorted(set(r["flags"]) | (set(n["flags"]) & set("dsnx"))))
        if n["note"] and not r["note"].startswith("ISO"): r["note"] = n["note"]
keep = lambda n: n["id"] in code_of   # project-defined (non-Glottolog) nodes are switched off
def up(n):
    p = n["parent"]
    while p:
        if p in code_of or (p in M and p not in code_of and (p in own_my or set(M[p]["flags"]) & set("LDxn"))): return p
        p = M[p]["parent"] if p in M else ""
    return ""
for n in mine:
    if n["id"] in code_of or not keep(n): continue
    fid = "p_" + n["id"]; final_of[n["id"]] = fid
for n in mine:
    if n["id"] in code_of or not keep(n): continue
    pm = up(n); pf = final_of.get(pm, "")
    fin[final_of[n["id"]]] = dict(id=final_of[n["id"]], name=n["name"], parent=pf, code="", flags=n["flags"] + "p", note=n["note"], my=n["id"])
# the rest of each family, collapsed into […]
for c in list(inc):
    g = GL[c]
    if g["level"] != "family": continue
    pr = [GL[k] for k in GK.get(c, []) if k not in inc and not bad(GL[k])]
    if pr:
        eg = ", ".join(sorted(x["name"] for x in pr)[:6])
        fin[c + "_etc"] = dict(id=c + "_etc", name="[…]", parent=c, code="", flags="n", note=f"{len(pr)} further Glottolog branches or languages outside this project, e.g. {eg}", my=None)
# ---------- 4. order, areas ----------
kids = {}
for r in fin.values(): kids.setdefault(r["parent"], []).append(r["id"])
for k in kids: kids[k].sort(key=lambda i: (fin[i]["name"] == "[…]", fin[i]["name"].lower()))
order = []
def dfs(i):
    order.append(i)
    for k in kids.get(i, []): dfs(k)
for r in kids.get("", []): dfs(r)
own = {final_of[m]: g for m, g in own_my.items() if m in final_of}
done = {}
def final(i):
    if i in done: return done[i]
    if i in own: g = own[i]
    else:
        ks = [x for x in (final(k) for k in kids.get(i, [])) if x is not None]
        g = unary_union(ks).buffer(0.03).buffer(-0.03).simplify(0.02) if ks else None
    if g is not None:
        ps = clean(g); g = unary_union(ps) if ps else None
    done[i] = g if g is not None and not g.is_empty else None
    return done[i]
areas = {}
for i in order:
    g = final(i)
    if g is not None: areas[i] = multi([g] if g.geom_type == "Polygon" else [p for p in g.geoms if p.geom_type == "Polygon"])
tree = [[i, fin[i]["name"], fin[i]["parent"], fin[i]["flags"], fin[i]["note"], fin[i]["code"]] for i in order]
src = open(os.path.join(ROOT, "data", "native_src.js"), encoding="utf-8").read()
nat = {final_of[k]: v for k, v in re.findall(r'(\w+):"([^"]*)"', src) if k in final_of}
open(os.path.join(ROOT, "data", "native.js"), "w", encoding="utf-8").write("window.NATIVE=" + json.dumps(nat, ensure_ascii=False, separators=(",", ":")) + ";")
open(os.path.join(ROOT, "data", "base.js"), "w").write("window.BASE=[];")
open(os.path.join(ROOT, "data", "areas.js"), "w").write("window.AREAS=" + json.dumps(areas, separators=(",", ":")) + ";")
open(os.path.join(ROOT, "data", "tree.js"), "w", encoding="utf-8").write("window.TREE=" + json.dumps(tree, ensure_ascii=False, separators=(",", ":")) + ";")
print(len(tree), "nodes,", len(areas), "with shapes,", sum(1 for r in tree if r[5]), "from Glottolog,", sum(1 for r in tree if r[3].endswith("p") or "p" in r[3]), "project-defined,", sum(1 for r in tree if r[1]=="[…]"), "[…]")
for w in sorted(warn): print("WARN", w)

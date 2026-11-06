#!/usr/bin/env python3
"""Download Glottolog (github.com/glottolog/glottolog) and write tools/glottolog.json with the whole classification.
Glottolog is CC BY 4.0: Hammarström, Forkel, Haspelmath & Bank, https://glottolog.org"""
import io, json, os, re, tarfile, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
data = urllib.request.urlopen("https://codeload.github.com/glottolog/glottolog/tar.gz/refs/heads/master").read()
G = {}
with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tf:
    for m in tf:
        if not m.name.endswith("/md.ini") or "/languoids/tree/" not in m.name: continue
        parts = m.name.split("/languoids/tree/")[1].split("/")[:-1]
        t = tf.extractfile(m).read().decode("utf-8").replace("\r", "")
        def f(sec, k):
            s = t.split("[" + sec + "]")
            if len(s) < 2: return ""
            mm = re.search(r"^" + k + r"\s*=\s*(.*)$", s[1].split("\n[")[0], re.M)
            return mm.group(1).strip() if mm else ""
        G[parts[-1]] = dict(id=parts[-1], name=f("core", "name"), parent=parts[-2] if len(parts) > 1 else None, level=f("core", "level"),
                            iso=f("core", "iso639-3"), lat=f("core", "latitude"), lon=f("core", "longitude"), status=f("endangerment", "status"))
json.dump(G, open(os.path.join(HERE, "glottolog.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(len(G), "languoids")

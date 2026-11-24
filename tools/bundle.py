#!/usr/bin/env python3
"""Inline css, js and data into ONE index.html so it works wherever it is put (GitHub Pages root)."""
import re, os, subprocess, shutil
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if shutil.which("node"):  # keeps data/votable.json (what can still be voted for) in step with the data
    subprocess.run(["node", os.path.join(R, "tools", "votable.js")], check=False)
h = open(os.path.join(R, "tools", "index.template.html"), encoding="utf-8").read()
h = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', lambda m: "<style>" + open(os.path.join(R, m.group(1)), encoding="utf-8").read() + "</style>", h)
h = re.sub(r'<script src="((?:data|js)/[^"]+)"></script>', lambda m: "<script>" + open(os.path.join(R, m.group(1)), encoding="utf-8").read().replace("</script", "<\\/script") + "</script>", h)
open(os.path.join(R, "index.html"), "w", encoding="utf-8").write(h)
print("index.html", len(h) // 1024, "KB")

VOTING SERVER (optional; without it the Vote screen runs in demo mode, saving votes only in the visitor's browser)

What it does
- one open language vote and one open word vote per visitor (IP). The vote is released when the item is added to the project.
- shows the newest 10 submissions per list with local time and country/region (location comes from Cloudflare, never the IP).
- the IP is never stored, only a salted hash of it.
- an item is "votable" when it is listed in data/votable.json (rebuilt by tools/bundle.py, or run: node tools/votable.js).
  Deploy the site again after adding polygons/words so the list is updated; votes for items that were added disappear.

Setup (about 10 minutes, free Cloudflare account)
1. npm i -g wrangler        then   wrangler login
2. cd server
3. wrangler d1 create europe_votes       -> copy the database_id into wrangler.toml
4. wrangler d1 execute europe_votes --remote --file=schema.sql
5. edit wrangler.toml: ALLOWED_ORIGIN = your site address, VOTABLE_URL = address of data/votable.json on your site
6. wrangler secret put SALT              -> type any long random text (do not lose it)
7. wrangler deploy                       -> prints the worker address
8. put that address into data/vote-config.js (window.VOTE_API="https://....workers.dev"), run python3 tools/bundle.py, upload index.html + data/votable.json

Privacy note (EU/GDPR): even a hashed IP is personal data. Add one sentence to your site saying that votes are limited per
visitor and a hashed IP is kept until the voted item is added. Nothing else is stored.

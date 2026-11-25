VOTING SERVER, STEP BY STEP (no programming; about 15 minutes; free)

You need: a free Cloudflare account and your site's public address (for example https://yourname.github.io/europe).
Without this server the Vote screen only works in DEMO mode (votes stay in one browser). A static page cannot see IP addresses; the server does that part.

A. Make the database
 1. Go to dash.cloudflare.com and create a free account (email + password).
 2. Left menu: Storage & Databases -> D1 SQL database -> Create database. Name: europe_votes -> Create.
 3. Open the database -> Console tab. Open the file server/schema.sql from this project, copy ALL of it, paste into the console, press Execute.

B. Make the worker (the little program that counts votes)
 4. Left menu: Workers & Pages -> Create -> Create Worker. Name: europe-languages-vote -> Deploy.
 5. Click "Edit code". Delete everything in the editor, open server/worker.js from this project, copy ALL of it, paste it, press Deploy.
 6. Go back to the worker page -> Settings -> Bindings -> Add -> D1 database. Variable name: DB (exactly, capital letters). Database: europe_votes. Save.
 7. Settings -> Variables and Secrets -> Add:
      ALLOWED_ORIGIN   type Text    value = your site address WITHOUT a trailing slash and without the page path, e.g. https://yourname.github.io
      VOTABLE_URL      type Text    value = the address of data/votable.json on your site, e.g. https://yourname.github.io/europe/data/votable.json
      SALT             type Secret  value = any long random text (e.g. 30 random letters). Do not lose it.
    Save and deploy.
 8. Test: open  https://europe-languages-vote.YOUR-NAME.workers.dev/state  in a browser. You should see a block of text starting with {"recent":  . If you see an error, recheck steps 6-7.

C. Connect the site
 9. Open data/vote-config.js and put the worker address between the quotes:  window.VOTE_API="https://europe-languages-vote.YOUR-NAME.workers.dev";
10. Run  python3 tools/bundle.py  (this also rebuilds data/votable.json), then upload index.html AND data/votable.json to your site (keep the folder name "data").
11. Open the site on two phones: a vote made on phone 1 now shows on phone 2, and the same phone/IP cannot vote twice until the item is added.

Each time you add polygons or words: run python3 tools/bundle.py and upload index.html + data/votable.json again. The server reads votable.json (cached up to 5 minutes), so items you added disappear from the voting lists and release their voters.

Privacy (EU/GDPR): the IP address is never stored, only a salted hash of it, together with the item voted for. Location is only country + region from Cloudflare. Add one sentence to your site saying so.

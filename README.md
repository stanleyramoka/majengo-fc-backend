# Majengo FC — Backend & Website

A real backend for the club site: a database (SQLite — a single file, no
separate server to install) plus an API, so the roster, schedule, news,
gallery, and contact messages are all stored for real and editable from
an admin page — no code editing required after setup.

## What's in here

- `server.js` — the web server and API
- `db.js` — creates the database and fills it with starter data the first time it runs
- `public/` — the website itself (what visitors see), plus `admin.html` (what you use to edit content)
- `majengo.db` — the actual database file (created automatically the first time you run the server)

## 1. Run it on your own computer first

You'll need [Node.js](https://nodejs.org) installed (the free "LTS" version).

```
cd majengo-fc-backend
npm install
cp .env.example .env
```

Open `.env` and change `ADMIN_PASSWORD=changeme` to a real password —
this is what protects your admin page.

Then start it:

```
npm start
```

Visit:
- **http://localhost:3000** — the live website
- **http://localhost:3000/admin.html** — log in with your password to add/edit/delete players, fixtures, news, gallery tiles, and view contact messages

Try editing something in the admin panel, then refresh the site — you'll
see it change instantly, because it's now reading from the database
instead of fixed text in the HTML.

## 2. Put it online for real (Render.com — free tier, no credit card)

1. Create a free account at **render.com**
2. Push this folder to a GitHub repository (Render deploys from GitHub). If you're not on GitHub yet, create a free account there first and create a new repo, then upload this folder to it.
3. In Render, click **New → Web Service**, connect your GitHub repo
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Under **Environment**, add a variable: `ADMIN_PASSWORD` = your real password
6. Under **Disks**, add a small persistent disk (e.g. 1 GB) mounted at `/opt/render/project/src` — this keeps your database from being wiped every time you redeploy. (Render's docs walk through this if the exact path is confusing — ask their chat or search "Render persistent disk".)
7. Click **Deploy** — Render gives you a live URL like `majengo-fc.onrender.com`

That URL is your real, working website — visitors can browse it, submit
the contact form, and you can log into `/admin.html` from anywhere to
manage content.

## Notes

- The free Render tier "sleeps" after inactivity and takes ~30 seconds
  to wake up on the next visit. Fine for a small club site; upgrade
  later if that matters to you.
- Back up `majengo.db` occasionally (download it from your Render disk,
  or just keep a copy) — it's your entire database in one file.
- If you ever want a nicer custom domain (like `majengofc.com`), you
  can buy one from any registrar and point it at your Render service —
  happy to walk through that when you're ready.

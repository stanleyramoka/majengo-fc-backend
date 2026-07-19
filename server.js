// server.js — the whole backend.
// Public API (no login): read players/fixtures/news/gallery, submit contact form.
// Admin API (needs the password): create/edit/delete everything, read messages.
//
// Run locally with:  npm install   then   npm start
// Then visit http://localhost:3000  (site)  and  http://localhost:3000/admin.html  (admin panel)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Admin auth ----------
// Simple approach: the admin panel asks for the password once, then sends it
// on every admin request in the x-admin-password header. No accounts, no
// sessions — good enough for one club, one admin.
function requireAdmin(req, res, next) {
  const provided = req.header('x-admin-password');
  if (provided !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect admin password' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false, error: 'Incorrect password' });
});

// ---------- Players ----------
app.get('/api/players', (req, res) => {
  const rows = db.prepare('SELECT * FROM players ORDER BY category, squad_number').all();
  res.json(rows);
});
app.post('/api/players', requireAdmin, (req, res) => {
  const { squad_number, name, category, role_note } = req.body;
  const info = db.prepare('INSERT INTO players (squad_number, name, category, role_note) VALUES (?, ?, ?, ?)')
    .run(squad_number, name, category, role_note);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/players/:id', requireAdmin, (req, res) => {
  const { squad_number, name, category, role_note } = req.body;
  db.prepare('UPDATE players SET squad_number=?, name=?, category=?, role_note=? WHERE id=?')
    .run(squad_number, name, category, role_note, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/players/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM players WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- Fixtures ----------
app.get('/api/fixtures', (req, res) => {
  const rows = db.prepare('SELECT * FROM fixtures ORDER BY id DESC').all();
  res.json(rows);
});
app.post('/api/fixtures', requireAdmin, (req, res) => {
  const { matchday, home_team, away_team, match_date, match_time, venue, status, score, result } = req.body;
  const info = db.prepare(`INSERT INTO fixtures (matchday, home_team, away_team, match_date, match_time, venue, status, score, result)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(matchday, home_team, away_team, match_date, match_time, venue, status, score, result);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/fixtures/:id', requireAdmin, (req, res) => {
  const { matchday, home_team, away_team, match_date, match_time, venue, status, score, result } = req.body;
  db.prepare(`UPDATE fixtures SET matchday=?, home_team=?, away_team=?, match_date=?, match_time=?, venue=?, status=?, score=?, result=? WHERE id=?`)
    .run(matchday, home_team, away_team, match_date, match_time, venue, status, score, result, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/fixtures/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM fixtures WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- News ----------
app.get('/api/news', (req, res) => {
  const rows = db.prepare('SELECT * FROM news ORDER BY id DESC').all();
  res.json(rows);
});
app.post('/api/news', requireAdmin, (req, res) => {
  const { matchday, published_date, title, body } = req.body;
  const info = db.prepare('INSERT INTO news (matchday, published_date, title, body) VALUES (?,?,?,?)')
    .run(matchday, published_date, title, body);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/news/:id', requireAdmin, (req, res) => {
  const { matchday, published_date, title, body } = req.body;
  db.prepare('UPDATE news SET matchday=?, published_date=?, title=?, body=? WHERE id=?')
    .run(matchday, published_date, title, body, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/news/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM news WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- Gallery ----------
app.get('/api/gallery', (req, res) => {
  const rows = db.prepare('SELECT * FROM gallery ORDER BY id').all();
  res.json(rows);
});
app.post('/api/gallery', requireAdmin, (req, res) => {
  const { label, color_start, color_end, image_url } = req.body;
  const info = db.prepare('INSERT INTO gallery (label, color_start, color_end, image_url) VALUES (?,?,?,?)')
    .run(label, color_start, color_end, image_url || null);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/gallery/:id', requireAdmin, (req, res) => {
  const { label, color_start, color_end, image_url } = req.body;
  db.prepare('UPDATE gallery SET label=?, color_start=?, color_end=?, image_url=? WHERE id=?')
    .run(label, color_start, color_end, image_url || null, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/gallery/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM gallery WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- Settings (site-wide text: tagline, founding year, contact info, etc.) ----------
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});
app.put('/api/settings', requireAdmin, (req, res) => {
  const updates = req.body; // { key: value, key2: value2, ... }
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  Object.entries(updates).forEach(([key, value]) => stmt.run(key, value));
  res.json({ ok: true });
});

// ---------- Contact messages ----------
app.post('/api/contact', (req, res) => {
  const { name, email, interest, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  db.prepare('INSERT INTO contact_messages (name, email, interest, message) VALUES (?,?,?,?)')
    .run(name, email, interest || null, message);
  res.json({ ok: true });
});
app.get('/api/contact', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.json(rows);
});
app.put('/api/contact/:id/read', requireAdmin, (req, res) => {
  db.prepare('UPDATE contact_messages SET read=1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
app.delete('/api/contact/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM contact_messages WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Majengo FC server running on http://localhost:${PORT}`);
  console.log(`Admin panel:              http://localhost:${PORT}/admin.html`);
});

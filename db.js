// db.js — creates the SQLite database file (majengo.db) and tables the
// first time the server runs, and seeds them with starter data so the
// site isn't empty on first load. Safe to run every time the server
// starts — it only creates/seeds if things don't already exist.
//
// Uses Node's own built-in SQLite support (node:sqlite) — no extra
// package to compile or install.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'majengo.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    squad_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    role_note TEXT
  );

  CREATE TABLE IF NOT EXISTS fixtures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchday TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    match_date TEXT NOT NULL,
    match_time TEXT,
    venue TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    score TEXT,
    result TEXT
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchday TEXT,
    published_date TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    color_start TEXT NOT NULL,
    color_end TEXT NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    interest TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    read INTEGER NOT NULL DEFAULT 0
  );
`);

const count = (table) => db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;

if (count('players') === 0) {
  const stmt = db.prepare('INSERT INTO players (squad_number, name, category, role_note) VALUES (?, ?, ?, ?)');
  [
    [1, 'Brian Wafula', 'Goalkeepers', 'Goalkeeper · Captain'],
    [22, 'Felix Omondi', 'Goalkeepers', 'Goalkeeper'],
    [2, 'Dennis Kariuki', 'Defenders', 'Right-back'],
    [4, 'Samuel Mwangi', 'Defenders', 'Centre-back'],
    [5, 'Joseph Kimani', 'Defenders', 'Centre-back'],
    [3, 'Peter Ndungu', 'Defenders', 'Left-back'],
    [14, 'Victor Njoroge', 'Defenders', 'Centre-back'],
    [6, 'Collins Achieng', 'Midfielders', 'Defensive midfield'],
    [8, 'Antony Mutiso', 'Midfielders', 'Central midfield'],
    [10, 'David Otieno', 'Midfielders', 'Attacking midfield · Vice-captain'],
    [7, 'Emmanuel Barasa', 'Midfielders', 'Right wing'],
    [11, 'Kevin Otiende', 'Midfielders', 'Left wing'],
    [9, 'Michael Ouma', 'Forwards', 'Striker'],
    [17, 'Ibrahim Hassan', 'Forwards', 'Striker'],
    [19, 'Patrick Wekesa', 'Forwards', 'Forward']
  ].forEach(row => stmt.run(...row));
  console.log('Seeded players');
}

if (count('fixtures') === 0) {
  const stmt = db.prepare(`INSERT INTO fixtures (matchday, home_team, away_team, match_date, match_time, venue, status, score, result)
    VALUES (?,?,?,?,?,?,?,?,?)`);
  [
    ['MD13', 'Majengo FC', 'Kibera United', 'Sat 25 Jul', '16:00', 'Majengo Grounds (Home)', 'upcoming', null, null],
    ['MD14', 'Eastleigh Stars', 'Majengo FC', 'Sat 1 Aug', '15:30', 'Eastleigh Community Field (Away)', 'upcoming', null, null],
    ['MD15', 'Majengo FC', 'Riverside Rovers', 'Sat 8 Aug', '16:00', 'Majengo Grounds (Home)', 'upcoming', null, null],
    ['MD12', 'Majengo FC', 'Bahati Rangers', 'Sun 12 Jul', null, 'Majengo Grounds', 'result', '2–1', 'W'],
    ['MD11', 'Langata Lions', 'Majengo FC', 'Sun 5 Jul', null, 'Langata Sports Ground', 'result', '1–1', 'D'],
    ['MD10', 'Majengo FC', 'Pumwani Panthers', 'Sun 28 Jun', null, 'Majengo Grounds', 'result', '3–0', 'W'],
    ['MD9', 'Ziwani City', 'Majengo FC', 'Sun 21 Jun', null, 'Ziwani Grounds', 'result', '0–2', 'L']
  ].forEach(row => stmt.run(...row));
  console.log('Seeded fixtures');
}

if (count('news') === 0) {
  const stmt = db.prepare('INSERT INTO news (matchday, published_date, title, body) VALUES (?,?,?,?)');
  [
    ['MD12', '13 Jul 2026', 'Late Otieno header snatches derby win', "A stoppage-time header from David Otieno settled a tense local derby against Bahati Rangers on Sunday, sending the home end at Majengo Grounds into a roar. The 2-1 win keeps the club's unbeaten home run alive this season."],
    ['MD11', '6 Jul 2026', 'New floodlights land at Majengo Grounds', "Two years of community fundraising has paid off: floodlights are now installed pitch-side, and the club's first evening fixture is confirmed for next month. A small ceremony is planned before kickoff."],
    ['MD10', '29 Jun 2026', 'Youth trials open for the Under-16s', "Majengo FC's academy is opening ten new spots for local players aged 14–16. Trials run over two Saturdays at Majengo Grounds — no prior club experience required."],
    ['MD9', '22 Jun 2026', 'Away-day defeat at Ziwani City', "A slow start away from home cost the squad, going down 2-0 to Ziwani City. Coaching staff say the focus this week is on tightening up the back line before the derby."]
  ].forEach(row => stmt.run(...row));
  console.log('Seeded news');
}

if (count('gallery') === 0) {
  const stmt = db.prepare('INSERT INTO gallery (label, color_start, color_end, image_url) VALUES (?,?,?,?)');
  [
    ['Matchday', '#F4C430', '#C9960C', null],
    ['Training', '#1F4D36', '#2E6B4C', null],
    ['Community', '#16181D', '#2b2f38', null],
    ['Youth Academy', '#2E6B4C', '#F4C430', null],
    ['Derby Day', '#C9960C', '#16181D', null],
    ['Fans', '#1F4D36', '#F4C430', null]
  ].forEach(row => stmt.run(...row));
  console.log('Seeded gallery');
}

if (count('settings') === 0) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  [
    ['club_name', 'Majengo FC'],
    ['founded_year', '2011'],
    ['hero_eyebrow', 'Home of Majengo Football Club'],
    ['hero_tagline', 'Every street has a striker.'],
    ['hero_description', "Founded on a dirt pitch in Majengo, built by the neighbourhood. Fifteen seasons on, we're still playing for the same badge."],
    ['league_position', '3rd'],
    ['home_ground', 'Majengo Grounds'],
    ['training_schedule', 'Training: Tue & Thu, 17:30'],
    ['contact_email', 'info@majengofc.example'],
    ['contact_phone', '+254 700 000 000']
  ].forEach(row => stmt.run(...row));
  console.log('Seeded settings');
}

module.exports = db;

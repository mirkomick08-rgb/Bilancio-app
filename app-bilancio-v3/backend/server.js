import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();
const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.DB_FILE || './budget.sqlite';
const dbPath = path.resolve(__dirname, DB_FILE);

const dbExists = fs.existsSync(dbPath);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('expense','income')) NOT NULL,
    categoryId TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    FOREIGN KEY(categoryId) REFERENCES categories(id)
  )`);

  if (!dbExists) {
    try {
      const seed = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/seed.json'), 'utf-8'));
      const stmtCat = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)');
      seed.categories.forEach(c => stmtCat.run(c.id, c.name, c.color));
      stmtCat.finalize();

      const stmtTrx = db.prepare('INSERT INTO transactions (id, type, categoryId, amount, date, note) VALUES (?, ?, ?, ?, ?, ?)');
      seed.transactions.forEach(t => stmtTrx.run(t.id, t.type, t.categoryId, t.amount, t.date, t.note));
      stmtTrx.finalize();
      console.log('Seed iniziale importato.');
    } catch (e) {
      console.warn('Seed non importato:', e.message);
    }
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/categories', (req, res) => {
  const { name, color } = req.body || {};
  if (!name || !color) return res.status(400).json({ error: 'name e color richiesti' });
  const id = uuidv4();
  db.run('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', [id, name, color], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, name, color });
  });
});

app.get('/transactions', (req, res) => {
  const { from, to } = req.query;
  let where = [];
  let params = [];
  if (from) { where.push('date >= ?'); params.push(from); }
  if (to)   { where.push('date <= ?'); params.push(to); }
  const sql = `SELECT * FROM transactions ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY date DESC, rowid DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/transactions', (req, res) => {
  const { type, categoryId, amount, date, note } = req.body || {};
  if (!['expense','income'].includes(type)) return res.status(400).json({ error: 'type non valido' });
  if (!categoryId || typeof amount !== 'number' || !date) return res.status(400).json({ error: 'categoryId, amount, date richiesti' });
  const id = uuidv4();
  db.run('INSERT INTO transactions (id, type, categoryId, amount, date, note) VALUES (?, ?, ?, ?, ?, ?)',
    [id, type, categoryId, amount, date, note || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, type, categoryId, amount, date, note: note || null });
    }
  );
});

app.delete('/transactions/:id', (req, res) => {
  db.run('DELETE FROM transactions WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });
});

app.get('/stats', (req, res) => {
  const month = req.query.month; // 'YYYY-MM'
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'month=YYYY-MM richiesto' });
  }
  const from = `${month}-01`;
  const to = `${month}-31`;
  const sql = `SELECT type, categoryId, SUM(amount) as total FROM transactions WHERE date BETWEEN ? AND ? GROUP BY type, categoryId`;
  db.all(sql, [from, to], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    let income = 0, expense = 0;
    const byCategory = {};
    rows.forEach(r => {
      if (r.type === 'income') income += r.total;
      if (r.type === 'expense') expense += r.total;
      byCategory[r.categoryId] = byCategory[r.categoryId] || { income: 0, expense: 0 };
      byCategory[r.categoryId][r.type] = r.total;
    });
    res.json({ income, expense, balance: income - expense, byCategory });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API pronta su http://localhost:${PORT}`));

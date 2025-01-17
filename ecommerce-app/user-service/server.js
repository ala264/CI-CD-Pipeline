const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const app = express();
const db = new sqlite3.Database('./user-database.sqlite');

app.use(express.json());

// Create Users Table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )
`);

// API Endpoint: Register User
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// API Endpoint: Login User
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    res.status(200).json({ message: 'Login successful', user });
  });
});

app.delete('/deleteUser', (req, res) => {
  const { id } = req.body;

  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // No rows were deleted, meaning the product ID does not exist
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json({ message: 'User deleted successfully' });
  });
});


app.get('/getUsers', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(80, () => {
    console.log('User Service listening on http://localhost:3001');
  });
}
module.exports = app;

const express = require('express');
//const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
//const db = new sqlite3.Database('./user-database.sqlite');

// Setup PostgreSQL connection pool with hardcoded credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


app.use(express.json());

// Create Users Table
/*
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )
`);
*/

// API Endpoint: Register User
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, password]
    );
    client.release();
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint: Login User
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint: Delete User
app.delete('/deleteUser', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// API Endpoint: Get All Users
app.get('/getUsers', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    client.release();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(80, () => {
    console.log('User Service listening on http://localhost:80');
  });
}
module.exports = app;

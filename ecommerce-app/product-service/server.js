const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./product-database.sqlite');

app.use(express.json());

// Create Products Table
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
  )
`);

// API Endpoint: Add Product
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  db.run('INSERT INTO products (name, price) VALUES (?, ?)', [name, price], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// API Endpoint: List Products
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/products', (req, res) => {
  const { id } = req.body;

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // No rows were deleted, meaning the product ID does not exist
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(201).json({ message: 'Product deleted successfully' });
  });
});
// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(3002, () => {
    console.log('Product Service listening on http://localhost:3002');
  });
}
module.exports = app;

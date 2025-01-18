const express = require('express');
const { Pool } = require('pg');
require('dotenv').config()

const app = express();

// Setup PostgreSQL connection pool with hardcoded credentials
const pool = new Pool({
    connectionString:  process.env.DATABASE_URL,
  });


app.use(express.json());


// API Endpoint: Add Product
app.post('/addProduct', async (req, res) => {
  const { name, price } = req.body;
  try{
    const client = await pool.connect()
    const result = await client.query(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id',
      [name, price]
    );
    client.release()
    res.status(201).json({id: result.rows[0].id})
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint: List Products
app.get('/getProducts', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products');
    client.release();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/deleteProduct', async (req, res) => {
  const { id } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(201).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(81, () => {
    console.log('Product Service listening on http://localhost:81');
  });
}
module.exports = app;

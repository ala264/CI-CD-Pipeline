const request = require('supertest');
const app = require('../server'); // Import the Express app
const sqlite3 = require('sqlite3');
let db;
beforeAll(() => {
  db = new sqlite3.Database('./product-database.sqlite');
});
beforeEach(async () => {
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM products', (err) => {
      if (err) reject(err);
      resolve();
    });
  });
});
afterAll(() => {
  db.close();
});
test('Should add a new product successfully', async () => {
  const response = await request(app)
    .post('/products')
    .send({ name: 'Product A', price: 99.99 });
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty('id');
});
test('Should list all products successfully', async () => {
  // Add two products first
  await request(app).post('/products').send({ name: 'Product A', price: 99.99 });
  await request(app).post('/products').send({ name: 'Product B', price: 49.99 });
  // Get the list of products
  const response = await request(app).get('/products');
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBeGreaterThanOrEqual(2);
  // Check if the added products are in the response
  const productNames = response.body.map((product) => product.name);
  expect(productNames).toContain('Product A');
  expect(productNames).toContain('Product B');
});
test('Should delete a product successfully', async () => {
  // Add a product first
  const addResponse = await request(app)
    .post('/products')
    .send({ name: 'Product C', price: 29.99 });
  const productId = addResponse.body.id;
  // Delete the product
  const deleteResponse = await request(app)
    .delete('/products')
    .send({ id: productId });
  expect(deleteResponse.statusCode).toBe(201);
  expect(deleteResponse.body.message).toBe('Product deleted successfully');
  // Verify the product is deleted
  const getResponse = await request(app).get('/products');
  const products = getResponse.body;
  const productExists = products.some((product) => product.id === productId);
  expect(productExists).toBe(false);
});
test('Should return 404 for invalid product deletion', async () => {
  // Attempt to delete a non-existent product
  const response = await request(app)
    .delete('/products')
    .send({ id: 9999 });
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty('error');
});

afterAll(() => {
  server.close();
});
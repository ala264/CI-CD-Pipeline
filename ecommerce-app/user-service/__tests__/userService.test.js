const request = require('supertest');
const app = require('../server');
const sqlite3 = require('sqlite3');
beforeEach(async () => {
  const db = new sqlite3.Database('./user-database.sqlite');
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM users', (err) => {
      if (err) reject(err);
      resolve();
    });
  });
});
afterAll(() => {
  const db = new sqlite3.Database('./user-database.sqlite');
  db.close();
});
test('Should register a new user successfully', async () => {
  const response = await request(app)
    .post('/register')
    .send({ username: 'testuser', password: 'testpass' });
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty('id');
});
test('Should login a user successfully', async () => {
  await request(app).post('/register').send({ username: 'testuser', password: 'testpass' });
  const response = await request(app).post('/login').send({ username: 'testuser', password: 'testpass' });
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('Login successful');
});
test('Should fail login with invalid credentials', async () => {
  const response = await request(app).post('/login').send({ username: 'wronguser', password: 'wrongpass' });
  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBe('Invalid credentials');
});
test('Should delete a user successfully', async () => {
  // Register a new user first
  const registerResponse = await request(app)
    .post('/register')
    .send({ username: 'deleteuser', password: 'deletepass' });
  const userId = registerResponse.body.id;
  // Delete the user
  const deleteResponse = await request(app)
    .delete('/deleteUser')
    .send({ id: userId });
  expect(deleteResponse.statusCode).toBe(201);
  expect(deleteResponse.body.message).toBe('User deleted successfully');
  // Verify the user is deleted
  const getResponse = await request(app).get('/getUsers');
  const users = getResponse.body;
  const userExists = users.some((user) => user.id === userId);
  expect(userExists).toBe(false);
});
test('Should get all users successfully', async () => {
  // Register two users
  await request(app).post('/register').send({ username: 'user1', password: 'pass1' });
  await request(app).post('/register').send({ username: 'user2', password: 'pass2' });
  // Get all users
  const response = await request(app).get('/getUsers');
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBeGreaterThanOrEqual(2);
  // Check if the registered users exist
  const usernames = response.body.map((user) => user.username);
  expect(usernames).toContain('user1');
  expect(usernames).toContain('user2');
});
test('Should return 404 for invalid user deletion', async () => {
  // Attempt to delete a non-existent product
  const response = await request(app)
    .delete('/deleteUser')
    .send({ id: 9999 });
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty('error');
});
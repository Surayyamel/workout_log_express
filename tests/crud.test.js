const app = require('../index');
const passport = require('passport');
const request = require('supertest');

it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
});

it('Testing supertest', async () => {
    const response = await request(app).get('/test');
    expect(response.statusCode).toBe(200);
});

it('Does not GET workouts if not logged in', async () => {
    const response = await request(app).get('/workout/2021-05-21');
    expect(response.statusCode).toBe(401);
});


it('should get', async () => {
    // log in?

    const response = await request(app).get('/workout/2021-05-21');

    expect(response.statusCode).toBe(200)
})

// Mock the login strategy?

// Drop, create and fill test DB before all tests?



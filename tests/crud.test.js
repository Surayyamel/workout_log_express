const app = require('../index');
const passport = require('passport');
const request = require('supertest');
//const {sortData} = require('../routes/crudRoutes');

it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
});

// it('Testing supertest', async () => {
//     const response = await request(app).get('/test');
//     expect(response.statusCode).toBe(200);
// });

it('Does not GET workouts if not logged in', async () => {
    const response = await request(app).get('/workout/2021-05-21');
    expect(response.statusCode).toBe(401);
});


// it('should sort the requested reps and weight rows into an object containing one property per exercise', async () => {
//     expect.assertions(4)
//     const exercise = {
//         reps: [
//             { id: 344, name: 'Squats', sets: 1, reps: 2 },
//             { id: 343, name: 'Squats', sets: 2, reps: 3 },
//             { id: 343, name: 'Squats', sets: 2, reps: 1 },
//         ],
//         weight: [
//             { id: 344, name: 'Squats', sets: 1, weight: 2 },
//             { id: 343, name: 'Squats', sets: 2, weight: 2 },
//             { id: 343, name: 'Squats', sets: 2, weight: 2 },
//         ],
//     };
//     const workout = {};

//     sortData(exercise, workout);

//     expect(Object.keys(workout).length).toBe(2);
//     expect(workout['343'].name).toBe('Squats');
//     expect(workout['344'].sets).toBe(1);
//     expect(workout['343'].weight.length).toBe(2)
// });
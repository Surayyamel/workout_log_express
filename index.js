const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors(), express.json());

app.get('/workout/:id/:date', async (req, res) => {
    try {
        const { id, date } = req.params;

        const exerciseReps = await pool.query(
            `
            SELECT e.id, name, sets, reps
            FROM exercise e, reps r
            WHERE e.id = r.exercise_id AND user_id = $1 AND created_at = $2
            `,
            [id, date]
        );

        const exerciseWeight = await pool.query(
            `
            SELECT e.id, name, sets, weight
            FROM exercise e, weight w
            WHERE e.id = w.exercise_id AND user_id = $1 AND created_at = $2
            `,
            [id, date]
        );

        const exercise = {
            reps: exerciseReps.rows,
            weight: exerciseWeight.rows,
        };

        const workout = {};

        const sortData = (data) => {
            //if exercise id doesn't exsist add it with id and name, if it does push reps and weight to arrays
            data.reps.map((obj) => {
                workout[obj.id]
                    ? workout[obj.id].reps.push(obj.reps)
                    : (workout[obj.id] = {
                          name: obj.name,
                          sets: obj.sets,
                          reps: [obj.reps],
                      });
            });
            // SOMETIMES ERROR -> Cannot read property 'weight' of undefined.. But it fetches correctly?
            data.weight.map((obj) => {
                workout[obj.id].weight
                    ? workout[obj.id].weight.push(obj.weight)
                    : (workout[obj.id].weight = [obj.weight]);
            });
        };

        sortData(exercise);

        res.status(200).json(workout);
    } catch (err) {
        console.error('THIS ERROR IS FROM THE GET CATCH BLOCK ', err);
    }
});

app.post('/workout/:id/:date', async (req, res) => {
    try {
        const { id, date } = req.params;

        const exercise = await pool.query(
            `
            INSERT INTO exercise (user_id, created_at, name, sets)
            VALUES (1, $1, $2, $3) RETURNING id;
            `,
            [date, req.body.exerciseName, req.body.numberOfSets]
        );

        const exerciseId = exercise.rows[0].id;

        const reps = [];
        const weight = [];

        for (const property in req.body) {
            if (property.includes('reps')) {
                reps.push(req.body[property]);
            } else if (property.includes('weight')) {
                weight.push(req.body[property]);
            }
        }

        weight.forEach((weight) => {
            pool.query(
                `
                INSERT INTO weight (weight, exercise_id)
                VALUES ($1, $2)
                `,
                [weight, exerciseId]
            );
        });

        reps.forEach((rep) => {
            pool.query(
                `
                INSERT INTO reps (reps, exercise_id)
                VALUES ($1, $2)
                `,
                [rep, exerciseId]
            );
        });

        res.status(200).json();
    } catch (err) {
        console.error(err);
    }
});

app.put('/workout/:id/:date', async (req, res) => {
    try {
        const { id, exerciseName, numberOfSets } = req.body;

        // The reps and weight from the request body
        const reps = [];
        const weight = [];

        // Sorting the reps and weight form the request body into seperate arrays
        for (const property in req.body) {
            if (property.includes('reps')) {
                reps.push(req.body[property]);
            } else if (property.includes('weight')) {
                weight.push(req.body[property]);
            }
        }

        //UPDATING THE REPS
        // Grabbing the IDs of the reps we need to UPDATE
        const repsId = await pool.query(
            `
            SELECT id
            FROM reps
            WHERE exercise_id = $1
        `,
            [id]
        );

        // Array of IDs of the reps we need to update
        repsIdArray = [];
        repsId.rows.map((id) => {
            repsIdArray.push(id.id);
        });

        for (let i = 0; i < reps.length; i++) {
            await pool.query(
                `
                    UPDATE reps 
                    SET reps = $1
                    WHERE reps.id = $2
                `,
                [reps[i], repsIdArray[i]]
            );
        }

        // UPDATING THE weight
        // Grabbing the IDs of the weights we need to UPDATE
        const weightsId = await pool.query(
            `
                SELECT id
                FROM weight
                WHERE exercise_id = $1
            `,
            [id]
        );

        //Array of IDs of the weights we need to update
        weightsIdArray = [];

        weightsId.rows.map((id) => {
            weightsIdArray.push(id.id);
        });

        for (let i = 0; i < weight.length; i++) {
            await pool.query(
                `
                    UPDATE weight 
                    SET weight = $1
                    WHERE weight.id = $2
                `,
                [weight[i], weightsIdArray[i]]
            );
        }

        // CREATE A NEW ARRAY FOR THE NEW REPS TO INSERT THEM INTO THE DATABASE
        // slice the reps array to get the second half, slice by the length of the repsIdsArray (that's what we have in the DB already)
        const newlyAddedReps = reps.slice(repsIdArray.length);
        const newlyAddedWeight = weight.slice(weightsIdArray.length);

        // INSERT THE NEWLY ADDED REPS INTO THE DB WITH THE EXERCISE ID
        if (newlyAddedReps.length !== 0 || newlyAddedWeight.length !== 0) {
            newlyAddedReps.forEach(async (rep) => {
                await pool.query(
                    `
                        INSERT INTO reps (reps, exercise_id)
                        VALUES ($1, $2)
                        
                    `,
                    [rep, id]
                );
            });

            newlyAddedWeight.forEach(async (weight) => {
                await pool.query(
                    `
                        INSERT INTO weight (weight, exercise_id)
                        VALUES ($1, $2)
                    `,
                    [weight, id]
                );
            });
        }

        // UPDATING THE EXERCISE
        await pool.query(
            `
                UPDATE exercise 
                SET name = $1, sets = $2
                WHERE id = $3
            `,
            [exerciseName, numberOfSets, id]
        );

        res.status(200).json();
    } catch (err) {
        console.error(err);
    }
});

app.delete('/workout/:id', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query(
            `
                DELETE FROM exercise
                WHERE id = $1
            `, [id]
        );
        
        res.status(200).json();
    } catch (err) {
        console.error(err)
    }
   
    res.status(200).json();
});

app.listen(3001, () => {
    console.log('server up on port 3001');
});

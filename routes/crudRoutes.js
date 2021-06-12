const router = require('express').Router();
const pool = require('../db');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/test', async (req, res) => {
    res.status(200).json('yes');
});

const sortData = (data, workout) => {
    //if exercise id doesn't exist add it to workout object with id and name, if it does push reps and weight to arrays
    data.reps.map((obj) => {
        workout[obj.id]
            ? workout[obj.id].reps.push(obj.reps)
            : (workout[obj.id] = {
                  name: obj.name,
                  sets: obj.sets,
                  reps: [obj.reps],
              });
    });
    data.weight.map((obj) => {
        workout[obj.id].weight
            ? workout[obj.id].weight.push(obj.weight)
            : (workout[obj.id].weight = [obj.weight]);
    });
};

router.get('/workout/:date', isLoggedIn, async (req, res) => {
    try {
        const { date } = req.params;
        const id = req.user.id;

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
            weight: exerciseWeight.rows
        };

        const workout = {};

        sortData(exercise, workout);

        console.log(workout)

        res.status(200).json(workout);
    } catch (error) {
        console.error('THIS ERROR IS FROM THE GET CATCH BLOCK ', error);
    }
});

router.get('/workout/:date/name', isLoggedIn, async (req, res) => {
    try {
        const workoutName = await pool.query(
            `
                SELECT name
                FROM workout_names
                WHERE user_id = $1 AND workout_date = $2
            `,
            [req.user.id, req.params.date]
        );

        res.status(200).json(workoutName.rows[0] || 'No name');
    } catch (error) {
        console.error(error);
    }
});

router.get('/workout/:date/filled', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.user;
        const filledDates = await pool.query(
            `
            SELECT created_at
            FROM exercise
            WHERE user_id = $1
            UNION 
            SELECT workout_date 
            FROM workout_names
            WHERE user_id = $1
            `,
            [id]
        );

        const datesArray = filledDates.rows.map((date) => {
            return date.created_at;
        });

        res.status(200).json(datesArray);
    } catch (error) {
        console.error(error);
    }
});

router.post('/workout/:date/name', isLoggedIn, async (req, res) => {
    const { date, name } = req.body;

    const workoutName = await pool.query(
        `
        INSERT INTO workout_names (user_id, name, workout_date)
        VALUES ($1, $2, $3)
        RETURNING name
    `,
        [req.user.id, name, date]
    );

    res.status(201).json(workoutName.rows[0].name);
});

router.post('/workout/:date', isLoggedIn, async (req, res) => {
    try {
        const { date } = req.params;
        const id = req.user.id;

        const exercise = await pool.query(
            `
            INSERT INTO exercise (user_id, created_at, name, sets)
            VALUES ($1, $2, $3, $4) RETURNING id;
            `,
            [id, date, req.body.exerciseName, req.body.numberOfSets]
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

        for (const element of weight) {
            const intWeight = parseInt(element);
            await pool.query(
                `
                INSERT INTO weight (weight, exercise_id)
                VALUES ($1, $2)
                RETURNING id
                `,
                [intWeight, exerciseId]
            );
        }

        for (const element of reps) {
            const intRep = parseInt(element);
            await pool.query(
                `
                INSERT INTO reps (reps, exercise_id)
                VALUES ($1, $2)
                RETURNING id
                `,
                [intRep, exerciseId]
            );
        }

        res.status(201).json();
    } catch (err) {
        console.error(err);
    }
});

router.put('/workout/:date/name', isLoggedIn, async (req, res) => {
    try {
        const { name, date } = req.body;
        const newName = await pool.query(
            `
                UPDATE workout_names
                SET name = $1
                WHERE user_id = $2 AND workout_date = $3
                RETURNING name
            `,
            [name, req.user.id, date]
        );

        res.status(201).json(newName.rows[0]);
    } catch (error) {
        console.log(error);
    }
});

router.put('/workout/:date', isLoggedIn, async (req, res) => {
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
        // Grabbing the IDs of the reps we need to update
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

        // UPDATING THE WEIGHT
        // Grabbing the IDs of the weights we need to update
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

        res.status(201).json('updated');
    } catch (err) {
        console.error(err);
    }
});

router.delete('/workout', isLoggedIn, async (req, res) => {
    // exercise id
    const { id } = req.body;
    try {
        await pool.query(
            `
                DELETE FROM exercise
                WHERE id = $1
            `,
            [id]
        );

        res.status(200).json();
    } catch (err) {
        console.error(err);
    }

    res.status(200).json();
});

// DELETE ROUTE FOR WORKOUT NAME
router.delete('/workout/:date/name', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.user;
        const { date } = req.params;

        await pool.query(
            `
                DELETE FROM workout_names
                WHERE user_id = $1 AND workout_date = $2
            `,
            [id, date]
        );
        res.status(200).json('deleted');
    } catch (error) {
        console.error(error);
    }
});

module.exports = {crudRoutes: router, sortData};

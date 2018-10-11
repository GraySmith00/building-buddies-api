const express = require('express');

const router = express.Router();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// get all interests
router.get('/', (req, res) => {
  if (req.param('interest')) {
    const interest_name = req.param('interest');
    return database('interests')
      .where('name', interest_name)
      .then((interest) => {
        if (!interest.length) {
          return res.status(404).json({ error: `Interest ${interest_name} is not valid.` });
        }
        database('user_interests')
          .where('interest_id', interest[0].id)
          .then((userInterests) => {
            const userPromises = userInterests.map(userInterest => database('users')
              .where('id', userInterest.user_id)
              .then(user => user[0].name));

            return Promise.all(userPromises);
          })
          .then(allUsers => res.status(200).json(allUsers));
      })
      .catch(err => res.status(500).json({ err }));
  }


  database('interests')
    .select()
    .then(interests => res.status(200).json(interests))
    .catch(err => res.status(500).json({ err }));
});

// create new interest
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(422).send({
      error:
        "Expected format: { name: <String> }. You're missing a name property.",
    });
  }

  const newInterest = { name: name.toLowerCase() };

  database('interests')
    .where('name', newInterest.name)
    .then((response) => {
      if (response.length > 0) {
        return res.status(409).send({
          error: 'That interest already exists',
        });
      }
      return database('interests')
        .insert(newInterest, 'id')
        .then(interest => res.status(201).json({ id: interest[0] }))
        .catch(err => res.status(500).json({ err }));
    })
    .catch(err => res.status(500).json({ err }));
});

// get all users with a certain interest
// router.get('/', (req, res) => {
//   const interest_name = req.param('interest');
//   console.log(interest_name)
// });

module.exports = router;

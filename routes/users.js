const express = require('express');

const router = express.Router();

// get all users
router.get('/', (req, res) => {
  res.send('get all users');
});

module.exports = router;

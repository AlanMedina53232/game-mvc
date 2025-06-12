const express = require('express');
const router = express.Router();
const { saveScore } = require('../controllers/playerController');

router.post('/', saveScore);

module.exports = router;

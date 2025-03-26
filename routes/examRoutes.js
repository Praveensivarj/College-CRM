const express = require('express');
const router = express.Router();
const {addExams} = require('../controllers/examsController');

router.post('/addExams', addExams);

module.exports = router;
const express = require('express');
const router = express.Router();
const {addExams} = require('../controllers/exams');

router.post('/addExams', addExams);

module.exports = router;
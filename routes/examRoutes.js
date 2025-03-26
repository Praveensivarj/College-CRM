const express = require('express');
const router = express.Router();
const { addExams, updateExams } = require('../controllers/examsController');

router.post('/addExams', addExams);
router.put('/update', updateExams);

module.exports = router;
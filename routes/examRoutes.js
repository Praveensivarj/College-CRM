const express = require('express');
const router = express.Router();
const { addExams, updateExams, deleteExams } = require('../controllers/examsController');

router.post('/addExams', addExams);
router.put('/update', updateExams);
router.delete('/delete', deleteExams);

module.exports = router;
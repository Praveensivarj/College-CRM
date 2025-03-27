const express = require('express');
const router = express.Router();
const { tokenGenerate, addExams, updateExams, deleteExams } = require('../controllers/examsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/addExams', addExams);
router.put('/update', authMiddleware, updateExams);
router.delete('/delete', authMiddleware, deleteExams);
router.post('/fetch', tokenGenerate);

module.exports = router;
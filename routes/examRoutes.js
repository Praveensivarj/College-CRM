const express = require('express');
const router = express.Router();
const { tokenGenerate, addExams, updateExams, deleteExams } = require('../controllers/examsController');
const authMdleware = require('../middleware/authMiddleware');

router.post('/addExams', addExams);
router.put('/update', authMdleware, updateExams);
router.delete('/delete', deleteExams);
router.post('/fetch', tokenGenerate);

module.exports = router;
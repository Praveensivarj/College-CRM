const express = require('express');
const { subjectFetch, addSubjects, updateSubject, deleteSubject } = require('../controllers/subjectsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/addSubjects", addSubjects);
router.put("/update", authMiddleware, updateSubject);
router.delete("/delete", authMiddleware, deleteSubject);
router.post("/fetch", subjectFetch);

module.exports = router;
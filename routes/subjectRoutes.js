const express = require('express');
const { addSubjects, updateSubject, deleteSubject } = require('../controllers/subjectsController');
const router = express.Router();

router.post("/addSubjects", addSubjects);
router.put("/update", updateSubject);
router.delete("/delete", deleteSubject);

module.exports = router;
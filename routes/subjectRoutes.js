const express = require('express');
const {addSubjects, updateSubject, deleteSubject} = require('../controllers/subjects');
const router = express.Router();

router.post("/addSubjects", addSubjects);
router.put("/update", updateSubject);
router.delete("/delete", deleteSubject);

module.exports = router;
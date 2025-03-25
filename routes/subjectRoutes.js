const express = require('express');
const {addSubjects, update} = require('../controllers/subjects');
const router = express.Router();

router.post("/addSubjects", addSubjects);
router.put("/update", update);

module.exports = router;
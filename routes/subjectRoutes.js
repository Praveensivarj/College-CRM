const express = require("express");
const router = express.Router();
const { addSubjects } = require('../controllers/subjectController');
router.post('/addSubject', addSubjects);
module.exports = router;
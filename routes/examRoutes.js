const express = require("express");
const router = express.Router();
const { add } = require('../controllers/examsController');
router.post('/add', add);
module.exports = router;
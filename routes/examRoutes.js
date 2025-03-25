const express = require("express");
const router = express.Router();
const { add } = require('../controllers/examsController');
const authMiddleware = require('../middleware/authMiddleware')
router.post('/add', authMiddleware, add);
module.exports = router;
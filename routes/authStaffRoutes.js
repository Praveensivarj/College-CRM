const express = require("express");
const { staffRegister, staffLogin, forgotStaffPassword, resetStaffPassword } = require("../controllers/authStaffController");
const router = express.Router();
router.post("/register", staffRegister);
router.post("/login", staffLogin);
router.post("/forgot-password", forgotStaffPassword );
router.post("/reset-password", resetStaffPassword);
module.exports = router;
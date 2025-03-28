const express = require("express");
const { adminRegister, adminLogin, forgotAdminPassword, resetAdminPassword } = require("../controllers/authAdminController");
const router = express.Router();
router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/forgot-password", forgotAdminPassword );
router.post("/reset-password", resetAdminPassword);
module.exports = router;
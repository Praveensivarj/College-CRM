const express = require("express");
const { adminRegister, adminLogin, forgotAdminPassword, resetAdminPassword, getAllAdmin, getAdminById, updateAdmin, deleteAdmin, changeAdminPassword } = require("../controllers/authAdminController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/forgot-password", forgotAdminPassword);
router.post("/reset-password", resetAdminPassword);
router.get("/", getAllAdmin);
router.get("/profile", authMiddleware, getAdminById);
router.put("/update", authMiddleware, updateAdmin);
router.delete("/delete", authMiddleware, deleteAdmin);
router.post('/change-password', authMiddleware, changeAdminPassword);

module.exports = router;
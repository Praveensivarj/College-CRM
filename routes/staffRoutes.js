const express = require("express");
const { staffRegister, staffLogin, forgotStaffPassword, resetStaffPassword, getAllStaff, getStaffById, updateStaff, deleteStaff, changeStaffPassword } = require("../controllers/staffController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", staffRegister);
router.post("/login", staffLogin);
router.post("/forgot-password", forgotStaffPassword );
router.post("/reset-password", resetStaffPassword);
router.get("/", getAllStaff);
router.get("/profile", authMiddleware, getStaffById);
router.put("/update", authMiddleware, updateStaff);
router.delete("/delete", authMiddleware, deleteStaff);
router.post('/change-password', authMiddleware, changeStaffPassword);

module.exports = router;
const express = require("express");
const { staffRegister, staffLogin, forgotStaffPassword, resetStaffPassword, getAllStaff, getStaffById, updateStaff, deleteStaff, changeStaffPassword } = require("../controllers/staffController");
const router = express.Router();
const middleware = require("../middleware/middleware");

router.post("/register", staffRegister);
router.post("/login", staffLogin);
router.post("/forgot-password", forgotStaffPassword);
router.post("/reset-password", resetStaffPassword);
router.get("/", getAllStaff);
router.get("/profile", middleware, getStaffById);
router.put("/update", middleware, updateStaff);
router.delete("/delete", middleware, deleteStaff);
router.post('/change-password', middleware, changeStaffPassword);

module.exports = router;
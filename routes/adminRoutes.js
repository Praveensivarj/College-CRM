const express = require("express");
const { adminRegister, adminLogin, forgotAdminPassword, resetAdminPassword, getAllAdmin, getAdminById, updateAdmin, deleteAdmin, changeAdminPassword } = require("../controllers/adminController");
const router = express.Router();
const middleware = require("../middleware/middleware");

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/forgot-password", forgotAdminPassword);
router.post("/reset-password", resetAdminPassword);
router.get("/", getAllAdmin);
router.get("/profile", middleware, getAdminById);
router.put("/update", middleware, updateAdmin);
router.delete("/delete", middleware, deleteAdmin);
router.post('/change-password', middleware, changeAdminPassword);

module.exports = router;
const express = require("express");
const { register, login, forgotPassword, resetPassword, getAllStudents, getStudentById, updateStudent, deleteStudent, changePassword } = require("../controllers/authStudentController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/", getAllStudents);
router.get("/profile", authMiddleware, getStudentById);
router.put("/update", authMiddleware, updateStudent);
router.delete("/delete", authMiddleware, deleteStudent);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
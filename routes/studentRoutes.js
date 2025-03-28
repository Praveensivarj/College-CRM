const express = require("express");
const { register, login, forgotPassword, resetPassword, getAllStudents, getStudentById, updateStudent, deleteStudent, changePassword } = require("../controllers/studentController");
const router = express.Router();
const middleware = require("../middleware/middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/", getAllStudents);
router.get("/profile", middleware, getStudentById);
router.put("/update", middleware, updateStudent);
router.delete("/delete", middleware, deleteStudent);
router.post('/change-password', middleware, changePassword);

module.exports = router;
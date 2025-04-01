const express = require("express");
const router = express.Router();

const { addExam, exams, exam, updateExam, deleteExam } = require("../controllers/examController");

router.post("/addExam", addExam);
router.get("/exams", exams);
router.get("/exam", exam);
router.put("/update", updateExam);
router.delete("/delete", deleteExam);

module.exports = router;
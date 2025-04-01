const express = require("express");
const router = express.Router();
const { addSubject, subjects, subject, updateSubject, deleteSubject } = require("../controllers/subjectController");
const { route } = require("./studentRoutes");

router.post("/addSubject", addSubject);
router.get("/subjects", subjects);
router.get("/subject", subject);
router.put("/update", updateSubject);
router.delete("/delete", deleteSubject);

module.exports = router;
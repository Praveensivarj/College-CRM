const db = require('../config/db');
const jwt = require("jsonwebtoken");

exports.addExams = async (req, res) => {
    const { subject_id, exam_date } = req.body;

    if (!subject_id || !exam_date) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All fields are required"
        });
    }

    try {
        const [existingExam] = await db.promise().query("SELECT * FROM exams WHERE subject_id = ? AND exam_date = ?", [subject_id, exam_date]);

        if (existingExam.length > 0) {
            return res.status(409).json({
                success: false,
                code: 409,
                message: "Exam already exists for this subject on the given date"
            });
        }

        const [insertResult] = await db.promise().query("INSERT INTO exams (subject_id, exam_date) VALUES (?, ?)", [subject_id, exam_date]);

        const [newExam] = await db.promise().query("SELECT * FROM exams WHERE id = ?", [insertResult.insertId]);

        return res.status(201).json({
            success: true,
            code: 201,
            message: "Exam added successfully",
            data: newExam[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error"
        });
    }
};

exports.tokenGenerate = (req, res) => {
    const { exam_date } = req.body;

    if (!exam_date) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "exam_date field is empty!!"
        });
    }

    db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal error",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Exam not found in database"
            });
        }

        const exam = results[0];
        const token = jwt.sign({ id: exam.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            success: true,
            code: 200,
            message: "Exam fetched successfully",
            data: {
                token: token,
                examData: exam
            }
        });
    });
};


exports.updateExams = async (req, res) => {
    const { exam_date } = req.body;

    if (!exam_date) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "exam_date is required for updating"
        });
    }

    try {
        const [existingExam] = await db.promise().query("SELECT * FROM exams WHERE id = ?", [req.exam.id]);

        if (existingExam.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Exam not found"
            });
        }

        await db.promise().query("UPDATE exams SET updated_at = now(), exam_date = ? WHERE id = ?", [exam_date, req.exam.id]);

        const [updatedExam] = await db.promise().query("SELECT * FROM exams WHERE id = ?", [req.exam.id]);

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Exam updated successfully",
            data: updatedExam[0]
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error"
        });
    }
};

exports.deleteExams = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "Exam ID is required for deletion"
        });
    }

    try {
        const [existingExam] = await db.promise().query("SELECT * FROM exams WHERE id = ?", [id]);

        if (existingExam.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Exam not found"
            });
        }

        await db.promise().query("DELETE FROM exams WHERE id = ?", [id]);

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Exam deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error"
        });
    }
};
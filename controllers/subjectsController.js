const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.addSubjects = async (req, res) => {
    try {
        const { subject_name, staff_id } = req.body;

        if (!subject_name || !staff_id) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "All fields required"
            });
        }

        db.query("select * from subjects where subject_name = ? and staff_id = ?", [subject_name, staff_id], (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Internal server error"
                });
            }

            if (result.length > 0) {
                return res.status(409).json({
                    success: false,
                    code: 409,
                    message: "Subject already exists"
                });
            }

            db.query("insert into subjects (subject_name, staff_id) values(?, ?)", [subject_name, staff_id], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Internal server error"
                    });
                }

                const insertedId = result.insertId
                db.query("select * from subjects where id = ?", [insertedId], (err, subjectData) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            code: 500,
                            message: "Error fetching in subject data"
                        });
                    }
                    else {
                        return res.status(201).json({
                            success: true,
                            code: 201,
                            message: "subject added successfully",
                            data: {
                                subjectData: subjectData[0]
                            }
                        });
                    }
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error"
        });
    }
};

exports.subjectFetch = (req, res) => {
    const { subject_name } = req.body;

    if (!subject_name) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "subject_name field is empty!!"
        });
    }

    db.query("SELECT * FROM subjects WHERE subject_name = ?", [subject_name], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal error",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Subject not found in database"
            });
        }

        const subject = results[0];
        const token = jwt.sign({ id: subject.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            success: true,
            code: 200,
            message: "Subject fetched successfully",
            data: {
                token: token,
                subjectData: subject
            }
        });
    });
};

exports.updateSubject = async (req, res) => {
    const { staff_id } = req.body;

    if (!staff_id) {
        return res.status(409).json({
            success: false,
            code: 409,
            message: "staff_id is required for updating."
        });
    }

    db.query("UPDATE subjects SET updated_at = NOW(), staff_id = ? WHERE id = ?",
        [staff_id, req.subject.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Internal server error",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    code: 404,
                    message: "Subject not found or no changes made."
                });
            }

            db.query("SELECT * FROM subjects WHERE id = ?", [req.subject.id], (err, data) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Internal server error",
                        error: err.message
                    });
                }

                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: "Updated successfully",
                    data: data[0]
                });
            });
        }
    );
};

exports.deleteSubject = async (req, res) => {
    try {
        const [existingSubject] = await db.promise().query("SELECT * FROM subjects WHERE id = ?", [req.subject.id]);

        if (existingSubject.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Subject not found"
            });
        }

        await db.promise().query("DELETE FROM subjects WHERE id = ?", [req.subject.id]);

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Subject deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error"
        });
    }
};
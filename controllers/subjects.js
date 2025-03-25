const db = require('../config/db');

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

exports.update = async (req, res) => {
    const { staff_id, id } = req.body;

    if (!staff_id || !id) {
        return res.status(409).json({
            success: false,
            code: 409,
            message: "Both staff_id and id are required for updating."
        });
    }

    db.query("UPDATE subjects SET updated_at = NOW(), staff_id = ? WHERE id = ?",
        [staff_id, id],
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

            db.query("SELECT * FROM subjects WHERE id = ?", [id], (err, data) => {
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
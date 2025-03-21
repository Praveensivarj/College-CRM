const db = require("../config/db");

exports.addSubjects = (req, res) => {
    const { student_id, staff_id } = req.body;

    if (!student_id || !staff_id) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All fields are required"
        });
    }

    db.query("select * from subjects where staff_id = ? and student_id = ?", [staff_id, student_id], (err, results) => {
        if (results.length > 0) {
            return res.status(409).json({
                success: false,
                code: 409,
                message: "Subject already added"
            });
        } else {
            db.query('select * from staffs where id = ?', [staff_id], (err, staffDetails) => {
                if (err) {
                    return res.status(401).json({
                        success: false,
                        code: 401,
                        message: "Error fetching staff details"
                    });
                }
                const subject = staffDetails[0].subject;
                db.query('INSERT INTO subjects (subject_name, student_id, staff_id) VALUES (?, ?, ?)', [subject, student_id, staff_id], (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            code: 500,
                            message: "Error adding subject"
                        });
                    }
                    const insertedId = result.insertId;
                    db.query("SELECT * FROM subjects WHERE id = ?", [insertedId], (err, subjectData) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                code: 500,
                                message: "Error fetching subject data"
                            });
                        }
                        else {
                            return res.status(201).json({
                                success: true,
                                code: 201,
                                message: "Subject added successfully",
                                data: subjectData[0]
                            });
                        }
                    });
                });
            });
        }
    });
};
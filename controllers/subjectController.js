const { compareSync } = require("bcryptjs");
const db = require("../config/db");

exports.addSubject = async (req, res) => {
    const { name, code, staff_id, student_id } = req.body;

    if (!name || !code || !staff_id || !student_id) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All fields are required"
        });
    }

    db.query("INSERT INTO subjects (name, code, staff_id, student_id) VALUES(?, ?, ?, ?)", [name, code, staff_id, student_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }
        else {
            return res.status(201).json({
                success: true,
                code: 201,
                message: "Subject inserted successfully",
                data: result[0]
            });
        }
    });
};

exports.subjects = (req, res) => {
    db.query("SELECT * FROM subjects", (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }

        else {
            return res.status(200).json({
                success: true,
                code: 200,
                message: "Subjects Fetched",
                data: result
            });
        }
    });
};

exports.subject = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "subject code is required for fetch subjects data"
        });
    }

    db.query("SELECT * FROM subjects WHERE code = ?", [code], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Subject not found"
            });
        }

        else {
            return res.status(200).json({
                success: true,
                code: 200,
                message: "Subject Fetched",
                data: result[0]
            });
        }
    });
};

// exports.updateSubject = (req, res) => {
//     const { name, code, staff_id, student_id } = req.body;

//     if (!name || !code || !staff_id || !student_id) {
//         return res.status(400).json({
//             success: false,
//             code: 400,
//             message: "All fields are required for update"
//         });
//     }

//     db.query("SELECT * FROM subjects WHERE code = ?", [code], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({
//                 success: false,
//                 code: 500,
//                 message: "Internal server error"
//             });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 code: 404,
//                 message: "Subject not found"
//             });
//         }

//         db.query("UPDATE subjects SET name = ? WHERE code = ?", [name, code], (err, updateResult) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({
//                     success: false,
//                     code: 500,
//                     message: "Internal server error"
//                 });
//             }

//             return res.status(200).json({
//                 success: true,
//                 code: 200,
//                 message: "Updated successfully"
//             });
//         });
//     });
// };

exports.updateSubject = (req, res) => {
    const { code, name, staff_id, student_id } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "Subject code is required for update"
        });
    }

    const allowedFields = { name, staff_id, student_id };
    const updateFields = [];
    const values = [];

    Object.entries(allowedFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            updateFields.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (updateFields.length === 0) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "At least one field must be provided for update"
        });
    }

    const sql = `UPDATE subjects SET ${updateFields.join(", ")}, updated_at = NOW() WHERE code = ?`;
    values.push(code);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Subject not found"
            });
        }

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Subject updated successfully"
        });
    });
};

exports.deleteSubject = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "Subject code is required for deletion"
        });
    }

    db.query("SELECT * FROM subjects WHERE code = ?", [code], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Subject not found"
            });
        }

        db.query("DELETE FROM subjects WHERE code = ?", [code], (err, deleteResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Internal server error"
                });
            }

            return res.status(200).json({
                success: true,
                code: 200,
                message: "Subject deleted successfully"
            });
        });
    });
};
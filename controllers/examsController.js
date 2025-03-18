const db = require('../config/db');

exports.add = async (req, res)=>{
    const{student_id, staff_id, subject_id, exam_date, total_marks, obtained_marks, result} = req.body;

    if(!student_id || !staff_id || !subject_id || !exam_date || !total_marks || !obtained_marks || !result){
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All field are required"
        });
    }

    db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Database error"
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                success: false,
                code: 409,
                message: "Exam already Added"
            });
        }
    });

    db.query('INSERT INTO exams (student_id, staff_id, subject_id, exam_date, total_marks, obtained_marks, result) VALUES (?, ?, ?, ?, ?, ?, ?)', [student_id, staff_id, subject_id, exam_date, total_marks, obtained_marks, result], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Error adding subject"
            });
        }

        const insertedId = result.insertId;
        db.query("SELECT * FROM exams WHERE id = ?", [insertedId], (err, subjectData) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Error fetching subject data"
                });
            }
            else{
                return res.status(201).json({
                    success: true,
                    code: 201,
                    message: "1 Row added successfully",
                    data: subjectData[0]
                });
            }
        });
    });
};
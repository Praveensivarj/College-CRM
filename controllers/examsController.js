const { configDotenv } = require('dotenv');
const db = require('../config/db');

exports.addExams = async (req, res) => {
    const { subject_id, exam_date } = req.body;

    try {
        if (!subject_id || !exam_date) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "All fields required"
            });
        }

        db.query("select * from exams where subject_id = ? and exam_date = ?", [subject_id, exam_date], (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Database error"
                });
            }

            if (result.length > 0) {
                return res.status(409).json({
                    success: false,
                    code: 409,
                    message: "Data already present in database"
                });
            }

            db.query("insert into exams(subject_id, exam_date) values(?, ?)", [subject_id, exam_date], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Internal server error"
                    });
                }

                const insertedId = result.insertId
                db.query("select * from exams where id = ?", [insertedId], (err, data) => {
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
                            message: "data added successfully",
                            data: data[0]
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

exports.updateExams = (req, res) => {
    const { exam_date } = req.body;

    if (!exam_date) {
        return  res.status(405).json({
            success:  false,
            code: 409,
            message: "exam_date is required to update the data"
        });
    }
    
    db.query("update exams set exam_date = ?", [exam_date], (err, result) => {
        if(err){
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }
        
        db.query("select * from exams where exam_date = ?", [exam_date], (err, updatedData) => {
            if(err){
                return res.status(500).json({
                    success:false,
                    code: 500,
                    message: "Internal server error"
                });
            }
            else{
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: "Updated successfully",
                    data: updatedData[0]
                });
            }
        });
    });
};
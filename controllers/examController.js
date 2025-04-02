const db = require("../config/db");

exports.addExam = (req, res) => {
    const { subject_id, exam_date, total_marks } = req.body;

    if (!subject_id || !exam_date || !total_marks) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All fields are required"
        });
    }

    db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, result) => {
        if (result.length > 0) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Already registered!!"
            });
        }

        else {
            db.query("INSERT INTO exams(subject_id, exam_date, total_marks) VALUES(?, ?, ?)", [subject_id, exam_date, total_marks], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Internal server error"
                    });
                }

                else {
                    db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, result) => {
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
                                message: "Inserted successfully...",
                                data: result[0]
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.exams = (req, res) => {
    db.query("SELECT * FROM exams", (err, result) => {
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
                message: "Data Fetched",
                data: result
            });
        }
    });
};

exports.exam = (req, res) => {
    const { exam_date } = req.body;

    if (!exam_date) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "exam_date is required for fetching data"
        });
    }
    db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, result) => {
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "data not found"
            });
        }

        else {
            return res.status(200).json({
                success: true,
                code: 200,
                message: "Data fetched",
                data: result[0]
            });
        }
    });
};

exports.updateExam = (req, res) => {
    const { exam_date, subject_id } = req.body;

    if (!exam_date, subject_id) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All fields are required"
        });
    }

    db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, examResult) => {
        if (examResult.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Data Not present in database"
            });
        }

        else {
            db.query("UPDATE exams SET subject_id = ?", [subject_id], (err, result) => {
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
                        message: "Updated Successfully",
                        data: examResult[0]
                    });
                }
            });
        }
    });
};

exports.deleteExam = (req, res) => {
    const exam_date = req.body;

    if (!exam_date) {
        return res.status(400).json({
            success: false,
            code: 500,
            message: "exam_date is required for delete"
        });
    }

    else {
        db.query("SELECT * FROM exams WHERE exam_date = ?", [exam_date], (err, result) => {
            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    code: 404,
                    message: "Data not present in database"
                });
            }
            else {
                db.query("DELETE exams where exam_date = ?", [exam_date], (err, result) => {
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
                            message: "Deleted successfully.."
                        });
                    }
                });
            }
        });
    }
};
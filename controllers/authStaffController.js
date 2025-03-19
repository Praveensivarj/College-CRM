const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require('nodemailer');
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { text } = require("express");

exports.staffRegister = async (req, res) => {
    try {
        const { staff_name, staff_dob, staff_email, staff_password, subject, staff_mobile, staff_address, staff_age, staff_gender } = req.body;

        if (!staff_name || !staff_dob || !staff_email || !staff_password || !subject || !staff_mobile || !staff_address || !staff_age || !staff_gender) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "All Fields are required"
            });
        }
        db.query("SELECT * FROM staffs WHERE staff_email = ? OR staff_mobile = ?", [staff_email, staff_mobile], (err, results) => {
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
                    message: "Email or Mobile already registered"
                });
            }

            bcrypt.hash(staff_password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Error encrypting password"
                    });
                }
                else {
                    db.query(
                        "INSERT INTO staffs (staff_name, staff_dob, staff_email, staff_password, subject, staff_mobile, staff_address, staff_age, staff_gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [staff_name, staff_dob, staff_email, hashedPassword, subject, staff_mobile, staff_address, staff_age, staff_gender],
                        (err, result) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    code: 500,
                                    message: "Error registered staff"
                                });
                            }
                            const insertedId = result.insertId;
                            db.query("SELECT * FROM staffs WHERE id = ?", [insertedId], (err, staffData) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        code: 500,
                                        message: "Error fetching staff data"
                                    });
                                }

                                return res.status(201).json({
                                    success: true,
                                    code: 201,
                                    message: "Staff registered successfully",
                                    data: {
                                        studentData: staffData[0]
                                    }
                                });
                            });
                        }
                    );
                }
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        });
    }
};

exports.staffLogin = (req, res) => {
    const { staff_email, staff_password } = req.body;
    db.query("select * from staffs where staff_email = ?", [staff_email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal error"
            });
        }
        if (!staff_email || !staff_password) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "Email or Password field is Empty!!"
            });
        }
        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Email not present in database"
            });
        }
        const isMatch = await bcrypt.compare(staff_password, results[0].staff_password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Invalid password"
            });
        }
        else {
            const staff = results[0];
            const token = jwt.sign({ id: staff.id, updated_at: staff.updated_at }, process.env.JWT_SECRET, { expiresIn: "1h" });
            db.query("select * from staffs where staff_email = ?", [staff_email], (err, result) => {
                res.status(200).json({
                    success: true,
                    code: 200,
                    message: "Staff Login Successful",
                    data: {
                        token: token,
                        staff: result[0]
                    }
                });
            })
        }
    });
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.forgotStaffPassword = (req, res) => {
    const { staff_email } = req.body;

    db.query("SELECT * FROM staffs WHERE staff_email = ?", [staff_email], (err, results) => {
        if (err) return res.status(500).json({
            success: false,
            code: 500,
            message: "Database error"
        });
        if (!staff_email) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "Email is required"
            });
        }
        if (results.length === 0)
            return res.status(404).json({
                success: false,
                code: 404,
                message: "User not found"
            });

        const token = jwt.sign({ staff_email }, process.env.JWT_SECRET, {
            expiresIn: "10m",
        });

        db.query(
            "UPDATE staffs SET updated_at = now(), reset_token = ? WHERE staff_email = ?",
            [token, staff_email],
            (err) => {
                if (err) return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Database error"
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: staff_email,
                    subject: "Password Reset Request",
                    text: `Use this token to reset your password: ${token}`,
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) return res.status(500).json({
                        success: false,
                        code: 500,
                        token: token,
                        message: "Email sending failed"
                    });

                    res.json({
                        success: true,
                        code: 200,
                        message: "Reset link sent to your email"
                    });
                });
            }
        );
    });
};

exports.resetStaffPassword = (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        db.query(
            "SELECT * FROM staffs WHERE staff_email = ? AND reset_token = ?",
            [decoded.staff_email, token],
            (err, results) => {
                const data = results[0];
                console.log(data);
                if (err) return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Intenal server error"
                });

                if (!newPassword || !confirmPassword) {
                    return res.status(401).json({
                        success: false,
                        code: 401,
                        message: "All fields are required!!"
                    });
                }

                if (newPassword !== confirmPassword) {
                    return res.status(400).json({
                        success: false,
                        code: 400,
                        message: "newPassword and ConfirmPassword does not matched"
                    });
                }

                if (results.length === 0)
                    return res.status(400).json({
                        success: false,
                        code: 400,
                        message: "Invalid or expired token"
                    });

                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if (err) return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Intenal server error"
                    });

                    db.query(
                        "UPDATE staffs SET updated_at = now(), staff_password = ?, reset_token = NULL WHERE staff_email = ?",
                        [hash, decoded.staff_email],
                        (err) => {
                            if (err) return res.status(500).json({
                                success: false,
                                code: 500,
                                message: "Intenal server error"
                            });

                            res.json({
                                success: true,
                                code: 200,
                                message: "Password reset successful"
                            });
                        }
                    );
                });
            }
        );
    } catch (err) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "Invalid or expired token"
        });
    }
};
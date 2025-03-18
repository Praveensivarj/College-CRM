const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require('nodemailer');
require("dotenv").config();
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
    try {
        const { name, dob, email, password, degree, mobile, address, age, gender } = req.body;

        if (!name || !dob || !email || !password || !degree || !mobile || !address || !age || !gender) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "All Fields are required"
            });
        }

        db.query("SELECT * FROM students WHERE email = ? OR mobile = ?", [email, mobile], (err, results) => {
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

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Error encrypting password"
                    });
                }

                db.query(
                    "INSERT INTO students (name, dob, email, password, degree, mobile, address, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [name, dob, email, hashedPassword, degree, mobile, address, age, gender],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                code: 500,
                                message: "Error registering student"
                            });
                        }

                        const insertedId = result.insertId;
                        db.query("SELECT * FROM students WHERE id = ?", [insertedId], (err, studentData) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    code: 500,
                                    message: "Error fetching in student data"
                                });
                            }
                            else {
                                return res.status(201).json({
                                    success: true,
                                    code: 201,
                                    message: "Student registered successfully",
                                    data: {
                                        studentData: studentData[0]
                                    }
                                });
                            }
                        });
                    }
                );
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

exports.login = (req, res) => {
    const { email, password } = req.body;
    db.query("select * from students where email = ?", [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal error"
            });
        }

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "Email or Password field is empty!!"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Email not present in database"
            });
        }

        const isMatch = await bcrypt.compare(password, results[0].password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Invalid password"
            });
        }

        else {
            const student = results[0];
            const token = jwt.sign({ id: student.id, updated_at: student.updated_at }, process.env.JWT_SECRET, { expiresIn: "1h" });
            db.query("select * from students where email = ?", [email], (err, result) => {
                res.status(200).json({
                    success: true,
                    code: 200,
                    message: "Student Login Successful",
                    data: {
                        token: token,
                        student: result[0]
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

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    db.query("SELECT * FROM students WHERE email = ?", [email], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Database error"
            });
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "Email is required"
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "User not found"
            });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "10m",
        });

        db.query(
            "UPDATE students SET updated_at = now(), reset_token = ? WHERE email = ?",
            [token, email],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Database error"
                    });
                }

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: 'praveensivarj3@gmail.com',
                    subject: "Password Reset Request",
                    text: `Use this token to reset your password: ${token}`,
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            code: 500,
                            token: token,
                            message: "Email sending failed"
                        });
                    }

                    else {
                        res.json({
                            success: true,
                            code: 200,
                            message: "Reset link sent to your email"
                        });
                    }
                });
            }
        );
    });
};

exports.resetPassword = (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        db.query(
            "SELECT * FROM students WHERE email = ? AND reset_token = ?",
            [decoded.email, token],
            (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Intenal server error"
                    });
                }

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
                        message: "newPassword and confirmPassword connot be same"
                    });
                }

                if (results.length === 0) {
                    return res.status(400).json({
                        success: false,
                        code: 400,
                        message: "Invalid or expired token"
                    });
                }

                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            code: 500,
                            message: "Intenal server error"
                        });
                    }

                    db.query(
                        "UPDATE students SET updated_at = now(), password = ?, reset_token = NULL WHERE email = ?",
                        [hash, decoded.email],
                        (err) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    code: 500,
                                    message: "Intenal server error"
                                });
                            }

                            else {
                                res.json({
                                    success: true,
                                    code: 200,
                                    message: "Password reset successful"
                                });
                            }
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
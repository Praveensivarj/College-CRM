const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require('nodemailer');
require("dotenv").config();
const bcrypt = require("bcryptjs");

exports.adminRegister = async (req, res) => {
    try {
        const { name, dob, email, password, role, mobile, address, age, gender } = req.body;

        if (!name || !dob || !email || !password || !role || !mobile || !address || !age || !gender) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "All Fields are required"
            });
        }
        db.query("SELECT * FROM admin WHERE email = ? OR mobile = ?", [email, mobile], (err, results) => {
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

            const validRoles = ["admin", "sub-admin"];

            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: "Invalid role. Allowed values: 'admin', 'sub-admin'."
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
                else {
                    db.query(
                        "INSERT INTO admin (name, dob, email, password, role, mobile, address, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [name, dob, email, hashedPassword, role, mobile, address, age, gender],
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({
                                    success: false,
                                    code: 500,
                                    message: "Error registered admin"
                                });
                            }
                            const insertedId = result.insertId;
                            db.query("SELECT name, dob, email, role, mobile, address, age, gender, created_at, updated_at FROM admin WHERE id =?", [insertedId], (err, adminData) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        code: 500,
                                        message: "Error fetching admin data"
                                    });
                                }
                                else {
                                    return res.status(201).json({
                                        success: true,
                                        code: 201,
                                        message: "Admin registered successfully",
                                        data: {
                                            adminData: adminData[0]
                                        }
                                    });
                                }
                            });
                        }
                    );
                }
            });
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        });
    }
};

exports.adminLogin = (req, res) => {
    const { email, password } = req.body;
    db.query("select * from admin where email = ?", [email], async (err, results) => {
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
        const isMatch = await bcrypt.compare(password, results[0].password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Invalid password"
            });
        }
        else {
            const admin = results[0];
            const token = jwt.sign({ id: admin.id, updated_at: admin.updated_at }, process.env.JWT_SECRET, { expiresIn: "1h" });
            db.query("select name, dob, email, role, mobile, address, age, gender, created_at, updated_at from admin where email = ?", [email], (err, result) => {
                res.status(200).json({
                    success: true,
                    code: 200,
                    message: "Admin Login Successful",
                    data: {
                        token: token,
                        admin: result[0]
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

exports.forgotAdminPassword = (req, res) => {
    const { email } = req.body;

    db.query("SELECT * FROM admin WHERE email = ?", [email], (err, results) => {
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
            "UPDATE admin SET updated_at = now(), reset_token = ? WHERE email = ?",
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
                    to: email,
                    subject: "Password Reset Request",
                    text: `Use this token to reset your password: ${token}`
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
                        return res.status(200).json({
                            success: true,
                            code: 200,
                            message: "Reset link send to your email"
                        });
                    }
                });
            }
        );
    });
};

exports.resetAdminPassword = (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        db.query(
            "SELECT * FROM admin WHERE email = ? AND reset_token = ?",
            [decoded.email, token],
            (err, results) => {
                const data = results[0];
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Internal server error"
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
                        message: "newPassword and ConfirmPassword should be same"
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
                            message: "Internal server error"
                        });
                    }

                    db.query(
                        "UPDATE admin SET updated_at = now(), password = ?, reset_token = NULL WHERE email = ?",
                        [hash, decoded.email],
                        (err) => {
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

exports.getAllAdmin = (req, res) => {
    db.query("select name, dob, email, role, mobile, address, age, gender, created_at, updated_at from admin", (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            });
        }
        else {
            return res.status(200).json({
                success: true,
                code: 200,
                message: "List of admins",
                data: results
            });
        }
    });
};

exports.getAdminById = (req, res) => {
    db.query("SELECT name, dob, email, role, mobile, address, age, gender, created_at, updated_at FROM admin WHERE id = ?", [req.admin.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error"
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Admin not found"
            });
        }
        else {
            res.status(200).json({
                success: true,
                code: 200,
                data: results[0]
            });
        }
    });
};

exports.updateAdmin = (req, res) => {
    const allowedFields = ["name", "dob", "email", "role", "mobile", "address", "age", "gender"];
    const updateFields = [];
    const values = [];

    allowedFields.forEach(field => {
        if (req.body[field]) {
            updateFields.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });

    updateFields.push("updated_at = NOW()");

    if (updateFields.length === 1) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "No valid fields provided for update"
        });
    }

    const adminId = req.admin.id;
    const query = `UPDATE admin SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(adminId);

    db.query(query, values, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Error"
            });
        }

        db.query("SELECT name, dob, email, role, mobile, address, age, gender, created_at, updated_at FROM admin WHERE id = ?", [adminId], (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Internal Error"
                });
            }
            else {
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: "Admin updated successfully",
                    data: result[0]
                });
            }
        });
    });
};

exports.deleteAdmin = (req, res) => {
    db.query("DELETE FROM admin WHERE id = ?", [req.admin.id], (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server error"
            });
        }
        else {
            res.status(200).json({
                success: true,
                code: 200,
                message: "Admin deleted successfully"
            });
        }
    });
};

exports.changeAdminPassword = (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: "All fields are required",
        });
    }

    db.query("SELECT * FROM admin WHERE id = ?", [req.admin.id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: "Internal server error",
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Admin not found",
            });
        }

        const admin = result[0];

        bcrypt.compare(currentPassword, admin.password, (err, passwordMatch) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Internal server error",
                });
            }

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    message: "Current password is incorrect",
                });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: "New password cannot be the same as the current password",
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: "NewPassword and confirmPassword should be same",
                });
            }

            if (
                !admin?.updated_at ||
                !req?.admin?.updated_at ||
                isNaN(new Date(admin.updated_at).getTime()) ||
                isNaN(new Date(req.admin.updated_at).getTime()) ||
                new Date(admin.updated_at).getTime() !== new Date(req.admin.updated_at).getTime()
            ) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    message: "Invalid or expired token"
                });
            }


            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        code: 500,
                        message: "Internal server error",
                    });
                }

                db.query(
                    "UPDATE admin SET password = ?, updated_at = NOW() WHERE id = ?",
                    [hashedPassword, admin.id],
                    (err) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                code: 500,
                                message: "Internal server error",
                            });
                        }
                        else {
                            return res.status(200).json({
                                success: true,
                                code: 200,
                                message: "Password changed successfully. Please log in again.",
                            });
                        }
                    }
                );
            });
        });
    });
};
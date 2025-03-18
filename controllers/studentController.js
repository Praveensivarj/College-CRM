const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require('nodemailer');

exports.getAllStudents = (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
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
        message: "List of Students",
        data: results
      });
    }
  });
};

exports.getStudentById = (req, res) => {
  db.query("SELECT * FROM students WHERE id = ?", [req.student.id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: "Internal Server error"
      });
    }
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Student not found"
      });
    }
    else {
      res.status(200).json({
        success: true,
        code: 200,
        message: "Data of Students",
        data: results[0]
      });
    }
  });
};

exports.updateStudent = (req, res) => {
  const allowedFields = ["name", "dob", "email", "degree", "mobile", "address", "age", "gender"];
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

  const studentId = req.student.id;
  const query = `UPDATE students SET ${updateFields.join(", ")} WHERE id = ?`;
  values.push(studentId);

  db.query(query, values, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: "Internal Error"
      });
    }

    db.query("SELECT * FROM students WHERE id = ?", [studentId], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          code: 500,
          message: "Internal Error"
        });
      }
      else {
        res.status(200).json({
          success: true,
          code: 200,
          message: "Student updated successfully",
          data: result[0]
        });
      }
    });
  });
};

exports.deleteStudent = (req, res) => {
  db.query("DELETE FROM students WHERE id = ?", [req.student.id], (err) => {
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
        message: "Student deleted successfully"
      });
    }
  });
};

exports.changePassword = (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "All fields are required",
    });
  }

  db.query("SELECT * FROM students WHERE id = ?", [req.student.id], (err, result) => {
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
        message: "Student not found",
      });
    }

    const student = result[0];

    bcrypt.compare(currentPassword, student.password, (err, passwordMatch) => {
      if (err) {
        return res.status(500).json({
          success: false,
          code: 500,
          message: "Internal server error"
        });
      }

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          code: 401,
          message: "Current password is incorrect"
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: "New password cannot be the same as the current password"
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: "New password and confirm password does not matched"
        });
      }

      if (new Date(student, this.updated_at).toISOString() !== new Date(req.student.updated_at).toISOString()) {
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
            message: "Intenal server error"
          });
        }

        db.query(
          "UPDATE students SET password = ?, updated_at = NOW() WHERE id = ?",
          [hashedPassword, student.id],
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
                message: "Password changed successfully. Please log in again."
              });
            }
          }
        );
      });
    });
  });
};
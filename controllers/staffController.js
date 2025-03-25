const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require('nodemailer');

exports.getAllStaff = (req, res) => {
  db.query("select staff_name, staff_dob, staff_email, subject, staff_mobile, staff_address, staff_age, staff_gender, created_at, updated_at from staffs", (err, results) => {
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
      message: "List of staffs",
      data: results
    });
  }
});
};

exports.getStaffById = (req, res) => {
  db.query("SELECT staff_name, staff_dob, staff_email, subject, staff_mobile, staff_address, staff_age, staff_gender, created_at, updated_at FROM staffs WHERE id = ?", [req.staff.id], (err, results) => {
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
        message: "Staff not found"
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

exports.updateStaff = (req, res) => {
  const allowedFields = ["staff_name", "staff_dob", "staff_email", "staff_degree", "staff_mobile", "staff_address", "staff_age", "staff_gender"];
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

  const staffId = req.staff.id;
  const query = `UPDATE staffs SET ${updateFields.join(", ")} WHERE id = ?`;
  values.push(staffId);

  db.query(query, values, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: "Internal Error"
      });
    }

    db.query("SELECT staff_name, staff_dob, staff_email, subject, staff_mobile, staff_address, staff_age, staff_gender, created_at, updated_at FROM staffs WHERE id = ?", [staffId], (err, result) => {
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
          message: "Staff updated successfully",
          data: result[0]
        });
      }
    });
  });
};

exports.deleteStaff = (req, res) => {
  db.query("DELETE FROM staffs WHERE id = ?", [req.staff.id], (err) => {
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
        message: "Staff deleted successfully"
      });
    }
  });
};

exports.changeStaffPassword = (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "All fields are required",
    });
  }

  db.query("SELECT * FROM staffs WHERE id = ?", [req.staff.id], (err, result) => {
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
        message: "Staff not found",
      });
    }

    const staff = result[0];

    bcrypt.compare(currentPassword, staff.staff_password, (err, passwordMatch) => {
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
          message: "New password and confirm password does not matched",
        });
      }

      if (
        !staff?.updated_at ||
        !req?.staff?.updated_at ||
        isNaN(new Date(staff.updated_at).getTime()) ||
        isNaN(new Date(req.staff.updated_at).getTime()) ||
        new Date(staff.updated_at).getTime() !== new Date(req.staff.updated_at).getTime()
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
          "UPDATE staffs SET staff_password = ?, updated_at = NOW() WHERE id = ?",
          [hashedPassword, staff.id],
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
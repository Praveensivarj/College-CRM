const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require('nodemailer');

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
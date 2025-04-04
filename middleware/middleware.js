const jwt = require("jsonwebtoken");
require('dotenv').config();
const middleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({
      success: false,
      code: 401,
      message: "Access Denied"
    });
  }
  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.student = verified;
    req.staff = verified;
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      code: 400,
      message: "Invalid Token"
    });
  }
};
module.exports = middleware;
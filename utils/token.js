const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = (user) => {
  return jwt.sign(
    { email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
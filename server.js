const express = require("express");
require("dotenv").config();;
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const authStaffRoutes = require("./routes/authStaffRoutes");
const staffRoutes = require("./routes/staffRoutes");
const studentRoutes = require("./routes/studentRoutes");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staffauth", authStaffRoutes);
app.use("/api/staffs", staffRoutes);
const port = process.env.PORT;
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Server running on port ${port}`);
    }
});
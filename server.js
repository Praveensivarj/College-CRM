const express = require("express");
require("dotenv").config();;
const cors = require("cors");

const authStudentRoutes = require("./routes/authStudentRoutes");
const authStaffRoutes = require("./routes/authStaffRoutes");
const staffRoutes = require("./routes/staffRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const examRoutes = require('./routes/examRoutes');
const authAdminController = require("./routes/authAdminRoutes");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/studentauth", authStudentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staffauth", authStaffRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/adminauth", authAdminController);
app.use("/api/admin", adminRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/exams", examRoutes);
const port = process.env.PORT;
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Server running on port ${port}`);
    }
});
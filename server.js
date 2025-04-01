const express = require("express");
require("dotenv").config();;
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const examRoutes = require("./routes/examRoutes"); 
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/exam", examRoutes);
const port = process.env.PORT;
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Server running on port ${port}`);
    }
});
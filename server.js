const express = require("express");
require("dotenv").config();;
const cors = require("cors");

const authStudentRoutes = require("./routes/authStudentRoutes");
const authStaffRoutes = require("./routes/authStaffRoutes");
const authAdminController = require("./routes/authAdminRoutes");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/studentauth", authStudentRoutes);
app.use("/api/staffauth", authStaffRoutes);
app.use("/api/adminauth", authAdminController);
const port = process.env.PORT;
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Server running on port ${port}`);
    }
});
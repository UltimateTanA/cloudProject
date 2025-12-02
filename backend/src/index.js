const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require('dotenv').config();
const authRoutes = require("./routes/authroute");
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use("/auth", authRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});

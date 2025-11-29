const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authroute");
const gmailRoute = require('./routes/gmailroute');

const app = express();

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use('/api/gmail', gmailRoute);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

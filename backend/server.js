const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();
connectDB(); // Connect MongoDB

const app = express();
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

app.use(express.json());
app.use(cookieParser());




app.get("/", (req, res) => res.send("API is running 🚀"));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const browserRoutes = require("./routes/browserRoutes");
app.use("/api/browser-profiles", browserRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

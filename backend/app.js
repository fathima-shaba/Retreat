require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const roomRoutes = require("./routes/roomRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const visitorRoutes = require("./routes/visitorRoutes");

const app = express();

// Log warning if critical environment variables are missing
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.warn("⚠️ WARNING: JWT_SECRET environment variable is missing on server.");
}

// Rate limiting for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 auth requests per 15 mins
    message: { message: "Too many login attempts from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }
});

// Allowed Origins configuration for local dev and Vercel deployments
const allowedOrigins = [
    process.env.ALLOWED_ORIGIN,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(allowed => origin === allowed) || /\.vercel\.app$/.test(origin);
        if (isAllowed) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/visitors", visitorRoutes);

app.get("/api", (req, res) => {
    res.json({ message: "Hostel Management Supabase API is running" });
});

app.get("/", (req, res) => {
    res.send("Backend Running...");
});

module.exports = app;

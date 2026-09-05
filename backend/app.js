require("dotenv").config();

// Fail fast if critical environment variables are missing
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const roomRoutes = require("./routes/roomRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

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
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/api", (req, res) => {
    res.json({ message: "Hostel Management Supabase API is running" });
});

app.get("/", (req, res) => {
    res.send("Backend Running...");
});

module.exports = app;

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
        return res.status(500).json({ message: "Server configuration error: JWT_SECRET environment variable is missing." });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authMiddleware;

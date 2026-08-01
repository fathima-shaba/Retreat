const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;
    
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

        res.json({ message: "Login successful", token, user: { id: user.id, username: user.username, role: user.role } });
    });
};

const changePassword = (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        const user = results[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

        const hashedNew = await bcrypt.hash(newPassword, 10);
        db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNew, userId], (err) => {
            if (err) return res.status(500).json({ message: "Failed to update password", error: err });
            res.json({ message: "Password updated successfully" });
        });
    });
};

module.exports = { login, changePassword };

const supabase = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username);

        if (error) return res.status(500).json({ message: "Server error", error: error.message });
        if (!users || users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1d' }
        );

        res.json({ message: "Login successful", token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId);

        if (error) return res.status(500).json({ message: "Server error", error: error.message });
        if (!users || users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

        const hashedNew = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedNew })
            .eq('id', userId);

        if (updateError) return res.status(500).json({ message: "Failed to update password", error: updateError.message });
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { login, changePassword };

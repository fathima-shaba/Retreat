const db = require('../config/db');

exports.getAllExpenses = (req, res) => {
    db.query("SELECT * FROM expenses ORDER BY expense_date DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getExpenseStats = (req, res) => {
    // This will aggregate total expenses. 
    // We can do it broadly or grouped. Since it's a simple app, we can group by Month/Year in JS or SQL.
    // Easiest is to send all expenses, but for analytics:
    const query = `
        SELECT 
            SUM(CASE WHEN DATE(expense_date) = CURDATE() THEN amount ELSE 0 END) as daily,
            SUM(CASE WHEN MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE()) THEN amount ELSE 0 END) as monthly,
            SUM(CASE WHEN YEAR(expense_date) = YEAR(CURDATE()) THEN amount ELSE 0 END) as yearly,
            SUM(amount) as allTime
        FROM expenses
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
};

exports.createExpense = (req, res) => {
    const { category, amount, description, expense_date } = req.body;
    db.query(
        "INSERT INTO expenses (category, amount, description, expense_date) VALUES (?, ?, ?, ?)",
        [category, amount, description, expense_date],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, category, amount, description, expense_date });
        }
    );
};

exports.updateExpense = (req, res) => {
    const { category, amount, description, expense_date } = req.body;
    db.query(
        "UPDATE expenses SET category=?, amount=?, description=?, expense_date=? WHERE id=?",
        [category, amount, description, expense_date, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Expense updated successfully" });
        }
    );
};

exports.deleteExpense = (req, res) => {
    db.query("DELETE FROM expenses WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Expense deleted successfully" });
    });
};

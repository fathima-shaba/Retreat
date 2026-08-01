const db = require('../config/db');

exports.getAllPayments = (req, res) => {
    db.query(`
        SELECT p.*, s.name as student_name 
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.id
        ORDER BY p.payment_date DESC
    `, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createPayment = (req, res) => {
    const { student_id, amount, status, payment_date } = req.body;
    db.query(
        "INSERT INTO payments (student_id, amount, status, payment_date) VALUES (?, ?, ?, ?)",
        [student_id, amount, status, payment_date],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Automatic 1-month reminder logic
            if (status === 'Paid' && payment_date) {
                const payDate = new Date(payment_date);
                payDate.setMonth(payDate.getMonth() + 1);
                const nextDueDate = payDate.toISOString().split('T')[0];

                db.query("UPDATE students SET next_due_date = ? WHERE id = ?", [nextDueDate, student_id], (err2) => {
                    if (err2) console.error("Failed to update next_due_date", err2);
                    res.status(201).json({ id: result.insertId, student_id, amount, status });
                });
            } else {
                res.status(201).json({ id: result.insertId, student_id, amount, status });
            }
        }
    );
};

exports.updatePayment = (req, res) => {
    const { student_id, amount, status, payment_date } = req.body;
    db.query(
        "UPDATE payments SET student_id=?, amount=?, status=?, payment_date=? WHERE id=?",
        [student_id, amount, status, payment_date, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // If status changed to Paid, also update due date optionally (or just leave it for new creations)
            if (status === 'Paid' && payment_date) {
                const payDate = new Date(payment_date);
                payDate.setMonth(payDate.getMonth() + 1);
                const nextDueDate = payDate.toISOString().split('T')[0];

                db.query("UPDATE students SET next_due_date = ? WHERE id = ?", [nextDueDate, student_id], (err2) => {
                    res.json({ message: "Payment updated successfully" });
                });
            } else {
                res.json({ message: "Payment updated successfully" });
            }
        }
    );
};

exports.deletePayment = (req, res) => {
    db.query("DELETE FROM payments WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Payment deleted successfully" });
    });
};

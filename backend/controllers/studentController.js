const db = require('../config/db');

exports.getAllStudents = (req, res) => {
    const query = `
        SELECT s.*, r.room_number 
        FROM students s 
        LEFT JOIN rooms r ON s.room_id = r.id
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getStudentById = (req, res) => {
    db.query("SELECT * FROM students WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Student not found" });
        res.json(results[0]);
    });
};

exports.createStudent = (req, res) => {
    const { name, email, phone, room_id, address, joined_date, aadhar_number, admission_fee, rent_fee, next_due_date } = req.body;
    const finalRoomId = room_id ? room_id : null;
    const nextDue = next_due_date ? next_due_date : null;

    db.query(
        "INSERT INTO students (name, email, phone, room_id, address, joined_date, aadhar_number, admission_fee, rent_fee, next_due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, phone, finalRoomId, address, joined_date, aadhar_number, admission_fee || 0, rent_fee || 0, nextDue],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, name, email, phone, room_id: finalRoomId });
        }
    );
};

exports.updateStudent = (req, res) => {
    const { name, email, phone, room_id, address, joined_date, aadhar_number, admission_fee, rent_fee, next_due_date } = req.body;
    const finalRoomId = room_id ? room_id : null;
    const nextDue = next_due_date ? next_due_date : null;

    db.query(
        "UPDATE students SET name=?, email=?, phone=?, room_id=?, address=?, joined_date=?, aadhar_number=?, admission_fee=?, rent_fee=?, next_due_date=? WHERE id=?",
        [name, email, phone, finalRoomId, address, joined_date, aadhar_number, admission_fee || 0, rent_fee || 0, nextDue, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Student updated successfully" });
        }
    );
};

exports.deleteStudent = (req, res) => {
    db.query("DELETE FROM students WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student deleted successfully" });
    });
};

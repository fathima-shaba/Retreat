const db = require('../config/db');

exports.getAllMembers = (req, res) => {
    const query = `
        SELECT s.*, r.room_number 
        FROM members s 
        LEFT JOIN rooms r ON s.room_id = r.id
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getMemberById = (req, res) => {
    db.query("SELECT * FROM members WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Member not found" });
        res.json(results[0]);
    });
};

exports.createMember = (req, res) => {
    const { name, email, phone, room_id, address, joined_date, aadhar_number, admission_fee, rent_fee, next_due_date, member_type, institution_details } = req.body;
    const finalRoomId = room_id ? room_id : null;
    const nextDue = next_due_date ? next_due_date : null;
    const mType = member_type || 'Other';
    const iDetails = institution_details || '';

    db.query(
        "INSERT INTO members (name, email, phone, room_id, address, joined_date, aadhar_number, admission_fee, rent_fee, next_due_date, member_type, institution_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, phone, finalRoomId, address, joined_date, aadhar_number, admission_fee || 0, rent_fee || 0, nextDue, mType, iDetails],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, name, email, phone, room_id: finalRoomId, member_type: mType });
        }
    );
};

exports.updateMember = (req, res) => {
    const { name, email, phone, room_id, address, joined_date, aadhar_number, admission_fee, rent_fee, next_due_date, member_type, institution_details } = req.body;
    const finalRoomId = room_id ? room_id : null;
    const nextDue = next_due_date ? next_due_date : null;
    const mType = member_type || 'Other';
    const iDetails = institution_details || '';

    db.query(
        "UPDATE members SET name=?, email=?, phone=?, room_id=?, address=?, joined_date=?, aadhar_number=?, admission_fee=?, rent_fee=?, next_due_date=?, member_type=?, institution_details=? WHERE id=?",
        [name, email, phone, finalRoomId, address, joined_date, aadhar_number, admission_fee || 0, rent_fee || 0, nextDue, mType, iDetails, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Member updated successfully" });
        }
    );
};

exports.deleteMember = (req, res) => {
    db.query("DELETE FROM members WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Member deleted successfully" });
    });
};

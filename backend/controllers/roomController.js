const db = require('../config/db');

exports.getAllRooms = (req, res) => {
    db.query(`
        SELECT r.*, COUNT(m.id) as occupied_count 
        FROM rooms r 
        LEFT JOIN members m ON r.id = m.room_id 
        GROUP BY r.id
    `, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createRoom = (req, res) => {
    const { room_number, capacity, type, floor } = req.body;
    db.query(
        "INSERT INTO rooms (room_number, capacity, type, floor) VALUES (?, ?, ?, ?)",
        [room_number, capacity, type, floor || 'A'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, room_number, capacity, type, floor });
        }
    );
};

exports.updateRoom = (req, res) => {
    const { room_number, capacity, type, floor, status } = req.body;
    db.query(
        "UPDATE rooms SET room_number=?, capacity=?, type=?, floor=?, status=? WHERE id=?",
        [room_number, capacity, type, floor, status, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Room updated successfully" });
        }
    );
};

exports.deleteRoom = (req, res) => {
    db.query("DELETE FROM rooms WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Room deleted successfully" });
    });
};

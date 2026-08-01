const db = require('../config/db');

exports.getStats = (req, res) => {
    const queries = {
        totalStudents: "SELECT COUNT(*) as count FROM students",
        totalRooms: "SELECT COUNT(*) as count FROM rooms",
        occupiedRooms: "SELECT COUNT(*) as count FROM rooms WHERE status='Occupied'",
        vacantRooms: "SELECT COUNT(*) as count FROM rooms WHERE status='Available'",
        totalPayments: "SELECT SUM(amount) as sum FROM payments WHERE status='Paid'",
        pendingPayments: "SELECT SUM(amount) as sum FROM payments WHERE status='Pending'"
    };

    let results = {};
    let completed = 0;
    const queryKeys = Object.keys(queries);

    if (queryKeys.length === 0) {
        return res.json(results);
    }

    queryKeys.forEach(key => {
        db.query(queries[key], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            results[key] = result[0].count !== undefined ? result[0].count : (result[0].sum || 0);
            completed++;

            if (completed === queryKeys.length) {
                res.json(results);
            }
        });
    });
};

const db = require('../config/db');

exports.getAllRooms = (req, res) => {
    const query = `
        SELECT r.*, COUNT(m.id) as occupied_count 
        FROM rooms r 
        LEFT JOIN members m ON r.id = m.room_id 
        GROUP BY r.id
    `;

    db.query(query, (err, rooms) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rooms.length === 0) return res.json([]);

        // Fetch sharing rates for all rooms
        db.query("SELECT * FROM room_sharing_rates ORDER BY sharing_type ASC", (err, rates) => {
            if (err) {
                console.error("Error fetching room_sharing_rates:", err.message);
                // Return rooms without rates if query fails
                return res.json(rooms.map(r => ({ ...r, sharing_rates: [] })));
            }

            // Map sharing rates to their respective rooms
            const roomsWithRates = rooms.map(room => {
                const roomRates = rates.filter(rate => rate.room_id === room.id);
                return {
                    ...room,
                    sharing_rates: roomRates.map(r => ({
                        id: r.id,
                        sharing_type: r.sharing_type,
                        monthly_rent: Number(r.monthly_rent)
                    }))
                };
            });

            res.json(roomsWithRates);
        });
    });
};

exports.createRoom = (req, res) => {
    const { room_number, capacity, type, floor, status, sharing_rates } = req.body;
    
    db.query(
        "INSERT INTO rooms (room_number, capacity, type, floor, status) VALUES (?, ?, ?, ?, ?)",
        [room_number, capacity, type, floor || 'A', status || 'Available'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const roomId = result.insertId;

            // Save custom sharing rates if provided
            if (Array.isArray(sharing_rates) && sharing_rates.length > 0) {
                const ratesValues = sharing_rates.map(sr => [
                    roomId, 
                    parseInt(sr.sharing_type), 
                    parseFloat(sr.monthly_rent)
                ]);

                db.query(
                    "INSERT INTO room_sharing_rates (room_id, sharing_type, monthly_rent) VALUES ?",
                    [ratesValues],
                    (err) => {
                        if (err) console.error("Error saving room sharing rates:", err.message);
                        res.status(201).json({ id: roomId, room_number, capacity, type, floor, status, sharing_rates });
                    }
                );
            } else {
                // Generate default rate matching capacity if none passed
                const defaultRates = [];
                for (let s = 1; s <= (capacity || 2); s++) {
                    let baseRent = 6000;
                    if (s === 1) baseRent = 8000;
                    else if (s === 2) baseRent = 6000;
                    else if (s === 3) baseRent = 5000;
                    else if (s === 4) baseRent = 4500;
                    else baseRent = 4000;
                    defaultRates.push([roomId, s, baseRent]);
                }

                db.query(
                    "INSERT INTO room_sharing_rates (room_id, sharing_type, monthly_rent) VALUES ?",
                    [defaultRates],
                    () => {
                        res.status(201).json({ id: roomId, room_number, capacity, type, floor, status });
                    }
                );
            }
        }
    );
};

exports.updateRoom = (req, res) => {
    const roomId = req.params.id;
    const { room_number, capacity, type, floor, status, sharing_rates } = req.body;

    db.query(
        "UPDATE rooms SET room_number=?, capacity=?, type=?, floor=?, status=? WHERE id=?",
        [room_number, capacity, type, floor, status, roomId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Delete old sharing rates and insert updated ones if array provided
            if (Array.isArray(sharing_rates)) {
                db.query("DELETE FROM room_sharing_rates WHERE room_id = ?", [roomId], (err) => {
                    if (err) console.error("Error clearing old sharing rates:", err.message);

                    if (sharing_rates.length > 0) {
                        const ratesValues = sharing_rates.map(sr => [
                            roomId, 
                            parseInt(sr.sharing_type), 
                            parseFloat(sr.monthly_rent)
                        ]);

                        db.query(
                            "INSERT INTO room_sharing_rates (room_id, sharing_type, monthly_rent) VALUES ?",
                            [ratesValues],
                            (err) => {
                                if (err) console.error("Error inserting updated sharing rates:", err.message);
                                res.json({ message: "Room and sharing rates updated successfully" });
                            }
                        );
                    } else {
                        res.json({ message: "Room updated successfully" });
                    }
                });
            } else {
                res.json({ message: "Room updated successfully" });
            }
        }
    );
};

exports.deleteRoom = (req, res) => {
    db.query("DELETE FROM rooms WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Room deleted successfully" });
    });
};

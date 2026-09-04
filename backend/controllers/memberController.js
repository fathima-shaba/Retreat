const db = require('../config/db');

// Helper to update room statuses based on capacity and current occupancy
const syncRoomStatuses = (roomIds) => {
    const validIds = Array.from(new Set(roomIds.filter(id => id != null)));
    if (validIds.length === 0) return;

    validIds.forEach(roomId => {
        db.query("SELECT capacity FROM rooms WHERE id = ?", [roomId], (err, rooms) => {
            if (err || rooms.length === 0) return;
            const capacity = rooms[0].capacity;

            db.query("SELECT COUNT(*) as active_count FROM members WHERE room_id = ?", [roomId], (err, res) => {
                if (err) return;
                const activeCount = res[0].active_count;
                const newStatus = activeCount >= capacity ? 'Occupied' : 'Available';
                db.query("UPDATE rooms SET status = ? WHERE id = ?", [newStatus, roomId]);
            });
        });
    });
};

exports.getAllMembers = (req, res) => {
    const query = `
        SELECT s.*, r.room_number, r.capacity as room_capacity
        FROM members s 
        LEFT JOIN rooms r ON s.room_id = r.id
        ORDER BY s.id DESC
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
    const { 
        name, email, phone, dob, aadhar_number, guardian_name, guardian_phone,
        room_id, sharing_type, address, joined_date, 
        admission_fee, deposit_fee, rent_fee, next_due_date, 
        member_type, institution_details 
    } = req.body;

    const finalRoomId = room_id ? parseInt(room_id) : null;
    const finalSharingType = sharing_type ? parseInt(sharing_type) : null;
    const nextDue = next_due_date ? next_due_date : null;
    const dobValue = dob ? dob : null;
    const mType = member_type || 'Other';
    const iDetails = institution_details || '';

    // Check room bed availability if assigning to a room
    if (finalRoomId) {
        db.query(
            `SELECT r.capacity, COUNT(m.id) as current_occupancy 
             FROM rooms r 
             LEFT JOIN members m ON r.id = m.room_id 
             WHERE r.id = ? 
             GROUP BY r.id`,
            [finalRoomId],
            (err, roomData) => {
                if (err) return res.status(500).json({ error: err.message });
                if (roomData.length > 0) {
                    const { capacity, current_occupancy } = roomData[0];
                    if (current_occupancy >= capacity) {
                        return res.status(400).json({ error: `Selected room is fully occupied (${capacity}/${capacity} beds assigned). Please select another room.` });
                    }
                }

                // Proceed with creation
                insertMember();
            }
        );
    } else {
        insertMember();
    }

    function insertMember() {
        const query = `
            INSERT INTO members (
                name, email, phone, dob, aadhar_number, guardian_name, guardian_phone,
                room_id, sharing_type, address, joined_date, 
                admission_fee, deposit_fee, rent_fee, next_due_date, 
                member_type, institution_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name, email, phone, dobValue, aadhar_number, guardian_name, guardian_phone,
            finalRoomId, finalSharingType, address, joined_date,
            admission_fee || 0, deposit_fee || 0, rent_fee || 0, nextDue,
            mType, iDetails
        ];

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Sync room status
            if (finalRoomId) syncRoomStatuses([finalRoomId]);

            res.status(201).json({ 
                id: result.insertId, 
                name, email, phone, room_id: finalRoomId, sharing_type: finalSharingType, member_type: mType 
            });
        });
    }
};

exports.updateMember = (req, res) => {
    const memberId = req.params.id;
    const { 
        name, email, phone, dob, aadhar_number, guardian_name, guardian_phone,
        room_id, sharing_type, address, joined_date, 
        admission_fee, deposit_fee, rent_fee, next_due_date, 
        member_type, institution_details 
    } = req.body;

    const finalRoomId = room_id ? parseInt(room_id) : null;
    const finalSharingType = sharing_type ? parseInt(sharing_type) : null;
    const nextDue = next_due_date ? next_due_date : null;
    const dobValue = dob ? dob : null;
    const mType = member_type || 'Other';
    const iDetails = institution_details || '';

    // First fetch existing member to check old room_id
    db.query("SELECT room_id FROM members WHERE id = ?", [memberId], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing.length === 0) return res.status(404).json({ error: "Resident not found" });

        const oldRoomId = existing[0].room_id;

        // If room is changing to a new room, check capacity of target room
        if (finalRoomId && finalRoomId !== oldRoomId) {
            db.query(
                `SELECT r.capacity, COUNT(m.id) as current_occupancy 
                 FROM rooms r 
                 LEFT JOIN members m ON r.id = m.room_id AND m.id != ?
                 WHERE r.id = ? 
                 GROUP BY r.id`,
                [memberId, finalRoomId],
                (err, roomData) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (roomData.length > 0) {
                        const { capacity, current_occupancy } = roomData[0];
                        if (current_occupancy >= capacity) {
                            return res.status(400).json({ error: `Selected target room is fully occupied (${capacity}/${capacity} beds assigned). Please select another room.` });
                        }
                    }

                    // Proceed with update
                    executeUpdate(oldRoomId);
                }
            );
        } else {
            executeUpdate(oldRoomId);
        }
    });

    function executeUpdate(oldRoomId) {
        const query = `
            UPDATE members SET 
                name=?, email=?, phone=?, dob=?, aadhar_number=?, guardian_name=?, guardian_phone=?,
                room_id=?, sharing_type=?, address=?, joined_date=?, 
                admission_fee=?, deposit_fee=?, rent_fee=?, next_due_date=?, 
                member_type=?, institution_details=?
            WHERE id=?
        `;

        const values = [
            name, email, phone, dobValue, aadhar_number, guardian_name, guardian_phone,
            finalRoomId, finalSharingType, address, joined_date,
            admission_fee || 0, deposit_fee || 0, rent_fee || 0, nextDue,
            mType, iDetails, memberId
        ];

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Synchronize statuses of both old and new rooms
            syncRoomStatuses([oldRoomId, finalRoomId]);

            res.json({ message: "Resident information updated successfully" });
        });
    }
};

exports.deleteMember = (req, res) => {
    const memberId = req.params.id;

    // Get room_id before deletion to sync room status after
    db.query("SELECT room_id FROM members WHERE id = ?", [memberId], (err, existing) => {
        const oldRoomId = (existing && existing.length > 0) ? existing[0].room_id : null;

        db.query("DELETE FROM members WHERE id = ?", [memberId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (oldRoomId) syncRoomStatuses([oldRoomId]);
            res.json({ message: "Member deleted successfully" });
        });
    });
};

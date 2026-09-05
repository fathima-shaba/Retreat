const supabase = require('../config/db');

// GET /api/attendance?date=YYYY-MM-DD
exports.getAttendance = async (req, res) => {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];

    try {
        // Fetch all active residents
        const { data: members, error: mErr } = await supabase
            .from('members')
            .select('id, name, room_id, rooms(room_number)')
            .order('id', { ascending: true });

        if (mErr) return res.status(500).json({ error: mErr.message });

        // Fetch attendance records for the target date
        const { data: attendanceRecords, error: aErr } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', targetDate);

        if (aErr) return res.status(500).json({ error: aErr.message });

        // Map attendance status to each resident
        const attendanceMap = {};
        (attendanceRecords || []).forEach(att => {
            attendanceMap[att.resident_id] = att;
        });

        const roster = (members || []).map(m => {
            const att = attendanceMap[m.id];
            const roomObj = m.rooms || {};
            return {
                resident_id: m.id,
                name: m.name,
                room_number: roomObj.room_number || 'Unassigned',
                date: targetDate,
                status: att ? att.status : 'Present',
                remarks: att ? att.remarks || '' : '',
                attendance_id: att ? att.id : null
            };
        });

        res.json({
            date: targetDate,
            roster
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/attendance - Save/Upsert single or batch attendance
exports.markAttendance = async (req, res) => {
    const { date, records } = req.body;

    const targetDate = date || new Date().toISOString().split('T')[0];
    const items = Array.isArray(records) ? records : (Array.isArray(req.body) ? req.body : [req.body]);

    if (items.length === 0) {
        return res.status(400).json({ error: "No attendance records provided." });
    }

    const upsertPayload = items.map(item => ({
        resident_id: parseInt(item.resident_id),
        date: item.date || targetDate,
        status: item.status || 'Present',
        remarks: item.remarks || ''
    }));

    try {
        const { data, error } = await supabase
            .from('attendance')
            .upsert(upsertPayload, { onConflict: 'resident_id, date' })
            .select();

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json({
            message: "Attendance saved successfully",
            count: data ? data.length : upsertPayload.length,
            records: data
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

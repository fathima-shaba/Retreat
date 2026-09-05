const supabase = require('../config/db');

exports.getAllRooms = async (req, res) => {
    try {
        const { data: rooms, error: rErr } = await supabase
            .from('rooms')
            .select('*, members(id)')
            .order('id', { ascending: true });

        if (rErr) return res.status(500).json({ error: rErr.message });
        if (!rooms || rooms.length === 0) return res.json([]);

        const { data: rates, error: rateErr } = await supabase
            .from('room_sharing_rates')
            .select('*')
            .order('sharing_type', { ascending: true });

        if (rateErr) console.error("Error fetching room_sharing_rates:", rateErr.message);

        const roomsWithRates = rooms.map(room => {
            const occupied_count = room.members ? room.members.length : 0;
            const { members, ...roomFields } = room;
            const roomRates = (rates || []).filter(rate => rate.room_id === room.id);

            return {
                ...roomFields,
                occupied_count,
                sharing_rates: roomRates.map(r => ({
                    id: r.id,
                    sharing_type: r.sharing_type,
                    monthly_rent: Number(r.monthly_rent)
                }))
            };
        });

        res.json(roomsWithRates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRoom = async (req, res) => {
    const { room_number, capacity, type, floor, status, sharing_rates } = req.body;
    
    try {
        const { data: inserted, error: rErr } = await supabase
            .from('rooms')
            .insert([{
                room_number,
                capacity: parseInt(capacity),
                type,
                floor: floor || 'A',
                status: status || 'Available'
            }])
            .select();

        if (rErr) return res.status(500).json({ error: rErr.message });

        const roomId = inserted[0].id;

        // Save custom or default sharing rates
        let ratesToInsert = [];
        if (Array.isArray(sharing_rates) && sharing_rates.length > 0) {
            ratesToInsert = sharing_rates.map(sr => ({
                room_id: roomId,
                sharing_type: parseInt(sr.sharing_type),
                monthly_rent: parseFloat(sr.monthly_rent)
            }));
        } else {
            const cap = parseInt(capacity) || 2;
            for (let s = 1; s <= cap; s++) {
                let baseRent = 6000;
                if (s === 1) baseRent = 8000;
                else if (s === 2) baseRent = 6000;
                else if (s === 3) baseRent = 5000;
                else if (s === 4) baseRent = 4500;
                else baseRent = 4000;
                ratesToInsert.push({ room_id: roomId, sharing_type: s, monthly_rent: baseRent });
            }
        }

        if (ratesToInsert.length > 0) {
            const { error: rateInsertErr } = await supabase
                .from('room_sharing_rates')
                .insert(ratesToInsert);
            if (rateInsertErr) console.error("Error saving room sharing rates:", rateInsertErr.message);
        }

        res.status(201).json({ id: roomId, room_number, capacity, type, floor, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRoom = async (req, res) => {
    const roomId = req.params.id;
    const { room_number, capacity, type, floor, status, sharing_rates } = req.body;

    try {
        const { error: updateErr } = await supabase
            .from('rooms')
            .update({
                room_number,
                capacity: parseInt(capacity),
                type,
                floor,
                status
            })
            .eq('id', roomId);

        if (updateErr) return res.status(500).json({ error: updateErr.message });

        if (Array.isArray(sharing_rates)) {
            // Delete old sharing rates
            await supabase
                .from('room_sharing_rates')
                .delete()
                .eq('room_id', roomId);

            if (sharing_rates.length > 0) {
                const ratesToInsert = sharing_rates.map(sr => ({
                    room_id: parseInt(roomId),
                    sharing_type: parseInt(sr.sharing_type),
                    monthly_rent: parseFloat(sr.monthly_rent)
                }));

                const { error: rateInsertErr } = await supabase
                    .from('room_sharing_rates')
                    .insert(ratesToInsert);
                if (rateInsertErr) console.error("Error inserting updated sharing rates:", rateInsertErr.message);
            }
        }

        res.json({ message: "Room and sharing rates updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Room deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

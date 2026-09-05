const supabase = require('../config/db');

// Helper to update room statuses based on capacity and current occupancy
const syncRoomStatuses = async (roomIds) => {
    const validIds = Array.from(new Set(roomIds.filter(id => id != null)));
    if (validIds.length === 0) return;

    for (const roomId of validIds) {
        try {
            const { data: roomData } = await supabase.from('rooms').select('capacity').eq('id', roomId);
            if (!roomData || roomData.length === 0) continue;
            const capacity = roomData[0].capacity;

            const { count: activeCount } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', roomId);

            const newStatus = (activeCount || 0) >= capacity ? 'Occupied' : 'Available';
            await supabase.from('rooms').update({ status: newStatus }).eq('id', roomId);
        } catch (e) {
            console.error(`Error syncing room status for room ${roomId}:`, e.message);
        }
    }
};

exports.getAllMembers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*, rooms(room_number, capacity)')
            .order('id', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(s => {
            const roomObj = s.rooms || {};
            const { rooms, ...memberFields } = s;
            return {
                ...memberFields,
                room_number: roomObj.room_number || null,
                room_capacity: roomObj.capacity || null
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: "Member not found" });

        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMember = async (req, res) => {
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

    try {
        // Check room bed availability if assigning to a room
        if (finalRoomId) {
            const { data: roomData, error: rErr } = await supabase
                .from('rooms')
                .select('capacity')
                .eq('id', finalRoomId);

            if (rErr) return res.status(500).json({ error: rErr.message });

            if (roomData && roomData.length > 0) {
                const capacity = roomData[0].capacity;
                const { count: currentOccupancy } = await supabase
                    .from('members')
                    .select('*', { count: 'exact', head: true })
                    .eq('room_id', finalRoomId);

                if ((currentOccupancy || 0) >= capacity) {
                    return res.status(400).json({ 
                        error: `Selected room is fully occupied (${capacity}/${capacity} beds assigned). Please select another room.` 
                    });
                }
            }
        }

        const { data: inserted, error: insertErr } = await supabase
            .from('members')
            .insert([{
                name,
                email,
                phone,
                dob: dobValue,
                aadhar_number,
                guardian_name,
                guardian_phone,
                room_id: finalRoomId,
                sharing_type: finalSharingType,
                address,
                joined_date,
                admission_fee: admission_fee || 0,
                deposit_fee: deposit_fee || 0,
                rent_fee: rent_fee || 0,
                next_due_date: nextDue,
                member_type: mType,
                institution_details: iDetails
            }])
            .select();

        if (insertErr) return res.status(500).json({ error: insertErr.message });

        if (finalRoomId) await syncRoomStatuses([finalRoomId]);

        const newId = inserted && inserted[0] ? inserted[0].id : null;
        res.status(201).json({ 
            id: newId, 
            name, email, phone, room_id: finalRoomId, sharing_type: finalSharingType, member_type: mType 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMember = async (req, res) => {
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

    try {
        const { data: existing, error: fetchErr } = await supabase
            .from('members')
            .select('room_id')
            .eq('id', memberId);

        if (fetchErr) return res.status(500).json({ error: fetchErr.message });
        if (!existing || existing.length === 0) return res.status(404).json({ error: "Resident not found" });

        const oldRoomId = existing[0].room_id;

        // If room is changing to a new room, check capacity of target room
        if (finalRoomId && finalRoomId !== oldRoomId) {
            const { data: roomData, error: rErr } = await supabase
                .from('rooms')
                .select('capacity')
                .eq('id', finalRoomId);

            if (rErr) return res.status(500).json({ error: rErr.message });

            if (roomData && roomData.length > 0) {
                const capacity = roomData[0].capacity;
                const { count: currentOccupancy } = await supabase
                    .from('members')
                    .select('*', { count: 'exact', head: true })
                    .eq('room_id', finalRoomId)
                    .neq('id', memberId);

                if ((currentOccupancy || 0) >= capacity) {
                    return res.status(400).json({ 
                        error: `Selected target room is fully occupied (${capacity}/${capacity} beds assigned). Please select another room.` 
                    });
                }
            }
        }

        const { error: updateErr } = await supabase
            .from('members')
            .update({
                name,
                email,
                phone,
                dob: dobValue,
                aadhar_number,
                guardian_name,
                guardian_phone,
                room_id: finalRoomId,
                sharing_type: finalSharingType,
                address,
                joined_date,
                admission_fee: admission_fee || 0,
                deposit_fee: deposit_fee || 0,
                rent_fee: rent_fee || 0,
                next_due_date: nextDue,
                member_type: mType,
                institution_details: iDetails
            })
            .eq('id', memberId);

        if (updateErr) return res.status(500).json({ error: updateErr.message });

        await syncRoomStatuses([oldRoomId, finalRoomId]);

        res.json({ message: "Resident information updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMember = async (req, res) => {
    const memberId = req.params.id;

    try {
        const { data: existing } = await supabase
            .from('members')
            .select('room_id')
            .eq('id', memberId);

        const oldRoomId = (existing && existing.length > 0) ? existing[0].room_id : null;

        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', memberId);

        if (error) return res.status(500).json({ error: error.message });

        if (oldRoomId) await syncRoomStatuses([oldRoomId]);
        res.json({ message: "Member deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

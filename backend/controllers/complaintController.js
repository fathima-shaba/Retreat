const supabase = require('../config/db');

exports.getAllComplaints = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*, members(name, email, room_id), rooms(room_number)')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(item => {
            const memberObj = item.members || {};
            const roomObj = item.rooms || {};
            const { members, rooms, ...fields } = item;
            return {
                ...fields,
                resident_name: memberObj.name || 'Anonymous / General',
                room_number: roomObj.room_number || 'N/A'
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createComplaint = async (req, res) => {
    const { resident_id, room_id, category, title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required." });
    }

    try {
        const { data, error } = await supabase
            .from('complaints')
            .insert([{
                resident_id: resident_id ? parseInt(resident_id) : null,
                room_id: room_id ? parseInt(room_id) : null,
                category: category || 'Maintenance',
                title: title.trim(),
                description: description.trim(),
                status: 'Pending'
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data ? data[0] : {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
    }

    try {
        const { data, error } = await supabase
            .from('complaints')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: `Complaint status updated to ${status}`, record: data ? data[0] : {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

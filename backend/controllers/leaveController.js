const supabase = require('../config/db');

// Get all leave requests
exports.getAllLeaveRequests = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .select('*, members(name, email, room_id)')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(item => {
            const memberObj = item.members || {};
            const { members, ...fields } = item;
            return {
                ...fields,
                resident_name: memberObj.name || 'Unknown Resident',
                resident_email: memberObj.email || ''
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new leave request
exports.createLeaveRequest = async (req, res) => {
    const { resident_id, start_date, end_date, reason } = req.body;
    
    if (!resident_id || !start_date || !end_date || !reason) {
        return res.status(400).json({ error: "Resident ID, start date, end date, and reason are required." });
    }

    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .insert([{
                resident_id: parseInt(resident_id),
                start_date,
                end_date,
                reason,
                status: 'Pending'
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data ? data[0] : {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update leave request status (Approved / Rejected)
exports.updateLeaveStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status option." });
    }

    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: `Leave request status updated to ${status}`, record: data ? data[0] : {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

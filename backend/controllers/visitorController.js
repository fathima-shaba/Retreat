const supabase = require('../config/db');

exports.getAllVisitors = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .select('*, members(name, room_id)')
            .order('check_in', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(v => {
            const memberObj = v.members || {};
            const { members, ...fields } = v;
            return {
                ...fields,
                resident_name: memberObj.name || 'General Visit'
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.registerVisitor = async (req, res) => {
    const { visitor_name, phone, resident_id, purpose } = req.body;

    if (!visitor_name) {
        return res.status(400).json({ error: "Visitor name is required." });
    }

    try {
        const { data, error } = await supabase
            .from('visitors')
            .insert([{
                visitor_name: visitor_name.trim(),
                phone: phone ? phone.trim() : null,
                resident_id: resident_id ? parseInt(resident_id) : null,
                purpose: purpose ? purpose.trim() : '',
                check_in: new Date().toISOString()
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data ? data[0] : {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.checkoutVisitor = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('visitors')
            .update({ check_out: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Visitor checked out successfully", visitor: data ? data[0] : {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

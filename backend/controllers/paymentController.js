const supabase = require('../config/db');

exports.getAllPayments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*, members(name)')
            .order('payment_date', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(p => {
            const memberObj = p.members || {};
            const { members, ...paymentFields } = p;
            return {
                ...paymentFields,
                member_name: memberObj.name || null
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPayment = async (req, res) => {
    const { member_id, amount, status, payment_date } = req.body;
    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([{ member_id, amount, status, payment_date }])
            .select();

        if (error) return res.status(500).json({ error: error.message });

        const insertedId = data && data[0] ? data[0].id : null;

        // Automatic 1-month reminder logic
        if (status === 'Paid' && payment_date) {
            const payDate = new Date(payment_date);
            payDate.setMonth(payDate.getMonth() + 1);
            const nextDueDate = payDate.toISOString().split('T')[0];

            await supabase
                .from('members')
                .update({ next_due_date: nextDueDate })
                .eq('id', member_id);
        }

        res.status(201).json({ id: insertedId, member_id, amount, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    const { member_id, amount, status, payment_date } = req.body;
    try {
        const { error } = await supabase
            .from('payments')
            .update({ member_id, amount, status, payment_date })
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });

        if (status === 'Paid' && payment_date) {
            const payDate = new Date(payment_date);
            payDate.setMonth(payDate.getMonth() + 1);
            const nextDueDate = payDate.toISOString().split('T')[0];

            await supabase
                .from('members')
                .update({ next_due_date: nextDueDate })
                .eq('id', member_id);
        }

        res.json({ message: "Payment updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Payment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

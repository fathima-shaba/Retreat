const supabase = require('../config/db');

exports.getAllPayments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*, members(name, email, room_id)')
            .order('payment_date', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(p => {
            const memberObj = p.members || {};
            const { members, ...paymentFields } = p;
            return {
                ...paymentFields,
                member_name: memberObj.name || null,
                member_email: memberObj.email || null
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPayment = async (req, res) => {
    const { member_id, amount, status, payment_date, payment_mode, receipt_no, remarks } = req.body;
    try {
        const dateStr = payment_date || new Date().toISOString().split('T')[0];
        const generatedReceipt = receipt_no || `REC-${dateStr.replace(/-/g, '').slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const mode = payment_mode || 'Cash';

        const { data, error } = await supabase
            .from('payments')
            .insert([{ 
                member_id, 
                amount: parseFloat(amount) || 0, 
                status: status || 'Paid', 
                payment_date: dateStr,
                payment_mode: mode,
                receipt_no: generatedReceipt,
                remarks: remarks || ''
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });

        const insertedRecord = data && data[0] ? data[0] : {};

        // Automatic 1-month rent due date advancement if payment status is Paid
        if ((status === 'Paid' || !status) && dateStr) {
            const payDate = new Date(dateStr);
            payDate.setMonth(payDate.getMonth() + 1);
            const nextDueDate = payDate.toISOString().split('T')[0];

            await supabase
                .from('members')
                .update({ next_due_date: nextDueDate })
                .eq('id', member_id);
        }

        res.status(201).json(insertedRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    const { member_id, amount, status, payment_date, payment_mode, receipt_no, remarks } = req.body;
    try {
        const { error } = await supabase
            .from('payments')
            .update({ 
                member_id, 
                amount: parseFloat(amount) || 0, 
                status, 
                payment_date,
                payment_mode,
                receipt_no,
                remarks 
            })
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

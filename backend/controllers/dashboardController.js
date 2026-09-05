const supabase = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [
            { count: totalStudents, error: err1 },
            { count: totalRooms, error: err2 },
            { count: occupiedRooms, error: err3 },
            { count: vacantRooms, error: err4 },
            { data: paidPayments, error: err5 },
            { data: pendingPaymentsData, error: err6 }
        ] = await Promise.all([
            supabase.from('members').select('*', { count: 'exact', head: true }),
            supabase.from('rooms').select('*', { count: 'exact', head: true }),
            supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Occupied'),
            supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
            supabase.from('payments').select('amount').eq('status', 'Paid'),
            supabase.from('payments').select('amount').eq('status', 'Pending')
        ]);

        if (err1 || err2 || err3 || err4 || err5 || err6) {
            const firstErr = err1 || err2 || err3 || err4 || err5 || err6;
            return res.status(500).json({ error: firstErr.message });
        }

        const totalPayments = (paidPayments || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const pendingPayments = (pendingPaymentsData || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        res.json({
            totalStudents: totalStudents || 0,
            totalRooms: totalRooms || 0,
            occupiedRooms: occupiedRooms || 0,
            vacantRooms: vacantRooms || 0,
            totalPayments,
            pendingPayments
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

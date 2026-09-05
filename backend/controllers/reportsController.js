const supabase = require('../config/db');

// Get Occupancy Summary Report
exports.getOccupancyReport = async (req, res) => {
    try {
        const { data: rooms, error: roomError } = await supabase.from('rooms').select('*');
        if (roomError) return res.status(500).json({ error: roomError.message });

        const { data: members, error: memberError } = await supabase.from('members').select('*');
        if (memberError) return res.status(500).json({ error: memberError.message });

        const totalRooms = rooms ? rooms.length : 0;
        const totalBeds = rooms ? rooms.reduce((sum, r) => sum + (r.capacity || 0), 0) : 0;
        const occupiedBeds = members ? members.filter(m => m.room_id !== null).length : 0;
        const availableBeds = Math.max(0, totalBeds - occupiedBeds);
        const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

        res.json({
            total_rooms: totalRooms,
            total_beds: totalBeds,
            occupied_beds: occupiedBeds,
            available_beds: availableBeds,
            occupancy_rate: parseFloat(occupancyRate)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Financial Summary Report
exports.getFinancialReport = async (req, res) => {
    try {
        const { data: payments, error: payError } = await supabase.from('payments').select('*');
        if (payError) return res.status(500).json({ error: payError.message });

        const { data: expenses, error: expError } = await supabase.from('expenses').select('*');
        if (expError) return res.status(500).json({ error: expError.message });

        const totalRevenue = (payments || [])
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const totalPending = (payments || [])
            .filter(p => p.status === 'Pending' || p.status === 'Overdue')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const totalExpenses = (expenses || [])
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const netIncome = totalRevenue - totalExpenses;

        res.json({
            total_revenue: totalRevenue,
            total_pending: totalPending,
            total_expenses: totalExpenses,
            net_income: netIncome
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Generate & Stream CSV Export
exports.exportCSV = async (req, res) => {
    const { type } = req.params; // 'members' | 'payments' | 'expenses'
    try {
        let filename = `report_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        let csvContent = "";

        if (type === 'members') {
            const { data } = await supabase.from('members').select('*');
            csvContent = "ID,Name,Email,Phone,Room ID,Sharing Type,Rent Fee,Joined Date\n";
            (data || []).forEach(m => {
                csvContent += `"${m.id}","${m.name}","${m.email}","${m.phone || ''}","${m.room_id || ''}","${m.sharing_type || ''}","${m.rent_fee || 0}","${m.joined_date || ''}"\n`;
            });
        } else if (type === 'payments') {
            const { data } = await supabase.from('payments').select('*, members(name)');
            csvContent = "Receipt No,Resident Name,Amount,Status,Payment Mode,Payment Date\n";
            (data || []).forEach(p => {
                const name = p.members ? p.members.name : 'Unknown';
                csvContent += `"${p.receipt_no || ''}","${name}","${p.amount}","${p.status}","${p.payment_mode || 'Cash'}","${p.payment_date || ''}"\n`;
            });
        } else if (type === 'expenses') {
            const { data } = await supabase.from('expenses').select('*');
            csvContent = "ID,Category,Amount,Description,Expense Date,Payment Method\n";
            (data || []).forEach(e => {
                csvContent += `"${e.id}","${e.category}","${e.amount}","${e.description || ''}","${e.expense_date || ''}","${e.payment_method || ''}"\n`;
            });
        } else {
            return res.status(400).json({ error: "Invalid CSV report type" });
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const supabase = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [
            { count: totalStudents, error: err1 },
            { data: rooms, error: err2 },
            { data: paidPayments, error: err3 },
            { data: pendingPaymentsData, error: err4 },
            { data: recentMembers, error: err5 },
            { data: recentExpensesData, error: err6 }
        ] = await Promise.all([
            // 1. Total Active Residents Count
            supabase.from('members').select('*', { count: 'exact', head: true }),
            
            // 2. Rooms & Capacity Details
            supabase.from('rooms').select('*, members(id)'),
            
            // 3. Paid Payments Sum
            supabase.from('payments').select('amount').eq('status', 'Paid'),
            
            // 4. Pending Payments Sum & Count
            supabase.from('payments').select('amount').eq('status', 'Pending'),

            // 5. Recent Check-ins (top 4 joined members)
            supabase.from('members')
                .select('id, name, joined_date, room_id, rooms(room_number)')
                .order('id', { ascending: false })
                .limit(4),

            // 6. Recent Expenses (top 4 expenses)
            supabase.from('expenses')
                .select('id, category, description, amount, expense_date')
                .order('expense_date', { ascending: false })
                .order('id', { ascending: false })
                .limit(4)
        ]);

        if (err1 || err2 || err3 || err4 || err5 || err6) {
            const firstErr = err1 || err2 || err3 || err4 || err5 || err6;
            return res.status(500).json({ error: firstErr.message });
        }

        const roomList = rooms || [];

        // Aggregate room statuses and capacities
        let occupiedRoomsCount = 0;
        let vacantRoomsCount = 0;
        let maintenanceRoomsCount = 0;
        let totalBedsCapacity = 0;
        let totalOccupiedBeds = 0;

        const floorMap = {};

        roomList.forEach(r => {
            const cap = Number(r.capacity || 0);
            const occCount = r.members ? r.members.length : 0;

            totalBedsCapacity += cap;
            totalOccupiedBeds += occCount;

            if (r.status === 'Occupied') occupiedRoomsCount++;
            else if (r.status === 'Maintenance') maintenanceRoomsCount++;
            else vacantRoomsCount++;

            // Floor-wise aggregation
            const floorName = r.floor ? `Floor ${r.floor}` : 'Other';
            if (!floorMap[floorName]) {
                floorMap[floorName] = { occupied: 0, total: 0 };
            }
            floorMap[floorName].total += 1;
            if (r.status === 'Occupied' || occCount > 0) {
                floorMap[floorName].occupied += 1;
            }
        });

        const availableBeds = Math.max(0, totalBedsCapacity - totalOccupiedBeds);

        // Payments calculation
        const totalPayments = (paidPayments || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const pendingPayments = (pendingPaymentsData || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const pendingCount = (pendingPaymentsData || []).length;

        // Dynamic Floor/Block status list
        const roomStatus = Object.keys(floorMap).sort().map(floor => {
            const f = floorMap[floor];
            const percent = f.total > 0 ? Math.round((f.occupied / f.total) * 100) : 0;
            return {
                block: floor,
                percent,
                occupied: f.occupied,
                total: f.total
            };
        });

        // Format recent check-ins
        const recentCheckins = (recentMembers || []).map(m => {
            const nameParts = (m.name || 'User').trim().split(' ');
            const initials = nameParts.length >= 2 
                ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
                : (m.name || 'US').substring(0, 2).toUpperCase();
            
            const roomName = m.rooms ? `Room ${m.rooms.room_number}` : 'Unassigned';
            const joinedStr = m.joined_date ? new Date(m.joined_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recently';

            return {
                name: m.name,
                room: roomName,
                time: joinedStr,
                initials
            };
        });

        // Format recent expenses
        const recentExpenses = (recentExpensesData || []).map(e => ({
            category: e.category || 'General',
            item: e.description || e.category || 'Expense',
            amount: `₹${Number(e.amount).toLocaleString('en-IN')}`,
            date: e.expense_date ? new Date(e.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''
        }));

        res.json({
            totalStudents: totalStudents || 0,
            totalRooms: roomList.length,
            occupiedRooms: totalOccupiedBeds,
            vacantRooms: availableBeds,
            maintenanceRooms: maintenanceRoomsCount,
            totalPayments,
            pendingPayments,
            pendingCount,
            roomStatus,
            recentCheckins,
            recentExpenses
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

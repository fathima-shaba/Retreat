const supabase = require('../config/db');

// --- Helper Date Function ---
function getDateRangeForPeriod(period, startDate, endDate) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (period === 'today') {
        return { gte: todayStr, lte: todayStr };
    } else if (period === 'yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        const yestStr = yest.toISOString().split('T')[0];
        return { gte: yestStr, lte: yestStr };
    } else if (period === 'week') {
        const day = now.getDay();
        const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diffToMonday));
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        return { gte: monday.toISOString().split('T')[0], lte: sunday.toISOString().split('T')[0] };
    } else if (period === 'month') {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        return { gte: `${year}-${month}-01`, lte: `${year}-${month}-${String(lastDay).padStart(2, '0')}` };
    } else if (period === 'year') {
        const year = now.getFullYear();
        return { gte: `${year}-01-01`, lte: `${year}-12-31` };
    } else if (period === 'custom' && startDate && endDate) {
        return { gte: startDate, lte: endDate };
    }
    return null;
}

// --- Category Handlers ---

exports.getCategories = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('expense_categories')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Category name is required" });

    const trimmedName = name.trim();
    try {
        const { data, error } = await supabase
            .from('expense_categories')
            .upsert({ name: trimmedName, is_active: true }, { onConflict: 'name' })
            .select();

        if (error) return res.status(500).json({ error: error.message });
        const created = data && data[0] ? data[0] : { name: trimmedName };
        res.status(201).json({ id: created.id, name: trimmedName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    const { name } = req.body;
    const catId = req.params.id;
    if (!name || !name.trim()) return res.status(400).json({ error: "Category name is required" });

    try {
        const { data: oldCat, error: fetchErr } = await supabase
            .from('expense_categories')
            .select('name')
            .eq('id', catId);

        if (fetchErr || !oldCat || oldCat.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        const oldName = oldCat[0].name;
        const newName = name.trim();

        const { error: updateErr } = await supabase
            .from('expense_categories')
            .update({ name: newName })
            .eq('id', catId);

        if (updateErr) return res.status(500).json({ error: updateErr.message });

        // Rename category in existing expenses
        await supabase
            .from('expenses')
            .update({ category: newName })
            .eq('category', oldName);

        res.json({ message: "Category updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const catId = req.params.id;
    try {
        const { error } = await supabase
            .from('expense_categories')
            .delete()
            .eq('id', catId);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Category removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Expense Operations & Filtering ---

exports.getAllExpenses = async (req, res) => {
    const { period, startDate, endDate, category } = req.query;

    try {
        let query = supabase.from('expenses').select('*');

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const dateRange = getDateRangeForPeriod(period, startDate, endDate);
        if (dateRange) {
            query = query.gte('expense_date', dateRange.gte).lte('expense_date', dateRange.lte);
        }

        query = query.order('expense_date', { ascending: false }).order('id', { ascending: false });

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getExpenseStats = async (req, res) => {
    const { startDate, endDate, category } = req.query;

    try {
        // Fetch all expenses for calculation
        const { data: allExpenses, error } = await supabase
            .from('expenses')
            .select('*');

        if (error) return res.status(500).json({ error: error.message });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        const yestStr = yest.toISOString().split('T')[0];

        // ISO Week range
        const day = now.getDay();
        const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diffToMonday));
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        const mondayStr = monday.toISOString().split('T')[0];
        const sundayStr = sunday.toISOString().split('T')[0];

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        let today = 0, todayCount = 0;
        let yesterday = 0, yesterdayCount = 0;
        let thisWeek = 0, thisWeekCount = 0;
        let thisMonth = 0, thisMonthCount = 0;
        let thisYear = 0, thisYearCount = 0;
        let allTime = 0, allTimeCount = 0;

        allExpenses.forEach(exp => {
            const amt = Number(exp.amount || 0);
            allTime += amt;
            allTimeCount++;

            const expDateStr = exp.expense_date ? String(exp.expense_date).split('T')[0] : '';
            const expD = new Date(exp.expense_date);

            if (expDateStr === todayStr) {
                today += amt;
                todayCount++;
            }
            if (expDateStr === yestStr) {
                yesterday += amt;
                yesterdayCount++;
            }
            if (expDateStr >= mondayStr && expDateStr <= sundayStr) {
                thisWeek += amt;
                thisWeekCount++;
            }
            if (expD.getFullYear() === currentYear && expD.getMonth() === currentMonth) {
                thisMonth += amt;
                thisMonthCount++;
            }
            if (expD.getFullYear() === currentYear) {
                thisYear += amt;
                thisYearCount++;
            }
        });

        // Category breakdown calculation
        let filteredForCategory = allExpenses;
        if (startDate && endDate) {
            filteredForCategory = filteredForCategory.filter(e => {
                const d = e.expense_date ? String(e.expense_date).split('T')[0] : '';
                return d >= startDate && d <= endDate;
            });
        }
        if (category && category !== 'All') {
            filteredForCategory = filteredForCategory.filter(e => e.category === category);
        }

        const catMap = {};
        filteredForCategory.forEach(exp => {
            const cat = exp.category;
            const amt = Number(exp.amount || 0);
            if (!catMap[cat]) catMap[cat] = { category: cat, total_amount: 0, expense_count: 0 };
            catMap[cat].total_amount += amt;
            catMap[cat].expense_count += 1;
        });

        const categoryResults = Object.values(catMap).sort((a, b) => b.total_amount - a.total_amount);
        const totalCategorySum = categoryResults.reduce((sum, item) => sum + item.total_amount, 0);

        const categoryBreakdown = categoryResults.map(item => ({
            category: item.category,
            total_amount: item.total_amount,
            expense_count: item.expense_count,
            percentage: totalCategorySum > 0 ? ((item.total_amount / totalCategorySum) * 100).toFixed(1) : '0'
        }));

        res.json({
            today,
            todayCount,
            yesterday,
            yesterdayCount,
            thisWeek,
            thisWeekCount,
            thisMonth,
            thisMonthCount,
            thisYear,
            thisYearCount,
            allTime,
            allTimeCount,
            categoryBreakdown
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createExpense = async (req, res) => {
    const { category, amount, description, expense_date, payment_method, notes } = req.body;
    
    if (!category || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Valid category and positive amount are required." });
    }

    const payMethod = payment_method || 'Cash';
    const expDate = expense_date || new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{
                category,
                amount: parseFloat(amount),
                description: description || '',
                expense_date: expDate,
                payment_method: payMethod,
                notes: notes || ''
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        const inserted = data && data[0] ? data[0] : {};
        res.status(201).json({ id: inserted.id, category, amount: parseFloat(amount), description, expense_date: expDate, payment_method: payMethod });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateExpense = async (req, res) => {
    const { category, amount, description, expense_date, payment_method, notes } = req.body;
    const expenseId = req.params.id;

    if (!category || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Valid category and positive amount are required." });
    }

    const payMethod = payment_method || 'Cash';
    const expDate = expense_date || new Date().toISOString().split('T')[0];

    try {
        const { error } = await supabase
            .from('expenses')
            .update({
                category,
                amount: parseFloat(amount),
                description: description || '',
                expense_date: expDate,
                payment_method: payMethod,
                notes: notes || ''
            })
            .eq('id', expenseId);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Expense updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

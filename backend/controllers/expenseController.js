const db = require('../config/db');

// --- Category Handlers ---

exports.getCategories = (req, res) => {
    db.query("SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name ASC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createCategory = (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Category name is required" });

    db.query(
        "INSERT INTO expense_categories (name) VALUES (?) ON DUPLICATE KEY UPDATE is_active = 1",
        [name.trim()],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, name: name.trim() });
        }
    );
};

exports.updateCategory = (req, res) => {
    const { name } = req.body;
    const catId = req.params.id;
    if (!name || !name.trim()) return res.status(400).json({ error: "Category name is required" });

    // First get old category name to update existing expense records
    db.query("SELECT name FROM expense_categories WHERE id = ?", [catId], (err, oldCat) => {
        if (err || oldCat.length === 0) return res.status(404).json({ error: "Category not found" });
        const oldName = oldCat[0].name;

        db.query(
            "UPDATE expense_categories SET name = ? WHERE id = ?",
            [name.trim(), catId],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Rename category in existing expenses
                db.query("UPDATE expenses SET category = ? WHERE category = ?", [name.trim(), oldName], () => {
                    res.json({ message: "Category updated successfully" });
                });
            }
        );
    });
};

exports.deleteCategory = (req, res) => {
    const catId = req.params.id;
    db.query("DELETE FROM expense_categories WHERE id = ?", [catId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Category removed successfully" });
    });
};

// --- Expense Operations & Filtering ---

exports.getAllExpenses = (req, res) => {
    const { period, startDate, endDate, category } = req.query;

    let conditions = [];
    let params = [];

    if (category && category !== 'All') {
        conditions.push("category = ?");
        params.push(category);
    }

    if (period === 'today') {
        conditions.push("DATE(expense_date) = CURDATE()");
    } else if (period === 'yesterday') {
        conditions.push("DATE(expense_date) = CURDATE() - INTERVAL 1 DAY");
    } else if (period === 'week') {
        conditions.push("YEARWEEK(expense_date, 1) = YEARWEEK(CURDATE(), 1)");
    } else if (period === 'month') {
        conditions.push("MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())");
    } else if (period === 'year') {
        conditions.push("YEAR(expense_date) = YEAR(CURDATE())");
    } else if (period === 'custom' && startDate && endDate) {
        conditions.push("DATE(expense_date) BETWEEN ? AND ?");
        params.push(startDate, endDate);
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const query = `SELECT * FROM expenses ${whereClause} ORDER BY expense_date DESC, id DESC`;

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getExpenseStats = (req, res) => {
    const { startDate, endDate, category } = req.query;

    // Real-time SQL aggregations for periods
    const mainStatsQuery = `
        SELECT 
            COALESCE(SUM(CASE WHEN DATE(expense_date) = CURDATE() THEN amount ELSE 0 END), 0) as today,
            COUNT(CASE WHEN DATE(expense_date) = CURDATE() THEN 1 END) as todayCount,
            
            COALESCE(SUM(CASE WHEN DATE(expense_date) = CURDATE() - INTERVAL 1 DAY THEN amount ELSE 0 END), 0) as yesterday,
            COUNT(CASE WHEN DATE(expense_date) = CURDATE() - INTERVAL 1 DAY THEN 1 END) as yesterdayCount,
            
            COALESCE(SUM(CASE WHEN YEARWEEK(expense_date, 1) = YEARWEEK(CURDATE(), 1) THEN amount ELSE 0 END), 0) as thisWeek,
            COUNT(CASE WHEN YEARWEEK(expense_date, 1) = YEARWEEK(CURDATE(), 1) THEN 1 END) as thisWeekCount,
            
            COALESCE(SUM(CASE WHEN MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as thisMonth,
            COUNT(CASE WHEN MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE()) THEN 1 END) as thisMonthCount,
            
            COALESCE(SUM(CASE WHEN YEAR(expense_date) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as thisYear,
            COUNT(CASE WHEN YEAR(expense_date) = YEAR(CURDATE()) THEN 1 END) as thisYearCount,
            
            COALESCE(SUM(amount), 0) as allTime,
            COUNT(*) as allTimeCount
        FROM expenses
    `;

    db.query(mainStatsQuery, (err, statsResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const stats = statsResult[0];

        // Category-wise breakdown query
        let catConditions = [];
        let catParams = [];

        if (startDate && endDate) {
            catConditions.push("DATE(expense_date) BETWEEN ? AND ?");
            catParams.push(startDate, endDate);
        }
        if (category && category !== 'All') {
            catConditions.push("category = ?");
            catParams.push(category);
        }

        const catWhere = catConditions.length > 0 ? "WHERE " + catConditions.join(" AND ") : "";
        const categoryQuery = `
            SELECT category, SUM(amount) as total_amount, COUNT(*) as expense_count
            FROM expenses
            ${catWhere}
            GROUP BY category
            ORDER BY total_amount DESC
        `;

        db.query(categoryQuery, catParams, (err, categoryResults) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalCategorySum = categoryResults.reduce((sum, item) => sum + Number(item.total_amount), 0);

            const categoryBreakdown = categoryResults.map(item => ({
                category: item.category,
                total_amount: Number(item.total_amount),
                expense_count: item.expense_count,
                percentage: totalCategorySum > 0 ? ((Number(item.total_amount) / totalCategorySum) * 100).toFixed(1) : '0'
            }));

            res.json({
                today: Number(stats.today),
                todayCount: stats.todayCount,
                yesterday: Number(stats.yesterday),
                yesterdayCount: stats.yesterdayCount,
                thisWeek: Number(stats.thisWeek),
                thisWeekCount: stats.thisWeekCount,
                thisMonth: Number(stats.thisMonth),
                thisMonthCount: stats.thisMonthCount,
                thisYear: Number(stats.thisYear),
                thisYearCount: stats.thisYearCount,
                allTime: Number(stats.allTime),
                allTimeCount: stats.allTimeCount,
                categoryBreakdown
            });
        });
    });
};

exports.createExpense = (req, res) => {
    const { category, amount, description, expense_date, payment_method, notes } = req.body;
    
    if (!category || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Valid category and positive amount are required." });
    }

    const payMethod = payment_method || 'Cash';
    const expDate = expense_date || new Date().toISOString().split('T')[0];

    db.query(
        "INSERT INTO expenses (category, amount, description, expense_date, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [category, parseFloat(amount), description || '', expDate, payMethod, notes || ''],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, category, amount: parseFloat(amount), description, expense_date: expDate, payment_method: payMethod });
        }
    );
};

exports.updateExpense = (req, res) => {
    const { category, amount, description, expense_date, payment_method, notes } = req.body;
    const expenseId = req.params.id;

    if (!category || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Valid category and positive amount are required." });
    }

    const payMethod = payment_method || 'Cash';
    const expDate = expense_date || new Date().toISOString().split('T')[0];

    db.query(
        "UPDATE expenses SET category=?, amount=?, description=?, expense_date=?, payment_method=?, notes=? WHERE id=?",
        [category, parseFloat(amount), description || '', expDate, payMethod, notes || '', expenseId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Expense updated successfully" });
        }
    );
};

exports.deleteExpense = (req, res) => {
    db.query("DELETE FROM expenses WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Expense deleted successfully" });
    });
};

require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_management',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error("Failed to connect to MySQL database:", err.message);
        process.exit(1);
    }
    console.log("Connected to MySQL for Expense Module migration...");

    // 1. Create expense_categories table
    const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS expense_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.query(createCategoriesTable, (err) => {
        if (err) {
            console.error("Error creating expense_categories table:", err.message);
            process.exit(1);
        }
        console.log("expense_categories table verified/created.");

        // 2. Add payment_method and notes columns to expenses table if missing
        db.query("SHOW COLUMNS FROM expenses;", (err, cols) => {
            if (err) {
                console.error("Error inspecting expenses table:", err.message);
                process.exit(1);
            }

            const colNames = new Set(cols.map(c => c.Field));
            
            const addCols = [];
            if (!colNames.has('payment_method')) {
                addCols.push("ALTER TABLE expenses ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash';");
            }
            if (!colNames.has('notes')) {
                addCols.push("ALTER TABLE expenses ADD COLUMN notes TEXT;");
            }

            const alterPromise = new Promise((resolve) => {
                if (addCols.length > 0) {
                    db.query(addCols.join(" "), (err) => {
                        if (err) console.error("Error adding expense columns:", err.message);
                        else console.log("Added payment_method and notes columns to expenses table.");
                        resolve();
                    });
                } else {
                    resolve();
                }
            });

            alterPromise.then(() => {
                // 3. Populate default categories if empty
                db.query("SELECT COUNT(*) as cnt FROM expense_categories;", (err, res) => {
                    if (err) {
                        console.error("Error checking categories count:", err.message);
                        process.exit(1);
                    }

                    if (res[0].cnt === 0) {
                        const defaultCategories = [
                            ['Mess'], ['Food'], ['Electricity'], ['Water'], ['Maintenance'],
                            ['Cleaning'], ['Labor / Workers'], ['Worker Salary'], ['Rent/Lease'],
                            ['Internet'], ['Repairs'], ['Supplies'], ['Other']
                        ];

                        db.query(
                            "INSERT IGNORE INTO expense_categories (name) VALUES ?;",
                            [defaultCategories],
                            (err) => {
                                if (err) console.error("Error seeding categories:", err.message);
                                else console.log(`Seeded ${defaultCategories.length} default expense categories.`);
                                console.log("Expense module migration complete.");
                                process.exit(0);
                            }
                        );
                    } else {
                        console.log("Expense categories already exist. Migration complete.");
                        process.exit(0);
                    }
                });
            });
        });
    });
});

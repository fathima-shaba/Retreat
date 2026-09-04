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
    console.log("Connected to MySQL for Resident Fields migration...");

    const fieldsToAdd = [
        { name: 'dob', type: 'DATE NULL AFTER joined_date' },
        { name: 'guardian_name', type: 'VARCHAR(255) NULL AFTER aadhar_number' },
        { name: 'guardian_phone', type: 'VARCHAR(50) NULL AFTER guardian_name' },
        { name: 'deposit_fee', type: 'DECIMAL(10,2) DEFAULT 0.00 AFTER admission_fee' }
    ];

    db.query("SHOW COLUMNS FROM members;", (err, columns) => {
        if (err) {
            console.error("Error inspecting members table:", err.message);
            process.exit(1);
        }

        const existingColNames = new Set(columns.map(c => c.Field));
        let pending = fieldsToAdd.length;

        if (pending === 0) {
            console.log("No new columns to process.");
            process.exit(0);
        }

        fieldsToAdd.forEach((field) => {
            if (!existingColNames.has(field.name)) {
                db.query(`ALTER TABLE members ADD COLUMN ${field.name} ${field.type};`, (err) => {
                    if (err) console.error(`Error adding column ${field.name}:`, err.message);
                    else console.log(`Added column '${field.name}' to members table.`);
                    
                    pending--;
                    if (pending === 0) {
                        console.log("Resident fields migration complete.");
                        process.exit(0);
                    }
                });
            } else {
                console.log(`Column '${field.name}' already exists in members table.`);
                pending--;
                if (pending === 0) {
                    console.log("Resident fields migration complete.");
                    process.exit(0);
                }
            }
        });
    });
});

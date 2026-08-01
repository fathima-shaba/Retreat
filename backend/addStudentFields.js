require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

db.connect((err) => {
    if (err) throw err;
    const alterQuery = `
        ALTER TABLE students 
        ADD COLUMN aadhar_number VARCHAR(20) DEFAULT NULL,
        ADD COLUMN admission_fee DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN rent_fee DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN next_due_date DATE DEFAULT NULL;
    `;
    db.query(alterQuery, (err, results) => {
        if (err && err.code !== 'ER_DUP_FIELDNAME') throw err;
        console.log("Successfully added new columns to students table.");
        process.exit(0);
    });
});

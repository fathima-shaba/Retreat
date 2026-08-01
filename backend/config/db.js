const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST ? process.env.DB_HOST.trim() : 'localhost',
    user: process.env.DB_USER ? process.env.DB_USER.trim() : 'root',
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.trim() : '',
    database: process.env.DB_NAME ? process.env.DB_NAME.trim() : 'hostel_management',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : 3306,
    ssl: (process.env.DB_SSL && process.env.DB_SSL.trim() === 'true') ? { rejectUnauthorized: false } : undefined
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }
});

module.exports = db;

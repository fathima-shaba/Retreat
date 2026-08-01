const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST ? process.env.DB_HOST.trim() : 'localhost',
    user: process.env.DB_USER ? process.env.DB_USER.trim() : 'root',
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.trim() : '',
    database: process.env.DB_NAME ? process.env.DB_NAME.trim() : 'hostel_management',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : 3306,
    ssl: (process.env.DB_SSL && process.env.DB_SSL.trim() === 'true') ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("DEBUG: Attempting to connect to DB with config:");
console.log({
    host: process.env.DB_HOST ? process.env.DB_HOST.trim() : 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : 3306,
    user: process.env.DB_USER ? process.env.DB_USER.trim() : 'root',
    database: process.env.DB_NAME ? process.env.DB_NAME.trim() : 'hostel_management',
    ssl: (process.env.DB_SSL && process.env.DB_SSL.trim() === 'true') ? 'enabled' : 'disabled'
});

db.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("MySQL Pool Connected Successfully");
        connection.release();
    }
});

module.exports = db;

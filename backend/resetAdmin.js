require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(async (err) => {
    if (err) throw err;
    console.log("Connected to database. Resetting admin password...");
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.query("UPDATE users SET password = ? WHERE username = 'admin'", [hashedPassword], (err, results) => {
        if (err) throw err;
        console.log("Admin password forced to 'admin123'. Rows affected:", results.affectedRows);
        
        if (results.affectedRows === 0) {
             db.query("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", [hashedPassword], (err) => {
                 if (err) throw err;
                 console.log("Inserted new admin user with password 'admin123'.");
                 process.exit(0);
             });
        } else {
             process.exit(0);
        }
    });
});

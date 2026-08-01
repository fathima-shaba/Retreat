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
    console.log("Connected to MySQL");
    
    // Clear existing users
    db.query("DELETE FROM users", async (err) => {
        if (err) throw err;
        
        const accounts = [
            { username: 'basim', password: 'basim123', role: 'admin' },
            { username: 'nihal', password: 'nihal123', role: 'admin' },
            { username: 'jaseem', password: 'jaseem123', role: 'viewer' }
        ];
        
        for (let acc of accounts) {
            const hashedPw = await bcrypt.hash(acc.password, 10);
            db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [acc.username, hashedPw, acc.role], (err) => {
                if (err) throw err;
                console.log(`Created user: ${acc.username} (${acc.role})`);
            });
        }
        
        setTimeout(() => process.exit(0), 1000); // Give queries time to finish
    });
});

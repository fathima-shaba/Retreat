require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to DB.");

    db.query("UPDATE rooms SET status = 'Occupied' LIMIT 20;", (err, results) => {
        if (err) throw err;
        console.log(`Updated ${results.affectedRows} rooms to Occupied. 6 rooms left as Available.`);
        process.exit(0);
    });
});

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
    console.log("Connected to DB for seeding rooms.");

    // Clear existing rooms if any, to start fresh with exactly 26 rooms
    // We disable foreign key checks temporarily in case there are assigned students
    db.query("SET FOREIGN_KEY_CHECKS = 0", (err) => {
        if(err) throw err;
        
        db.query("TRUNCATE TABLE rooms", (err) => {
            if (err) throw err;
            console.log("Cleared existing rooms.");

            let query = "INSERT INTO rooms (room_number, capacity, type, status) VALUES ";
            let values = [];
            
            // 19 rooms of 2 Share
            for(let i=1; i<=19; i++) {
                let roomNo = "2S-" + (100 + i);
                values.push(`('${roomNo}', 2, '2 Share', 'Available')`);
            }
            // 7 rooms of 4 Share
            for(let i=1; i<=7; i++) {
                let roomNo = "4S-" + (200 + i);
                values.push(`('${roomNo}', 4, '4 Share', 'Available')`);
            }
            
            query += values.join(", ");

            db.query(query, (err, results) => {
                if (err) throw err;
                console.log(`Successfully seeded ${results.affectedRows} rooms (19 2-Share, 7 4-Share).`);
                
                db.query("SET FOREIGN_KEY_CHECKS = 1", () => {
                    process.exit(0);
                });
            });
        });
    });
});

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
    
    db.query("SET FOREIGN_KEY_CHECKS = 0;", () => {
        db.query("TRUNCATE TABLE rooms;", () => {
            let query = "INSERT INTO rooms (room_number, capacity, type, floor, status) VALUES ";
            let values = [];
            
            // Floor A: A1 to A9 (A1-A7: 2 Share, A8-A9: 4 Share)
            for(let i=1; i<=7; i++) values.push(`('A${i}', 2, '2 Share', 'A', 'Available')`);
            for(let i=8; i<=9; i++) values.push(`('A${i}', 4, '4 Share', 'A', 'Available')`);

            // Floor B: B1 to B9 (B1-B7: 2 Share, B8-B9: 4 Share)
            for(let i=1; i<=7; i++) values.push(`('B${i}', 2, '2 Share', 'B', 'Available')`);
            for(let i=8; i<=9; i++) values.push(`('B${i}', 4, '4 Share', 'B', 'Available')`);

            // Floor C: C1 to C8 (C1-C5: 2 Share, C6-C8: 4 Share)
            for(let i=1; i<=5; i++) values.push(`('C${i}', 2, '2 Share', 'C', 'Available')`);
            for(let i=6; i<=8; i++) values.push(`('C${i}', 4, '4 Share', 'C', 'Available')`);
            
            query += values.join(", ");

            db.query(query, (err, results) => {
                if (err) throw err;
                console.log(`Successfully seeded ${results.affectedRows} rooms: Floor A (A1-A9), Floor B (B1-B9), Floor C (C1-C8).`);
                db.query("SET FOREIGN_KEY_CHECKS = 1;", () => {
                    process.exit(0);
                });
            });
        });
    });
});

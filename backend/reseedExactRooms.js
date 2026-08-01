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
            
            // Floor A: 9 rooms (7 x 2-share, 2 x 4-share)
            for(let i=1; i<=7; i++) values.push(`('A10${i}', 2, '2 Share', 'A', 'Available')`);
            for(let i=8; i<=9; i++) values.push(`('A10${i}', 4, '4 Share', 'A', 'Available')`);

            // Floor B: 9 rooms (7 x 2-share, 2 x 4-share)
            for(let i=1; i<=7; i++) values.push(`('B20${i}', 2, '2 Share', 'B', 'Available')`);
            for(let i=8; i<=9; i++) values.push(`('B20${i}', 4, '4 Share', 'B', 'Available')`);

            // Floor C: 8 rooms (5 x 2-share, 3 x 4-share)
            for(let i=1; i<=5; i++) values.push(`('C30${i}', 2, '2 Share', 'C', 'Available')`);
            for(let i=6; i<=8; i++) values.push(`('C30${i}', 4, '4 Share', 'C', 'Available')`);
            
            query += values.join(", ");

            db.query(query, (err, results) => {
                if (err) throw err;
                console.log(`Successfully seeded ${results.affectedRows} rooms strictly across floors A, B, and C.`);
                db.query("SET FOREIGN_KEY_CHECKS = 1;", () => {
                    process.exit(0);
                });
            });
        });
    });
});

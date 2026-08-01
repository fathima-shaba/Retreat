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
    console.log("Connected to DB. Adding floors and re-seeding rooms.");

    db.query("SET FOREIGN_KEY_CHECKS = 0;", () => {
        db.query("DROP TABLE IF EXISTS rooms;", () => {
            const createRooms = `
                CREATE TABLE rooms (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    room_number VARCHAR(50) UNIQUE NOT NULL,
                    capacity INT NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    floor VARCHAR(10) NOT NULL,
                    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available'
                );
            `;
            db.query(createRooms, () => {
                let query = "INSERT INTO rooms (room_number, capacity, type, floor, status) VALUES ";
                let values = [];
                const floors = ['A', 'B', 'C'];
                
                // 19 rooms of 2 Share
                for(let i=1; i<=19; i++) {
                    let roomNo = "2S-" + (100 + i);
                    let floor = floors[i % 3]; // Spread across A, B, C
                    values.push(`('${roomNo}', 2, '2 Share', '${floor}', 'Available')`);
                }
                // 7 rooms of 4 Share
                for(let i=1; i<=7; i++) {
                    let roomNo = "4S-" + (200 + i);
                    let floor = floors[i % 3]; // Spread across A, B, C
                    values.push(`('${roomNo}', 4, '4 Share', '${floor}', 'Available')`);
                }
                
                query += values.join(", ");

                db.query(query, (err, results) => {
                    if (err) throw err;
                    console.log(`Successfully seeded ${results.affectedRows} rooms with floors A, B, and C.`);
                    db.query("SET FOREIGN_KEY_CHECKS = 1;", () => {
                        process.exit(0);
                    });
                });
            });
        });
    });
});

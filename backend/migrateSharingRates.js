require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_management',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    multipleStatements: true
});

db.connect(async (err) => {
    if (err) {
        console.error("Failed to connect to MySQL database:", err.message);
        process.exit(1);
    }
    console.log("Connected to MySQL for Sharing Rates migration...");

    // 1. Create room_sharing_rates table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS room_sharing_rates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            sharing_type INT NOT NULL,
            monthly_rent DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            UNIQUE KEY room_sharing_unique (room_id, sharing_type)
        );
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating room_sharing_rates table:", err.message);
            process.exit(1);
        }
        console.log("room_sharing_rates table verified/created.");

        // 2. Add sharing_type column to members table if missing
        db.query("SHOW COLUMNS FROM members LIKE 'sharing_type';", (err, cols) => {
            if (err) {
                console.error("Error checking members table:", err.message);
                process.exit(1);
            }

            const addColumnPromise = new Promise((resolve) => {
                if (cols.length === 0) {
                    db.query("ALTER TABLE members ADD COLUMN sharing_type INT NULL AFTER room_id;", (err) => {
                        if (err) console.error("Error adding sharing_type column:", err.message);
                        else console.log("Added sharing_type column to members table.");
                        resolve();
                    });
                } else {
                    resolve();
                }
            });

            addColumnPromise.then(() => {
                // 3. Seed default sharing rates for existing rooms if none exist
                db.query("SELECT * FROM rooms;", (err, rooms) => {
                    if (err) {
                        console.error("Error fetching rooms:", err.message);
                        process.exit(1);
                    }

                    if (rooms.length === 0) {
                        console.log("No existing rooms found. Migration completed.");
                        process.exit(0);
                    }

                    let processedCount = 0;

                    rooms.forEach((room) => {
                        db.query("SELECT * FROM room_sharing_rates WHERE room_id = ?", [room.id], (err, rates) => {
                            if (err) console.error(err);
                            
                            if (!rates || rates.length === 0) {
                                const cap = room.capacity || 2;
                                const defaultRates = [];
                                
                                // Default pricing algorithm based on capacity
                                for (let s = 1; s <= cap; s++) {
                                    let baseRent = 6000;
                                    if (s === 1) baseRent = 8000;
                                    else if (s === 2) baseRent = 6000;
                                    else if (s === 3) baseRent = 5000;
                                    else if (s === 4) baseRent = 4500;
                                    else baseRent = 4000;
                                    
                                    defaultRates.push([room.id, s, baseRent]);
                                }

                                if (defaultRates.length > 0) {
                                    db.query(
                                        "INSERT IGNORE INTO room_sharing_rates (room_id, sharing_type, monthly_rent) VALUES ?",
                                        [defaultRates],
                                        (err) => {
                                            if (err) console.error(`Error seeding rates for room ${room.room_number}:`, err.message);
                                            else console.log(`Seeded ${defaultRates.length} sharing rates for Room ${room.room_number}`);
                                            
                                            processedCount++;
                                            if (processedCount === rooms.length) {
                                                console.log("All rooms processed. Migration clean & complete.");
                                                process.exit(0);
                                            }
                                        }
                                    );
                                } else {
                                    processedCount++;
                                    if (processedCount === rooms.length) {
                                        console.log("Migration complete.");
                                        process.exit(0);
                                    }
                                }
                            } else {
                                processedCount++;
                                if (processedCount === rooms.length) {
                                    console.log("Existing room sharing rates preserved. Migration complete.");
                                    process.exit(0);
                                }
                            }
                        });
                    });
                });
            });
        });
    });
});

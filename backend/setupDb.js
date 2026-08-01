require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error("Failed to connect to MySQL. Is it running? Error:", err.message);
        process.exit(1);
    }
    console.log("Connected to MySQL server...");
    
    db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`, (err) => {
        if (err) throw err;
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);
        
        db.query(`USE ${process.env.DB_NAME};`, (err) => {
            if (err) throw err;

            const setupScript = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'admin'
                );

                CREATE TABLE IF NOT EXISTS rooms (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    room_number VARCHAR(50) UNIQUE NOT NULL,
                    capacity INT NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available'
                );

                CREATE TABLE IF NOT EXISTS students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    room_id INT NULL,
                    address TEXT,
                    joined_date DATE,
                    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
                    payment_date DATE,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                );
            `;

            db.query(setupScript, async (err, results) => {
                if (err) throw err;
                console.log("Tables created or verified successfully.");

                // Check if admin user exists, if not create one
                db.query("SELECT * FROM users WHERE username = 'admin'", async (err, users) => {
                    if (err) throw err;
                    if (users.length === 0) {
                        const hashedPassword = await bcrypt.hash('admin123', 10);
                        db.query("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", [hashedPassword], (err) => {
                            if (err) throw err;
                            console.log("Default admin user created: admin / admin123");
                            process.exit(0);
                        });
                    } else {
                        console.log("Admin user already exists.");
                        process.exit(0);
                    }
                });
            });
        });
    });
});

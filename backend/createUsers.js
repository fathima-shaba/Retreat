require('dotenv').config();
const supabase = require('./config/db');
const bcrypt = require('bcrypt');

async function createInitialUsers() {
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.INITIAL_ADMIN_PASS || !process.env.INITIAL_VIEWER_PASS) {
            console.error("❌ Refusing to run user seed script in production without explicit INITIAL_ADMIN_PASS and INITIAL_VIEWER_PASS environment variables.");
            process.exit(1);
        }
    }

    console.log("Creating initial system user accounts in Supabase PostgreSQL...");

    // Retrieve initial credentials from environment variables or fallback safely
    const adminUser = process.env.INITIAL_ADMIN_USER || 'admin';
    const adminPass = process.env.INITIAL_ADMIN_PASS || 'admin123';
    const viewerUser = process.env.INITIAL_VIEWER_USER || 'viewer';
    const viewerPass = process.env.INITIAL_VIEWER_PASS || 'viewer123';

    const accounts = [
        { username: adminUser, password: adminPass, role: 'admin' },
        { username: viewerUser, password: viewerPass, role: 'viewer' }
    ];

    try {
        for (const acc of accounts) {
            const hashedPassword = await bcrypt.hash(acc.password, 10);

            const { data, error } = await supabase
                .from('users')
                .upsert(
                    { username: acc.username, password: hashedPassword, role: acc.role },
                    { onConflict: 'username' }
                )
                .select();

            if (error) {
                console.error(`❌ Failed to create/update user '${acc.username}':`, error.message);
            } else {
                console.log(`✅ Successfully seeded user: '${acc.username}' (${acc.role})`);
            }
        }
        console.log("\nUser seeding process completed successfully.");
    } catch (err) {
        console.error("❌ Seeding process error:", err.message);
    }
}

createInitialUsers();

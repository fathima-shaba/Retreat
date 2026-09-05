require('dotenv').config();
const supabase = require('./config/db');

async function testConnection() {
    console.log("------------------------------------------------");
    console.log("Testing Supabase PostgreSQL Connection...");
    console.log("URL:", process.env.SUPABASE_URL || '(Not set)');
    console.log("------------------------------------------------");

    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_KEY)) {
        console.error("❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is not defined in .env file.");
        process.exit(1);
    }

    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Connection failed with error:", error.message);
            process.exit(1);
        }

        console.log("✅ Successfully connected to Supabase PostgreSQL!");
        console.log(`📊 Users table record count: ${data !== null ? data : 'Accessible'}`);
        console.log("------------------------------------------------");
    } catch (err) {
        console.error("❌ Unexpected connection error:", err.message);
        process.exit(1);
    }
}

testConnection();

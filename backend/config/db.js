require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() 
  : (process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '');

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️  WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing in backend/.env.");
  console.warn("👉 Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your backend/.env file.");
}

// Fallback dummy parameters prevent module load crash prior to user setting .env credentials
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

module.exports = supabase;

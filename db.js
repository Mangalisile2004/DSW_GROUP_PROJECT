// db.js - Supabase connection (replaces MS SQL)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// For compatibility with existing code that expects getConnection
async function getConnection() {
  return supabase;
}

module.exports = { getConnection, supabase, sql: null };

// ============================================================
// supabase.js — Supabase Client Setup
// ============================================================
// This file creates ONE shared Supabase client that every route
// in server.js will import and reuse.  Creating it once here
// avoids opening multiple connections and keeps credentials in
// a single, easy-to-update location.
// ============================================================

// Load variables from the .env file into process.env
// Must be called before reading process.env.SUPABASE_URL etc.
require("dotenv").config();

// createClient is the factory function from the official Supabase JS SDK
const { createClient } = require("@supabase/supabase-js");

// ── Validate env vars immediately so the server fails fast ──
// If either variable is missing, there is no point starting the server.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  console.error("    Add them to your .env file and restart the server.");
  process.exit(1); // Exit with a non-zero code to signal failure
}

// ── Create the client ────────────────────────────────────────
// Arguments:
//   1. SUPABASE_URL           – e.g. https://xyz.supabase.co
//   2. SUPABASE_SERVICE_ROLE_KEY – the SECRET "service_role" JWT.
//      This key BYPASSES Row-Level Security so the server can
//      INSERT / SELECT / UPDATE all tables without restriction.
//      ⚠️  NEVER expose this key in client-side (browser) code.
//   3. options.auth            – disable session management because
//      the server is stateless; it does not "log in" as a user.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false, // Server tokens don't expire — no refresh needed
      persistSession:   false  // Do not write session data to disk or memory
    }
  }
);

console.log("✅ Supabase client initialised");

// Export the single instance so every file that does
// require('./supabase') gets the same connection object.
module.exports = supabase;

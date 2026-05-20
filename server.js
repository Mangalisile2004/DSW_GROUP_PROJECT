// ============================================================
// server.js — Campus Connect Express API Server
// Database : Supabase (PostgreSQL)
// ============================================================
// HOW IT WORKS — OVERVIEW
// ────────────────────────
// 1. Express receives an HTTP request (e.g. POST /signup).
// 2. Middleware runs first: CORS headers, body-parser (JSON).
// 3. The matching route handler runs its logic.
// 4. The handler calls Supabase to read/write the database.
// 5. It returns a JSON response: { success, message, data }.
// ============================================================

// ── DEPENDENCIES ─────────────────────────────────────────────
// dotenv   – reads .env and puts the vars into process.env
require("dotenv").config();

// express  – HTTP server framework; handles routing and middleware
const express    = require("express");

// NOTE: body-parser is NOT imported — Express 5 ships with its own
// express.json() middleware which is fully compatible and preferred.

// bcrypt   – industry-standard password hashing library
//            bcrypt.hash()    → turn a password into a safe hash
//            bcrypt.compare() → check a plain password against a hash
const bcrypt     = require("bcrypt");

// path     – Node built-in for building file-system paths safely
const path       = require("path");

// supabase – our shared Supabase client (see supabase.js)
//            uses the service_role key so it bypasses RLS
const supabase   = require("./supabase");

// ── APP SETUP ────────────────────────────────────────────────
const app  = express();

// Allow the port to be set via .env (e.g. PORT=4000) or default to 3000
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ───────────────────────────────────────────────
// Middleware runs on EVERY request before the route handler.

// 1. CORS — Cross-Origin Resource Sharing
//    Browsers block JS from calling a different domain/port by default.
//    These headers tell the browser: "any origin is allowed to call this API".
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin",  "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Browsers send an OPTIONS "preflight" request before the real request.
  // We must reply 200 OK so the browser proceeds with the actual call.
  if (req.method === "OPTIONS") return res.sendStatus(200);

  next(); // Pass control to the next middleware / route handler
});

// 2. Body Parser — parse JSON request bodies
//    express.json() is built into Express 5; no separate package needed.
//    Without this, req.body would be undefined for POST requests.
app.use(express.json());

// 3. Static Files — serve HTML, CSS, JS, images directly
//    e.g. GET /style.css → sends c:\...\style.css
//    This means index.html, dashboard.html etc. are all served automatically.
app.use(express.static(__dirname));

// ── UTILITY ROUTES ───────────────────────────────────────────

// GET /test — health check; confirms the server and DB are up
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", db: "Supabase" });
});

// GET /check-tables — shows how many rows are in each table
//   Useful for quick debugging without opening Supabase dashboard
app.get("/check-tables", async (req, res) => {
  try {
    // { count: "exact", head: true } → returns the count but NO row data
    // This is efficient — doesn't transfer all rows over the network
    const { count: seekers,   error: e1 } = await supabase
      .from("service_seekers").select("*", { count: "exact", head: true });
    const { count: providers, error: e2 } = await supabase
      .from("service_providers").select("*", { count: "exact", head: true });
    const { count: services,  error: e3 } = await supabase
      .from("services").select("*", { count: "exact", head: true });

    if (e1 || e2 || e3) throw e1 || e2 || e3;
    res.json({ success: true, seekers, providers, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET / — serves the homepage HTML file
app.get("/", (req, res) => {
  // path.join builds the correct path regardless of OS (Windows uses \, Linux /)
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── AUTH ROUTES — SERVICE SEEKERS ───────────────────────────

// POST /signup
// Registers a new student who wants to find/buy services.
// Request body: { fullName, surname, email, password, servicesNeeded, studentNumber }
// Response:     { success, message }
app.post("/signup", async (req, res) => {
  // Destructure only the fields we expect — ignore anything else in the body
  const { fullName, surname, email, password, servicesNeeded, studentNumber } = req.body || {};

  // Input validation — return 400 Bad Request if required fields are missing
  if (!fullName || !surname || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // ── Step 1: Check for duplicate email ───────────────────
    // .maybeSingle() returns:
    //   • { data: row }  if exactly one row matches
    //   • { data: null } if no rows match  ← we want this
    //   • { error }      if more than one row matches or DB error
    const { data: existing, error: checkErr } = await supabase
      .from("service_seekers")
      .select("id")          // Only fetch the id column — we don't need the whole row
      .eq("email", email)    // WHERE email = $1
      .maybeSingle();
    if (checkErr) throw checkErr;

    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    // ── Step 2: Hash the password ────────────────────────────
    // bcrypt.hash(plainText, saltRounds)
    // saltRounds = 10 → 2^10 = 1,024 iterations; balances security vs. speed
    // The hash is a 60-character string like "$2b$10$..."
    // We NEVER store the plain-text password.
    const passwordHash = await bcrypt.hash(password, 10);

    // ── Step 3: Insert the new seeker row ────────────────────
    const { error: insertErr } = await supabase.from("service_seekers").insert({
      full_name:      fullName,
      surname:        surname,
      email:          email,
      password_hash:  passwordHash,           // Stored hash, not the plain password
      service_needed: servicesNeeded || null, // Optional — null if not provided
      student_number: studentNumber  || null
    });
    if (insertErr) throw insertErr;

    // 201 Created — the standard success code when a new resource is created
    res.status(201).json({ success: true, message: "Sign-up successful! You can now log in." });

  } catch (err) {
    console.error("Seeker signup error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /login
// Authenticates a service seeker. Returns safe profile data on success.
// Request body: { email, password }
// Response:     { success, message, user }
app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // ── Step 1: Look up the account by email ─────────────────
    // .select("*") fetches all columns including password_hash
    const { data: user, error } = await supabase
      .from("service_seekers")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;

    // Use the same error message for "user not found" and "wrong password"
    // This prevents attackers from discovering which emails are registered
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ── Step 2: Verify the password ──────────────────────────
    // bcrypt.compare re-hashes the input and checks it matches the stored hash
    // Returns true/false — never throws
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ── Step 3: Return safe user data ────────────────────────
    // Explicitly list the fields to return — NEVER include password_hash
    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id:             user.id,
        fullName:       user.full_name,
        surname:        user.surname,
        email:          user.email,
        servicesNeeded: user.service_needed,
        studentNumber:  user.student_number
      }
    });

  } catch (err) {
    console.error("Seeker login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── AUTH ROUTES — SERVICE PROVIDERS ─────────────────────────

// POST /provider/signup
// Registers a new student who wants to offer/sell services.
// Request body: { fullName, surname, email, studentNumber, password,
//                 serviceType, bio, hourlyRate, monthlyRate, campus, availability }
// Response:     { success, message }
app.post("/provider/signup", async (req, res) => {
  try {
    // Destructure inside try/catch so any body-parsing failures are caught
    // and return a clean JSON 400 instead of an HTML error page
    const { fullName, surname, email, studentNumber, password,
            serviceType, bio, hourlyRate, monthlyRate, campus, availability } = req.body || {};

    // If no hourlyRate given but monthlyRate is, convert it
    // Assumes 160 working hours per month (8 hrs × 20 days)
    let finalHourlyRate = hourlyRate;
    if (monthlyRate && !hourlyRate) {
      finalHourlyRate = parseFloat(monthlyRate) / 160;
    }

    if (!fullName || !surname || !email || !password || !serviceType) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    // ── Step 1: Duplicate email check ────────────────────────
    const { data: existing, error: checkErr } = await supabase
      .from("service_providers")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (checkErr) throw checkErr;

    if (existing) {
      return res.status(400).json({ success: false, message: "Provider already exists with this email" });
    }

    // ── Step 2: Hash the password ────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Step 3: Insert new provider row ──────────────────────
    const { error: insertErr } = await supabase.from("service_providers").insert({
      full_name:      fullName,
      surname:        surname,
      email:          email,
      student_number: studentNumber  || null,
      password_hash:  hashedPassword,
      service_type:   serviceType,
      bio:            bio            || null,
      hourly_rate:    finalHourlyRate ? parseFloat(finalHourlyRate) : null,
      campus:         campus         || null,
      availability:   availability   || null,
      rating:         0              // New providers start with no rating
    });
    if (insertErr) throw insertErr;

    res.status(201).json({ success: true, message: "Service provider signup successful!" });
  } catch (err) {
    console.error("Provider signup error:", err);
    res.status(500).json({ success: false, message: String(err.message || err) });
  }
});

// POST /provider/login
// Authenticates a service provider.
// Request body: { email, password }
// Response:     { success, message, provider }
app.post("/provider/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // Fetch full provider row by email
    const { data: provider, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;

    if (!provider) {
      // Same message for "not found" and "wrong password" — prevents email enumeration
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // bcrypt.compare: hashes the input and checks against the stored hash
    const passwordMatch = await bcrypt.compare(password, provider.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Return only safe fields — never include password_hash
    res.json({
      success: true,
      message: "Login successful!",
      provider: {
        id:          provider.id,
        fullName:    provider.full_name,
        surname:     provider.surname,
        email:       provider.email,
        serviceType: provider.service_type
      }
    });
  } catch (err) {
    console.error("Provider login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /providers
// Returns all registered service providers (public directory).
app.get("/providers", async (req, res) => {
  try {
    // Select only the columns we want to expose publicly
    const { data: providers, error } = await supabase
      .from("service_providers")
      .select("id, full_name, surname, email, service_type, bio, rating, campus, availability, hourly_rate");
    if (error) throw error;

    // Map DB snake_case → frontend camelCase
    // Also compute MonthlyRate for the UI (hourly × 8 hours × 20 work days)
    const mapped = providers.map(p => ({
      Id:          p.id,
      FullName:    p.full_name,
      Surname:     p.surname,
      Email:       p.email,
      ServiceType: p.service_type,
      Bio:         p.bio,
      Rating:      p.rating,
      Campus:      p.campus,
      Availability: p.availability,
      HourlyRate:  p.hourly_rate,
      MonthlyRate: p.hourly_rate ? p.hourly_rate * 8 * 20 : null
    }));

    res.json({ success: true, providers: mapped });
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SERVICES ROUTES ──────────────────────────────────────────

// POST /services/publish
// A provider publishes a new service listing.
// Request body: { providerId, title, category, description, price, priceType,
//                 campus, availability, tags, imageUrl }
// Response:     { success, message, service }
app.post("/services/publish", async (req, res) => {
  const { providerId, title, category, description, price,
          priceType, campus, availability, tags, imageUrl } = req.body || {};

  // providerId, title, and category are the minimum required fields
  if (!providerId || !title || !category) {
    return res.status(400).json({
      success: false,
      message: "providerId, title, and category are required"
    });
  }

  try {
    // ── Step 1: Verify the provider exists ───────────────────
    // Prevent orphaned service rows if providerId is wrong or stale
    const { data: provider, error: provErr } = await supabase
      .from("service_providers")
      .select("id")
      .eq("id", providerId)
      .maybeSingle();
    if (provErr) throw provErr;

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // ── Step 2: Insert the service row ───────────────────────
    // .select().single() tells Supabase to return the newly created row
    // so we can confirm the data was saved correctly
    const { data: newService, error: insertErr } = await supabase
      .from("services")
      .insert({
        provider_id:  parseInt(providerId),              // BIGINT column
        title:        title,
        category:     category,
        description:  description  || null,
        price:        price        ? parseFloat(price) : null,
        price_type:   priceType    || "hourly",
        campus:       campus       || null,
        availability: availability || null,
        tags:         tags         || null,
        image_url:    imageUrl     || null,
        is_active:    true                               // Published immediately
      })
      .select()   // Return the inserted row
      .single();  // Exactly one row is expected
    if (insertErr) throw insertErr;

    res.status(201).json({
      success: true,
      message: "Service published successfully!",
      service: newService // Full row including generated id and created_at
    });
  } catch (err) {
    console.error("Publish service error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /services
// Returns all active services. Supports ?category= and ?campus= filters.
// Also joins service_providers so the frontend gets the provider's name.
// Example: GET /services?category=tutoring&campus=main
app.get("/services", async (req, res) => {
  try {
    // Start building the query — join to service_providers for provider info
    // services(*, service_providers(name, email, rating)) means:
    //   SELECT services.*, service_providers.name, service_providers.email, ...
    let query = supabase
      .from("services")
      .select("*, service_providers(full_name, email, rating, campus)")
      .eq("is_active", true)          // Only show published/active listings
      .order("created_at", { ascending: false }); // Newest first

    // ── Optional query-string filters ────────────────────────
    // .ilike() is case-insensitive LIKE — works better for user-typed search terms
    if (req.query.category) {
      query = query.ilike("category", `%${req.query.category}%`);
    }
    if (req.query.campus) {
      query = query.ilike("campus", `%${req.query.campus}%`);
    }

    const { data: services, error } = await query;
    if (error) throw error;

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    console.error("Get services error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /services/:id
// Returns a single service by its ID. Returns 404 if not found.
app.get("/services/:id", async (req, res) => {
  try {
    const { data: service, error } = await supabase
      .from("services")
      .select("*, service_providers(full_name, email, rating, campus)")
      .eq("id", req.params.id) // WHERE id = :id
      .single();               // Expects exactly 1 row; throws if 0 or 2+

    if (error) {
      // Supabase returns error code PGRST116 when .single() finds 0 rows
      if (error.code === "PGRST116") {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      throw error;
    }

    res.json({ success: true, service });
  } catch (err) {
    console.error("Get service by id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /services/provider/:providerId
// Returns all services listed by a specific provider.
// Used by the provider dashboard to show "My Listings".
app.get("/services/provider/:providerId", async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .eq("provider_id", req.params.providerId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    console.error("Get services by provider error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CONTACT FORM ─────────────────────────────────────────────

// POST /contact
// Saves a contact form message to the contact_messages table.
// Request body: { name, email, subject, message }
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required" });
  }

  try {
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message
    });
    if (error) throw error;

    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({ success: false, message: "Failed to save message, but request was received." });
  }
});


// ── CHATBOT ──────────────────────────────────────────────────

// POST /chatbot
// Simple keyword-based chatbot — no external AI API needed.
// Request body: { message }
// Response:     { success, response }
app.post("/chatbot", async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ success: false, response: "Please ask a question!" });
  }

  // Lowercase once so every check below is case-insensitive
  const msg = message.toLowerCase();
  let response = "";

  // Pattern-match the user's message against common topics
  if (msg.includes("sign up") || msg.includes("register")) {
    response = "📝 To sign up, click the 'Sign Up' button on the homepage. You'll need your student email and student ID number. It's free!";
  } else if (msg.includes("list") || msg.includes("service") || msg.includes("hustle")) {
    response = "💼 To list a service, click 'Start Your Hustle' on the homepage. Fill in your service details, price, and availability, then publish!";
  } else if (msg.includes("payment") || msg.includes("pay")) {
    response = "💰 We accept Mobile Money, Credit/Debit cards, Bank Transfer, and Cash on pickup. All payments are secure and encrypted.";
  } else if (msg.includes("cancel") || msg.includes("order")) {
    response = "❌ You can cancel an order within 24 hours from your 'My Orders' page. A full refund will be processed within 3-5 business days.";
  } else if (msg.includes("password") || msg.includes("forgot")) {
    response = "🔑 If you forgot your password, click 'Forgot Password' on the login page. You'll receive a reset link in your email.";
  } else if (msg.includes("hello") || msg.includes("hi")) {
    response = "👋 Hello! Welcome to Campus Connect! How can I help you today?";
  } else {
    response = "Thanks for your question! 🙏 Please check our FAQ section or ask about: signup, services, payments, cancellations, or ratings.";
  }

  res.json({ success: true, response });
});

// ── CATCH-ALL ERROR HANDLER ─────────────────────────────────
// Must be registered AFTER all routes so it catches errors from any route.
// Express identifies error handlers by their 4-parameter signature (err, req, res, next).
// This ensures the client always gets JSON instead of an HTML error page.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── START SERVER ─────────────────────────────────────────────
// "0.0.0.0" means listen on ALL network interfaces —
// not just localhost — so other devices on the campus network can reach it.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ ===== SERVER RUNNING =====`);
  console.log(`🌐 HTTP Server: http://172.16.16.77:${PORT}`);
  console.log(`🏠 Homepage:    http://172.16.16.77:${PORT}/`);
  console.log(`\n📝 ENDPOINTS:`);
  console.log(`   GET  /test`);
  console.log(`   GET  /check-tables`);
  console.log(`   POST /signup`);
  console.log(`   POST /login`);
  console.log(`   POST /provider/signup`);
  console.log(`   POST /provider/login`);
  console.log(`   GET  /providers`);
  console.log(`   POST /services/publish`);
  console.log(`   GET  /services`);
  console.log(`   GET  /services/:id`);
  console.log(`   GET  /services/provider/:providerId`);
  console.log(`   POST /contact`);
  console.log(`   POST /chatbot\n`);
});
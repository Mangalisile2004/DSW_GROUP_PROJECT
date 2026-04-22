const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const pool = require("./db");  // ← Import the database connection

const app = express();
app.use(bodyParser.json());

// ===== CORS MIDDLEWARE =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== TEST ENDPOINT =====
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", dbConnected: true });
});

// ===== SIGNUP ENDPOINT (Service Seeker) =====
app.post("/signup", async (req, res) => {
    const { fullName, surname, email, password, servicesNeeded, studentNumber } = req.body;
    
    if (!fullName || !surname || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    try {
        // Check if user exists
        const checkUser = await pool.query(
            "SELECT * FROM serviceseekers WHERE email = $1",
            [email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO serviceseekers (fullname, surname, email, passwordhash, serviceneeded, studentnumber) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [fullName, surname, email, hashedPassword, servicesNeeded || null, studentNumber || null]
        );
        
        res.json({ success: true, message: "Sign-up successful!", user: result.rows[0] });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== LOGIN ENDPOINT =====
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            "SELECT * FROM serviceseekers WHERE email = $1",
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.passwordhash);
        
        if (passwordMatch) {
            res.json({ 
                success: true, 
                message: "Login successful!", 
                user: {
                    id: user.id,
                    fullName: user.fullname,
                    surname: user.surname,
                    email: user.email,
                    servicesNeeded: user.serviceneeded,
                    studentNumber: user.studentnumber
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// ===== GET USER BY EMAIL =====
app.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    
    try {
        const result = await pool.query(
            "SELECT id, fullname, surname, email, studentnumber, serviceneeded FROM serviceseekers WHERE email = $1",
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
});

// ===== GET ALL PROVIDERS =====
app.get("/providers", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, fullname, surname, email, servicetype, bio, rating, campus, availability, hourlyrate FROM serviceproviders"
        );
        res.json({ success: true, providers: result.rows });
    } catch (err) {
        console.error("Error fetching providers:", err);
        res.status(500).json({ success: false, message: "Failed to fetch providers" });
    }
});

// ===== PROVIDER SIGNUP =====
app.post("/provider/signup", async (req, res) => {
    const { fullName, surname, email, studentNumber, password, serviceType, bio, hourlyRate, campus, availability } = req.body;
    
    if (!fullName || !surname || !email || !password || !serviceType) {
        return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }
    
    try {
        const checkUser = await pool.query(
            "SELECT * FROM serviceproviders WHERE email = $1",
            [email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Provider already exists with this email" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            `INSERT INTO serviceproviders (fullname, surname, email, studentnumber, passwordhash, servicetype, bio, hourlyrate, campus, availability, rating) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)`,
            [fullName, surname, email, studentNumber || null, hashedPassword, serviceType, bio || null, hourlyRate || null, campus || null, availability || null]
        );
        
        res.json({ success: true, message: "Service provider signup successful!" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== PROVIDER LOGIN =====
app.post("/provider/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            "SELECT * FROM serviceproviders WHERE email = $1",
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        const provider = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, provider.passwordhash);
        
        if (passwordMatch) {
            res.json({ 
                success: true, 
                message: "Login successful!", 
                provider: {
                    id: provider.id,
                    fullName: provider.fullname,
                    surname: provider.surname,
                    email: provider.email,
                    serviceType: provider.servicetype
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Provider login error:", err);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 Test: GET /test`);
    console.log(`📝 Signup: POST /signup`);
    console.log(`📝 Login: POST /login`);
    console.log(`📝 Provider Login: POST /provider/login`);
    console.log(`📝 Providers: GET /providers`);
});
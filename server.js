const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcrypt");

const app = express();

// CORS middleware - MUST be after app is created
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json());

const connectionString = "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-3D29LS2;Database=CampusConnectDB;Trusted_Connection=yes;Encrypt=no;";

const config = {
  connectionString: connectionString,
  driver: "msnodesqlv8"
};

let pool;

// ========== ROUTES ==========
app.get("/", (req, res) => {
  res.json({ message: "Campus Connect API" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", dbConnected: pool !== null });
});

app.post("/signup", async (req, res) => {
  const { fullName, surname, email, password, servicesNeeded } = req.body;
  
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  if (!fullName || !surname || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  
  try {
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query("SELECT * FROM ServiceSeekers WHERE Email = @email");
    
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.request()
      .input('fullName', sql.NVarChar, fullName)
      .input('surname', sql.NVarChar, surname)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('servicesNeeded', sql.NVarChar, servicesNeeded || null)
      .query("INSERT INTO ServiceSeekers (FullName, Surname, Email, PasswordHash, ServiceNeeded) VALUES (@fullName, @surname, @email, @password, @servicesNeeded)");
    
    res.json({ success: true, message: "Sign-up successful!" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  try {
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query("SELECT * FROM ServiceSeekers WHERE Email = @email");
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    
    if (passwordMatch) {
      res.json({ 
        success: true, 
        message: "Login successful!", 
        user: {
          id: user.Id,
          fullName: user.FullName,
          surname: user.Surname,
          email: user.Email,
          servicesNeeded: user.ServiceNeeded
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

app.get("/users", async (req, res) => {
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  try {
    const result = await pool.request()
      .query("SELECT Id, FullName, Surname, Email, ServiceNeeded FROM ServiceSeekers");
    res.json({ success: true, users: result.recordset });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// ========== SERVICE PROVIDER ROUTES ==========
app.get("/providers", async (req, res) => {
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  try {
    const result = await pool.request()
      .query("SELECT Id, FullName, Surname, Email, ServiceType, Bio, Rating FROM ServiceProviders");
    res.json({ success: true, providers: result.recordset });
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ success: false, message: "Failed to fetch providers" });
  }
});

app.get("/providers/:id", async (req, res) => {
  const { id } = req.params;
  
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query("SELECT Id, FullName, Surname, Email, ServiceType, Bio, Rating FROM ServiceProviders WHERE Id = @id");
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    
    res.json({ success: true, provider: result.recordset[0] });
  } catch (err) {
    console.error("Error fetching provider:", err);
    res.status(500).json({ success: false, message: "Failed to fetch provider" });
  }
});

app.post("/bookings", async (req, res) => {
  const { seekerId, providerId, serviceDate, status } = req.body;
  
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  if (!seekerId || !providerId || !serviceDate) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  
  try {
    await pool.request()
      .input('seekerId', sql.Int, seekerId)
      .input('providerId', sql.Int, providerId)
      .input('serviceDate', sql.DateTime, serviceDate)
      .input('status', sql.NVarChar, status || 'Pending')
      .query("INSERT INTO Bookings (SeekerId, ProviderId, ServiceDate, Status) VALUES (@seekerId, @providerId, @serviceDate, @status)");
    
    res.json({ success: true, message: "Booking created successfully!" });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/bookings/seeker/:seekerId", async (req, res) => {
  const { seekerId } = req.params;
  
  if (!pool) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  
  try {
    const result = await pool.request()
      .input('seekerId', sql.Int, seekerId)
      .query(`SELECT b.*, p.FullName as ProviderName, p.ServiceType, p.Email as ProviderEmail
              FROM Bookings b 
              JOIN ServiceProviders p ON b.ProviderId = p.Id 
              WHERE b.SeekerId = @seekerId
              ORDER BY b.ServiceDate ASC`);
    
    res.json({ success: true, bookings: result.recordset });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test: GET http://localhost:${PORT}/test`);
  console.log(`Signup: POST http://localhost:${PORT}/signup`);
  console.log(`Login: POST http://localhost:${PORT}/login`);
  console.log(`Users: GET http://localhost:${PORT}/users`);
  console.log(`Providers: GET http://localhost:${PORT}/providers`);
});

sql.connect(config)
  .then(poolConnection => {
    pool = poolConnection;
    console.log("Connected to SQL Server");
  })
  .catch(err => {
    console.error("DB error:", err.message);
  });
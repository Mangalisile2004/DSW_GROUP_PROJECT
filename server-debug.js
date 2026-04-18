const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql/msnodesqlv8");

const app = express();
app.use(bodyParser.json());

const connectionString = "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-3D29LS2;Database=CampusConnectDB;Trusted_Connection=yes;Encrypt=no;";

const config = {
  connectionString: connectionString,
  driver: "msnodesqlv8"
};

let pool;

app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ 
    message: "Server is running!", 
    dbConnected: pool !== null,
    timestamp: new Date().toISOString()
  });
});

app.post("/signup", async (req, res) => {
  console.log("Signup endpoint called", req.body);
  // ... rest of your signup code
  res.json({ success: true, message: "Sign-up successful!" });
});

app.get("/", (req, res) => {
  res.json({ message: "Campus Connect API is running" });
});

// Start server first, then connect to database
const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  console.log(`   - http://${require('os').hostname()}:${PORT}`);
  console.log(`Test the server: GET http://localhost:${PORT}/test`);
});

// Connect to database (don't let it crash the server)
sql.connect(config)
  .then(poolConnection => {
    pool = poolConnection;
    console.log("✅ Connected to SQL Server");
  })
  .catch(err => {
    console.error("❌ Database connection error (server still running):", err.message);
  });

const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
app.use(bodyParser.json());

// SQL Server connection config
const config = {
  user: "your_sql_username",
  password: "your_sql_password",
  server: "localhost", // or your SQL Server host
  database: "CampusConnectDB",
  options: { trustServerCertificate: true }
};

// Signup route
app.post("/signup", async (req, res) => {
  const { fullName, surname, email, password, servicesNeeded } = req.body;
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO ServiceSeekers (FullName, Surname, Email, PasswordHash, ServiceNeeded)
      VALUES (${fullName}, ${surname}, ${email}, ${password}, ${servicesNeeded})
    `;
    res.json({ success: true, message: "Sign-up successful!" });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ success: false, message: "Error signing up" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

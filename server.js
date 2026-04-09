const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
app.use(bodyParser.json());

// SQL Server connection config
const config = {
  user: "your_sql_username",
  password: "your_sql_password",
  server: "localhost", // or your SQL Server instance name
  database: "CampusConnectDB",
  options: {
    trustServerCertificate: true
  }
};

// Sign-up route
app.post("/signup", async (req, res) => {
  const { fullName, email, studentNumber, password, servicesNeeded } = req.body;

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO ServiceSeekers (FullName, Email, StudentNumber, PasswordHash, ServicesNeeded)
      VALUES (${fullName}, ${email}, ${studentNumber}, ${password}, ${servicesNeeded})
    `;
    res.json({ success: true, message: "Sign-up successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error signing up" });
  }
});

// Fetch user details for dashboard
app.get("/user/:email", async (req, res) => {
  const email = req.params.email;
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT FullName, StudentNumber, ServicesNeeded
      FROM ServiceSeekers
      WHERE Email = ${email}
    `;
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));



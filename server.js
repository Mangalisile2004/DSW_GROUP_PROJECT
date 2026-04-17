const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql/msnodesqlv8");

const app = express();
app.use(bodyParser.json());

// SQL Server connection config
//const sql = require("mssql/msnodesqlv8");//

const config = {
  server: "DESKTOP-3D29LS2",
  database: "CampusConnectDB",
  driver: "msnodesqlv8",
  options: {
    trustServerCertificate: true,
    encrypt: false
  },
  authentication: {
    type: "default",
    options: {
      integratedSecurity: true
    }
  }
};


//sql.connect(config)
  //.then(() => console.log("✅ Connected to SQL Server with Windows Authentication"))
  //.catch(err => console.error("❌ Connection error:", err));//

sql.connect(config)
  .then(pool => {
    console.log("✅ Connected to SQL Server with Windows Authentication");

// Signup route
app.post("/signup", async (req, res) => {
  const { fullName, surname, email, password, servicesNeeded } = req.body;
  //try {
    //await sql.connect(config);
    //await sql.query`
  //INSERT INTO ServiceSeekers (Id, FullName, Surname, Email, PasswordHash, ServiceNeeded)
  //VALUES (NEWID(), ${fullName}, ${surname}, ${email}, ${password}, ${servicesNeeded})
//`;
    try {
        await pool.request().query(`
          INSERT INTO ServiceSeekers (Id, FullName, Surname, Email, PasswordHash, ServiceNeeded)
          VALUES (NEWID(), '${fullName}', '${surname}', '${email}', '${password}', '${servicesNeeded}')
        `);

    res.json({ success: true, message: "Sign-up successful!" });
      } catch (err) {
    console.error("Error inserting user:", err);
        res.status(500).json({ success: false, message: "Error signing up", error: err.message });
      }
    });
  })
  .catch(err => console.error("❌ Connection error:", err));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// Start server
//app.listen(3000, () => {
  //console.log("Server running on http://localhost:3000");
//});

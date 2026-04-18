const express = require("express");
const app = express();

app.get("/test", (req, res) => {
  res.json({ message: "Working!", timestamp: new Date().toISOString() });
});

const PORT = 3001;  // Changed to 3001
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`Try: GET http://localhost:${PORT}/test`);
});

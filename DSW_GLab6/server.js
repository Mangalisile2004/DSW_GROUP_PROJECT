const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/protectaccess", (req, res) => {
    let name = req.body.name;
    let pw = req.body.pw;
    let id = req.body.IDnumber;

    let nameValid = name && !/^\d+$/.test(name);
    let pwValid = pw.length >= 10 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
    let idValid = /^(\d{3}-?){4}$/.test(id); 

    id = id.replace(/[-.]/g, "");

    let maskedPw = "*".repeat(pw.length);

    let resultText = "";
    if (nameValid && pwValid && idValid) {
        resultText = "<h1 style='color:green'>Successful</h1>";
    } else {
        resultText = "<h1 style='color:red'>Access Denied Invalid Data</h1>";
    }

    resultText += `<p>${name}, ${maskedPw}, ${id}</p>`;

    fs.writeFileSync("accessresults.txt", resultText);

    res.send(resultText);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

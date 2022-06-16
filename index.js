const axios = require("axios");
const fs = require("fs");
const bank = require("./bank.json");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("get");
  res.json(bank);
});
app.post("/newUser", (req, res) => {
  const reqBody = req.body;
  if (reqBody.name && reqBody.passportId) {
    res.send(reqBody);
  }
  res.send("invalid req");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

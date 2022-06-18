const axios = require("axios").default;
const uniqid = require("uniqid");
const fs = require("fs");
const bank = require("./bank.json");
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//util functions
const saveFile = (dataToSave) => {
  try {
    fs.writeFileSync("./bank.json", JSON.stringify(dataToSave));
  } catch (err) {
    console.log(err);
  }
};
const loadBank = () => {
  try {
    const dataBuffer = fs.readFileSync("bank.json");
    const datajson = dataBuffer.toString();
    const data = JSON.parse(datajson);
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};
//return current bank
app.get("/", (req, res) => {
  res.json(bank);
});
//get method to get user info
app.get("/:id", (req, res) => {
  try {
    console.log(findUserById(req.params.id));
    res.json(findUserById(req.params.id));
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
//new user with info in body {name,passportId,cash,credit}
app.post("/newUser", (req, res) => {
  const reqBody = req.body;
  if (reqBody.name && reqBody.passportId) {
    const newUser = loadBank();
    newUser.push({
      name: reqBody.name,
      id: uniqid(),
      passportId: reqBody.passportId,
      cash: reqBody.cash || 0,
      credit: reqBody.credit || 0,
    });
    saveFile(newUser);
    res.send(newUser);
  } else {
    res.status(400);
    res.send("invalid req");
  }
});
//withdraw {id,transfer}
app.put("/withdraw", (req, res) => {
  const reqBody = req.body;
  let usersData = loadBank();
  for (let i = 0; i < usersData.length; i++) {
    if (usersData[i].id === reqBody.id) {
      console.log("match");
      let userMoneyAvailable = usersData[i].cash + usersData[i].credit;
      if (userMoneyAvailable >= reqBody.withdraw) {
        usersData[i].cash -= reqBody.withdraw;
        saveFile(usersData);
        res.json(usersData[i]);
        return;
      } else {
        res.status(400);
        res.send("unable to complete action, not enough cash and or credit");
      }
    }
  }
});
//deposit
app.put("/deposit", (req, res) => {
  const reqBody = req.body;
  const depoAmout = parseInt(req.body.deposit);
  if (
    depoAmout &&
    depoAmout > 0 &&
    parseInt(reqBody.deposit) !== null &&
    parseInt(reqBody.deposit) !== NaN
  ) {
    let usersData = loadBank();
    for (let i = 0; i < usersData.length; i++) {
      if (usersData[i].id === reqBody.id) {
        usersData[i].cash = parseInt(usersData[i].cash) + depoAmout;
        saveFile(usersData);
        res.send(usersData[i]);
        return;
      }
    }
  } else res.send("unable to complete action, error");
});
//updatecredit
app.put("/updateCredit", (req, res) => {
  let usersData = loadBank();
  const reqBody = req.body;
  if (reqBody.credit && reqBody.credit > 0) {
    for (let i = 0; i < usersData.length; i++) {
      if (usersData[i].id === reqBody.id) {
        usersData[i].credit = parseInt(reqBody.credit);
        saveFile(usersData);
        res.send(usersData[i]);
        return;
      }
    }
  } else res.send("credit negative");
});
//transfer
const findUserById = (id) => {
  const usersData = loadBank();

  for (let i = 0; i < usersData.length; i++) {
    if (usersData[i].id === id) return usersData[i];
  }
  return false;
};
//{from:id,to:id,transfer:cash amout @number}
app.put("/transfer", (req, res) => {
  const reqBody = req.body;
  const usersData = loadBank();
  //check both exist
  if (findUserById(reqBody.from) && findUserById(reqBody.to)) {
    //check credit before transfer
    if (
      findUserById(reqBody.from).cash + findUserById(reqBody.from).credit >
      reqBody.transfer
    ) {
      console.log("able to transfer enogh money");
      for (let i = 0; i < usersData.length; i++) {
        if (usersData[i].id === reqBody.from) {
          usersData[i].cash =
            parseInt(usersData[i].cash) - parseInt(reqBody.transfer);
        }
        if (usersData[i].id === reqBody.to) {
          usersData[i].cash =
            parseInt(usersData[i].cash) + parseInt(reqBody.transfer);
        }
      }
      saveFile(usersData);
      res.send(usersData);
    } else {
      console.log("unable to complete action");
      res.status(400);
      res.send(findUserById(reqBody.from).name + " does not have enough money");
    }
  } else {
    res.status(400);
    res.send("invalid id, users not found");
  }
});
//*When fetching users, make sure they exist. //req
//*Cannot add duplicate users
//*IsActive
const port = process.env.PORT || 3000;
app.listen(port);

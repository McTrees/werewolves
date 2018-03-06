const fs = require("fs");
const path = require("path")
const sqlite3 = require("sqlite3")
const user = require("./user")
const userdb = user._db
const utils = require("../utils")


function InactivityCheck() {
  return new Promise(function(resolve, reject) {


  utils.debugMessage("Checking for inactivity")
  getUserActivity(72).then(rows => {
    utils.debugMessage(rows)

  })
  userdb.all(""), function(err, rows) {
    if (err) {console.log(err);}
    if (rows = []) {
      utils.debugMessage("No players hit inactivity limit")
      return
    } else {
      utils.debugMessage("Rows were: " + rows)
      resolve(rows)
    }
  }
  })
}

function getUserActivity (time) {
  // returns promise of base64 of emoji for user
  return new Promise(function(resolve, reject) {
    userdb.all("SELECT user_id FROM players WHERE inactivity_counter = ? AND alive = 1", time, function(err, row) {
      if (err) throw err;
      if (row) {
        resolve(row.emoji)
      } else {
        reject()
      }
    })
  });
};

setInterval( InactivityCheck, 1*5*100 ); //2, 60, 1000 is every 2 minutes; 60, 60, 1000 is every hour

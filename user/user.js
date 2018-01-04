const sqlite3 = require("sqlite3");
const fs = require("fs");

exports.init = function() {
  if (!fs.existsSync("user/user.db")) { //database file doesn't exist
    throw new Error("User database 'user/user.db' not found! Please create a new database by running 'user/user_db_schema.sql'! (This will happen automatically in the future)");
  }
}

exports.signupCmd = function (msg, client) {
  msg.channel.send(`${msg.content.split(" ")[1]} wants emoji ${msg.content.split(" ")[2]}.`);
};

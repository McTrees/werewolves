const fs = require("fs");

const db_fns = require("./db_fns")

const utils = require("../utils.js")

const config = require('../config');

exports.init = function() {
  if (!fs.existsSync("user/user.db")) { //database file doesn't exist
    throw new Error("User database 'user/user.db' not found! Please create a new database by running 'user/user_db_schema.sql'! (This will happen automatically in the future)");
  }
}

exports.signupCmd = function (msg, client, content = false) {
  if (content == false){
    msg.reply(`I'm glad you want to sign up but the correct syntax is \`${config.bot_prefix}signup <emoji>\``)
  } else {
    msg.react(content).catch(err=>{
      msg.reply(`${content} is not a valid emoji...`)
    })

  //msg.channel.send("`"+msg.content+"`")
  }
};

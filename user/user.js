const fs = require("fs");

const db_fns = require("./db_fns")

const utils = require("../utils.js")

const config = require('../config');

const admin = require("../admin/admin")

exports.init = function() {
  if (!fs.existsSync("user/user.db")) { //database file doesn't exist
    throw new Error("User database 'user/user.db' not found! Please create a new database by running 'user/user_db_schema.sql'! (This will happen automatically in the future)");
  }
}

exports.signupCmd = function (msg, client, content = false) {
  if (content == false){
    msg.reply(`I'm glad you want to sign up but the correct syntax is \`${config.bot_prefix}signup <emoji>\``)
  } else {
    msg.react(content).then(mr=>{
      msg.clearReactions();
      db_fns.getUserId(utils.toBase64(content)).then((id)=>{
        // already in use
        msg.channel.send(`Sorry but <@${id}> is already using that emoji!`)
      }).catch(()=>{
        msg.reply("your signup request has been sent to the game masters for confirmation!")
        admin.confirm(`<@${msg.author.id}> wants to sign up with emoji ${content}`)
        db_fns.addUser(msg.author.id, utils.toBase64(content)).then(old=>{
          if (old) {
            msg.channel.send(`<@${msg.author.id}>'s emoji changed from ${utils.fromBase64(old)} to ${content}`)
          } else {
            msg.channel.send(`<@${msg.author.id}> signed up with emoji ${content}`)
          }
        })
      })
    }).catch(()=>{ // react
      msg.reply(`${content} is not a valid emoji...`)
    })
  }
}

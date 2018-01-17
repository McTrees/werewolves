const fs = require("fs");

const db_fns = require("./db_fns")

const utils = require("../utils.js")

const config = require('../config');

const admin = require("../admin/admin")

const game = require('../game/game.js')

exports.init = function() {
  if (!fs.existsSync("user/user.db")) { //database file doesn't exist
    throw new Error("User database 'user/user.db' not found! Please create a new database by running 'user/user_db_schema.sql'! (This will happen automatically in the future)");
  }
}

exports.signupCmd = function (msg, client, content) {
  if (game.is_started()) {
    msg.reply('Sorry, but a game is already in progress! Please wait for next season to start.')
  } else {
    if (content.length != 1){
      msg.reply(`I'm glad you want to sign up but the correct syntax is \`${config.bot_prefix}signup <emoji>\``)
    } else {
      msg.react(content[0]).then(mr=>{
        msg.clearReactions();
        db_fns.getUserId(utils.toBase64(content[0])).then((id)=>{
          // already in use
          msg.channel.send(`Sorry but <@${id}> is already using that emoji!`)
        }).catch(()=>{
          db_fns.addUser(msg.author.id, utils.toBase64(content[0])).then(old=>{
            if (old) {
              msg.channel.send(`<@${msg.author.id}>'s emoji changed from ${utils.fromBase64(old)} to ${content[0]}`)
            } else {
              msg.channel.send(`<@${msg.author.id}> signed up with emoji ${content[0]}`)
            }
          })
        })
      }).catch(()=>{ // react
        msg.reply(`${content[0]} is not a valid emoji...`)
      })
    }
  }
}

exports.all_signed_up = function() {
  // returns promise of a list of all signed up users' ids
  //intentionally does not include emojis to prevent this being used for polls etc
  return new Promise(function(resolve, reject) {
    db.all("select user_id from signed_up_users", [], function(err, rows){
      if (err) {
        throw err
      } else {
        resolve(rows)
      }
    })
  });
}

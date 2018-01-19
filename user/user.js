const fs = require("fs");

const db_fns = require("./db_fns")

const utils = require("../utils.js")

const config = require('../config');

const admin = require("../admin/admin")

const game = require('../game/game.js')

exports.init = function() {
  if (!fs.existsSync("user/user.db")) { //database file doesn't exist
    db_fns.init()
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
  return db_fns.all_signed_up()
}

exports.add_actual_user = function(id, lives, role) {
  return db_fns.add_actual_user(id, lives, role)
}

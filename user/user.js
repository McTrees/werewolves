const fs = require("fs");
const path = require("path")
const sqlite3 = require("sqlite3")
const userdb = new sqlite3.Database("user/user.db")
const utils = require("../utils.js")
const config = require('../config');
const admin = require("../admin/admin")


/*
███████ ██   ██ ██████   ██████  ██████  ████████ ███████ ██████
██       ██ ██  ██   ██ ██    ██ ██   ██    ██    ██      ██   ██
█████     ███   ██████  ██    ██ ██████     ██    █████   ██   ██
██       ██ ██  ██      ██    ██ ██   ██    ██    ██      ██   ██
███████ ██   ██ ██       ██████  ██   ██    ██    ███████ ██████
*/

exports.init = function() {
  // called on bot start
  fs.readFile(path.join(__dirname, 'user.db'), {encoding: "utf-8"}, function(err, data){
    if (data === '') { // database is empty and needs to be created
      fs.readFile(path.join(__dirname, 'user_db_schema.sql'), {encoding: "utf-8"}, function(er, schema) {
        if (er) throw er
        else {
          console.log("User database not found - creating a new one")
          userdb.exec(schema)
        }
      })
    }
  })
}

exports.signupCmd = function (msg, client, content) {
  // command for signing yourself up
  if (fs.existsSync("game.dat")) {
    msg.reply('Sorry, but a game is already in progress! Please wait for next season to start.')
  } else {
    if (content.length != 1){
      msg.reply(`I'm glad you want to sign up but the correct syntax is \`${config.bot_prefix}signup <emoji>\``)
    } else {
      msg.react(content[0]).then(mr=>{
        msg.clearReactions();
        getUserId(utils.toBase64(content[0])).then((id)=>{
          // already in use
          msg.channel.send(`Sorry but <@${id}> is already using that emoji!`)
        }).catch(()=>{
          addUser(msg.author.id, utils.toBase64(content[0])).then(old=>{
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
    userdb.all("select user_id from signed_up_users", [], function(err, rows){
      if (err) {
        throw err
      } else {
        resolve(rows)
      }
    })
  });
}

exports.finalise_user = function(id, role) {
  // turns a signed up user into a player with a role
  userdb.serialize(function(){
    userdb.run("begin transaction;")
    userdb.run("replace into players (user_id, role) values ($id, $role);", {$id:id,$role:role})
    userdb.run("update signed_up_users set finalised = 1 where user_id = $id;", {$id:id})
    userdb.run("commit;")
  })
}

exports.resolve_to_id = function(str) {
  // if str is a discord mention (<@id>), resolve with the id
  // if str is an emoji, resolve with the id of the user with that emoji
  // otherwise, reject
  // note: currently if this is a mention, but of someone not in the server, it will still return their id.
  return new Promise(function(resolve, reject) {
    var discordId = /^<@!?(\d+)>$/
    if (discordId.test(str)) { // str is a valid discord mention
      resolve(discordId.exec(str)[1])
    } else { // emoji or invalid
      db.get("select user_id from signed_up_users where emoji = ?", [utils.toBase64(str)], function(err, row){
        if (err) throw err //TODO: err handling
        if (row.user_id) { resolve(row.user_id)}
        else { reject() }
      })
    }
  });
}
/*
██ ███    ██ ████████ ███████ ██████  ███    ██  █████  ██
██ ████   ██    ██    ██      ██   ██ ████   ██ ██   ██ ██
██ ██ ██  ██    ██    █████   ██████  ██ ██  ██ ███████ ██
██ ██  ██ ██    ██    ██      ██   ██ ██  ██ ██ ██   ██ ██
██ ██   ████    ██    ███████ ██   ██ ██   ████ ██   ██ ███████
*/
// moved from db_fns.js

function addUser(id, emoji) {
  // if no one else is using that emoji, sign them up
  // or change their emoji
  // returns promise:
    // reject = id of user using that emoji
    // resolve: old emoji if changed, nothing (undefined) otherwise
  return new Promise(function(resolve, reject) {
    getUserId(emoji).then(i=>{
      reject(i)
    }).catch(()=>{
      //check if user is already signed up
      getUserEmoji(id).then(old_emoji=>{
        //user already signed up, wants to change their emoji
        userdb.run("replace into signed_up_users values (?, ?)", [id, emoji], ()=>{
          resolve(old_emoji);
        })
      }).catch(()=>{
        //not signed up, wants to.
        userdb.run("insert into signed_up_users values (?, ?)", [id, emoji], ()=>{
          resolve()
        })
      })
    })
  })
};

function getUserEmoji (id) {
  // returns promise of base64 of emoji for user
  return new Promise(function(resolve, reject) {
    userdb.get("select emoji from signed_up_users where user_id = ?", id, function(err, row) {
      if (err) throw err;
      if (row) {
        resolve(row.emoji)
      } else {
        reject()
      }
    })
  });
};

function getUserId (emoji) {
  // returns promise of id for user by emoji
  return new Promise(function(resolve, reject) {
    userdb.get("select user_id from signed_up_users where emoji = ?", emoji, function(err, row) {
      if (err) throw err;
      if (row) {
        resolve(row.user_id)
      } else {
        reject()
      }
    })
  });
};

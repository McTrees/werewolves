const fs = require("fs");
const path = require("path")
const sqlite3 = require("sqlite3")
const userdb = new sqlite3.Database("user/user.db")

exports._db = userdb
//don't use unless there isn't a function for it
//and even then it's probably best to write a function for it anyway

const userprofile = require("./userprofile")
const utils = require("../utils.js")
const config = require('../config');
const admin = require("../admin/admin")
const discord = require('discord.js')
const game_state = require("../game/game_state")
exports.commands = {}
/*
███████ ██   ██ ██████   ██████  ██████  ████████ ███████ ██████
██       ██ ██  ██   ██ ██    ██ ██   ██    ██    ██      ██   ██
█████     ███   ██████  ██    ██ ██████     ██    █████   ██   ██
██       ██ ██  ██      ██    ██ ██   ██    ██    ██      ██   ██
███████ ██   ██ ██       ██████  ██   ██    ██    ███████ ██████
*/

exports.init = function(reset_data) {
  // called on bot start
  fs.readFile(path.join(__dirname, 'user.db'), {encoding: "utf-8"}, function(err, data){
    if(err) throw err;
    if (data === '' || reset_data) { // database is empty and needs to be created
      fs.readFile(path.join(__dirname, 'user_db_schema.sql'), {encoding: "utf-8"}, function(er, schema) {
        if (er) throw er
        else {
          utils.warningMessage(reset_data?"You chose to reset the game data for this bot, creating new user database.":"User database not found - creating a new one");
          userdb.exec(schema);
          if(reset_data){
            utils.warningMessage("Database reset.");
          }else{
            utils.successMessage("Database created!");
          }
        }
      })
    }
  })
}

const FORBIDDEN_EMOJIS = [
  // emojis that players are not allowed to sign up with
  // will be used for the dead market system
  "😇",
  "🐺",
  "⚰",
  "🎷",
  "😈",
  "☠",
  "👼",
  "👑",
  "🏇",
  "❄",
  "🔥",
  "❓",
  "🤢",
  "🔃"
]

exports.commands.signup = function (msg, client, content) {
  utils.debugMessage(`@${msg.author.username} ran signup command with emoji ${content[0]}`)
  // command for signing yourself up
  if (game_state.data().state_num !== 1) {
    if (game_state.data().state_num == 0) {
      msg.reply("signups aren't open yet!")
    } else {
      msg.reply("a game is currently in progress. please wait for it to finish before signing up")
    }
  } else {
    if (content.length != 1){
      msg.reply(`I'm glad you want to sign up but the correct syntax is \`${config.bot_prefix}signup <emoji>\``)
    } else {
      msg.react(content[0]).then(mr=>{
        msg.clearReactions();
        if (FORBIDDEN_EMOJIS.includes(content[0])) {
          msg.reply("you can't sign up with that emoji because it represents something special in the ghost market minigame for dead people")
        } else {
          getUserId(utils.toBase64(content[0])).then((id)=>{
            // already in use
            msg.channel.send(`Sorry but <@${id}> is already using that emoji!`)
          }).catch(()=>{
            addUser(client, msg.author.id, utils.toBase64(content[0])).then(old=>{
              if (old) {
                msg.channel.send(`<@${msg.author.id}>'s emoji changed from ${utils.fromBase64(old)} to ${content[0]}`)
              } else {
                userprofile.registerIfNew(msg.author).then((result)=>{
                  if(result === 0){
                    utils.debugMessage("A previous player of Werewolves has signed up for this season");
                  }else if (result === 1){
                    client.channels.get(config.channel_ids.gm_confirm).send(`<@${msg.author.id}> is a new player!`);
                  }else{
                    client.channels.get(config.channel_ids.gm_confirm).send(`Error in registering <@${msg.author.id}>!`);
                  }
                  msg.channel.send(`<@${msg.author.id}> signed up with emoji ${content[0]}`);
                });
              }
            })
          })
        }
      }).catch(()=>{ // react
        msg.reply(`${content[0]} is not a valid emoji...`)
      })
    }
  }
}

exports.commands.signupall = async function(msg, client, args) {
  //exports.all_signed_up().then(rows=>{
  var rows = await exports.all_signed_up()
    utils.debugMessage(`signup_all command - ${rows.length} rows`)
    if (rows.length === 0) {
      msg.reply("no one is signed up yet")
    } else {
      // split the rows
      var i,max,temparray,j,row,emb,role
      var size = 20 // 20 fields per embed
      for (i=0,max=rows.length; i<max; i+=size) {
        temparray = rows.slice(i,i+size);
        emb = new discord.RichEmbed()
        emb.color = 0xffff00
        emb.title = "List of currently signed up players"
        for (j=0;j<temparray.length;j++) {
          row = temparray[j]
          role = await exports.get_role(row.user_id)
          if (role) {
            emb.addField(`${utils.fromBase64(row.emoji)} - ${client.users.get(row.user_id).username}#${client.users.get(row.user_id).discriminator}`, 'Has a role')
          } else {
            emb.addField(`${utils.fromBase64(row.emoji)} - ${client.users.get(row.user_id).username}#${client.users.get(row.user_id).discriminator}`, '\u200B')
          }
        }
        msg.channel.send(emb)
      }
    }
  //})
}

exports.all_signed_up = function() {
  // returns promise of a list of all signed up users' ids and emojis
  return new Promise(function(resolve, reject) {
    userdb.all("select user_id, emoji from signed_up_users", [], function(err, rows){
      if (err) {
        throw err
      } else {
        resolve(rows)
      }
    })
  });
}

exports.all_alive = function() {
  // promise of all alive users and their emojis
  return new Promise(function(resolve, reject) {
    userdb.all("select p.user_id id, s.emoji emoji from players as p inner join signed_up_users as s on p.user_id = s.user_id and p.alive = 1;", [], function(err, rows){
      if (err) { throw err }
      else{
        resolve(rows)
      }
    });
  });
}

exports.get_role = function(id) {
  // get the role of a player
  utils.debugMessage(`getting role of ${id}`)
  return new Promise(function(resolve, reject) {
    userdb.get("select role from players where user_id = ?", [id], function(err, row) {
      //console.log("yes")
      if (err) { throw err }
      else {
        if (!row) {
          resolve(undefined)
        } else {
          resolve(row.role)
        }
      }
    })
  });
}

exports.set_role = function(id, role) {
  // sets a users role
  utils.debugMessage(`setting ${id}'s role to ${role}`)
  userdb.run("update players set role = $role where user_id = $id;", {$id:id,$role:role})
}

exports.set_alive = function(id, alive) {
  utils.debugMessage(`setting ${id}'s aliveness to ${alive}`)
  userdb.run("update players set alive = $alive where user_id = $id", {$id:id,$alive:alive})
}

exports.all_with_role = function(role) {
  return new Promise(function(resolve, reject) {
    utils.debugMessage(`getting all players with role ${role}`)
    userdb.all("select user_id from players where role = ? and alive <> 0", [role], function(err, rows) {
      if (err) throw err;
      resolve(rows.map(i=>i.user_id))
    })
  });
}

exports.finalise_user = function(client, id, role) {
  // turns a signed up user into a player with a role
  userdb.serialize(function(){
    userdb.run("begin transaction;")
    userdb.run("replace into players (user_id, role) values ($id, $role);", {$id:id,$role:role})
    userdb.run("update signed_up_users set finalised = 1 where user_id = $id;", {$id:id})
    userdb.run("commit;")
  })
  // they didn't want the participant role to be added here.
}

exports.any_left_unfinalised = function() {
  return new Promise(function(resolve, reject) {

    userdb.get("select user_id from signed_up_users where finalised = 0;", [], function(err, row){
      // we should have a row if anyone does not have a role
      if (err) throw err;
      if (row === undefined) {
        utils.debugMessage("any left unfinalised -- resolving false")
        // none there
        resolve(false)
      } else {
        // there is at least one user without a role
        utils.debugMessage("any left unfinalised -- resolving true")
        resolve(true)
      }
    })
  });
}

exports.resolve_to_id = function(str) {
  // if str is a discord mention (<@id>), resolve with the id
  // if str is an emoji, resolve with the id of the user with that emoji
  // otherwise, reject
  // note: currently if this is a mention, but of someone not in the server, it will still return their id.
  return new Promise(function(resolve, reject) {
    var plainId = /^(\d+)$/
    if (plainId.test(str)) {
      resolve(plainId.exec(str)[1])
    }
    var discordId = /^<@!?(\d+)>$/
    if (discordId.test(str)) { // str is a valid discord mention
      resolve(discordId.exec(str)[1])
    } else { // emoji or invalid
      userdb.get("select user_id from signed_up_users where emoji = ?", [utils.toBase64(str)], function(err, row){
        if (err) throw err //TODO: err handling
        if (row) { resolve(row.user_id) }
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

function addUser(client, id, emoji) {
  // if no one else is using that emoji, sign them up
  // or change their emoji
  // returns promise:
  // reject = id of user using that emoji
  // resolve: old emoji if changed, nothing (undefined) otherwise
  utils.debugMessage("Function addUser called");
  return new Promise(function(resolve, reject) {
    getUserId(emoji).then(i=>{
      reject(i)
    }).catch(()=>{
      //check if user is already signed up
      getUserEmoji(id).then(old_emoji=>{
        //user already signed up, wants to change their emoji
        utils.debugMessage("User wants to replace old emoji");
        userdb.run("replace into signed_up_users (user_id, emoji) values (?, ?)", [id, emoji], ()=>{
          resolve(old_emoji);
        })
      }).catch(()=>{
        //not signed up, wants to.
        utils.debugMessage("User wants to sign up and not replace an emoji");
        userdb.run("insert into signed_up_users (user_id, emoji) values (?, ?)", [id, emoji], ()=>{
          client.guilds.get(config.guild_id).fetchMember(id).then(member=>member.addRole(config.role_ids.signed_up))
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
  utils.debugMessage("getUserId function Called")
  return new Promise(function(resolve, reject) {
    userdb.get("select user_id from signed_up_users where emoji = ?", [emoji], function(err, row) {
      if (err) throw err;
      if (row) {
        utils.debugMessage("Promise resolved; user is already signed up")
        resolve(row.user_id)
      } else {
        utils.debugMessage("Promise rejected; user is not signed up yet")
        reject()
      }
    })
  });
};

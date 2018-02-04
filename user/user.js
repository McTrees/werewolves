const fs = require("fs");
const path = require("path")
const sqlite3 = require("sqlite3")
const userdb = new sqlite3.Database("user/user.db")
const utils = require("../utils.js")
const config = require('../config');
const admin = require("../admin/admin")
const discord = require('discord.js')

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
    if(err) throw err;
	if (data === '') { // database is empty and needs to be created
      fs.readFile(path.join(__dirname, 'user_db_schema.sql'), {encoding: "utf-8"}, function(er, schema) {
        if (er) throw er
        else {
          utils.warningMessage("User database not found - creating a new one")
          userdb.exec(schema)
        }
      })
    }
  })
}

exports.signupCmd = function (msg, client, content) {
  utils.debugMessage(`@${msg.author.username} ran signup command with emoji ${content[0]}`)
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
			  registerIfNew(msg.author).then((result)=>{
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
      }).catch(()=>{ // react
        msg.reply(`${content[0]} is not a valid emoji...`)
      })
    }
  }
}

exports.signup_allCmd = function(msg, client, args) {
  exports.all_signed_up().then(rows=>{
    utils.debugMessage(`signup_all command - ${rows.length} rows`)

    // split the rows
    var i,max,chunk,j,row
    var size = 20 // 20 fields per embed
    for (i=0,max=rows.length; i<max; i+=size) {
        temparray = rows.slice(i,i+size);
        emb = new discord.RichEmbed(color=0xffff00)
        for (j=0;j<temparray.length;j++) {
          row = temparray[j]
          emb.addField(`${client.users.get(row.user_id).username}#${client.users.get(row.user_id).discriminator}`, utils.fromBase64(row.emoji))
        }
        msg.channel.send(embed=emb)
    }
  })
}

exports.profileCmd = function(msg, client, content){
	var user = msg.author;
	utils.debugMessage(`@${user.username} wanted to see their profile.`);
	getProfile(user.id).then((row) => {
		if(row){
			var embed = new discord.RichEmbed();
			if(row.username === null)embed.setTitle(user.username);
			else embed.setTitle(row.username);
			if(row.profile_pic === null)embed.setThumbnail(user.avatarURL);
			else embed.setThumbnail(row.profile_pic);
			embed.setDescription(`Gender: ${row.gender}\nAge: ${row.age}\nGames Played: ${row.games}\nGames Won: ${row.wins}`);
			msg.reply({embed});
		}else{
			msg.reply(`User <@${user.id}> has not been registered in global database yet!`);
		}
	}).catch(err => {
		utils.errorMessage(err);
	});
}

exports.all_signed_up = function() {
  // returns promise of a list of all signed up users' ids
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
    userdb.all("select p.user_id id, s.emoji emoji from players as p inner join signed_up_users as s on p.user_id = s.user_id", [], function(err, rows){
      if (err) throw err;
      else{
        resolve(rows)
      }
    });
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

exports.any_left_unfinalised = function() {
  // promise bool, whether any signed up users have not yet been asigned a role
  return new Promise(function(resolve, reject){
    userdb.get("select user_id from signed_up_users where finalised != 0", [], function(err, row){
      if (err) throw err;
      if (row === undefined) {
        // none there
        resolve(false)
      } else {
        // there is at least one user without a role
        resolve(true)
      }
    })
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

function checkGlobal(id){
	return new Promise((resolve, reject) =>{
		userdb.get("select user_id from global_player where user_id = ?", id, function(err, row) {
			if(err)reject(err);//If error occurred, reject
			if(row)resolve(row.user_id);//if user was found, resolve with username
			else resolve();//if user wasn't found, resolve without anything
		});
	});
}

function getProfile(id){
	return new Promise((resolve, reject) => {
		userdb.get("select username, ifnull(gender, 'Unknown') as gender, ifnull(age, 'Unknown') as age, ifnull(personal_record, 'No record yet') as record, ifnull(personal_desc, 'No description yet') as desc, games, wins, profile_pic from global_player where user_id = ?", id, function(err, row) {
			if(err)reject(err);//If error occurred, reject
			if(row)resolve(row);//if user was found, resolve with the profile
			else resolve();//if user wasn't found, resolve without anything
		});
	});
}

async function registerIfNew(user){
	try{
		var username = await checkGlobal(user.id);
		if(!username){
			await registerNewUser(user);
			utils.successMessage(`Registered new user (@${user.username}) globally!`);
			return 1;
		}
		return 0;
	}catch(err){
		utils.errorMessage(err);
		return -1;
	}
}

function registerNewUser(user){
	return new Promise((resolve, reject)=>{
		utils.debugMessage(`Attempting to register user @${user.username} gloablly.`);
		userdb.run("insert into global_player (user_id) values (?)", [user.id], (err) => {
			if(err)reject(err);
			else resolve();
		});
	});
}

// moved from db_fns.js

function addUser(id, emoji) {
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

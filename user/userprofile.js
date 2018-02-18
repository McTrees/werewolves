const utils = require("../utils.js")
const sqlite3 = require("sqlite3")
const userdb = new sqlite3.Database("user/user.db")
const discord = require('discord.js')
const config = require('../config');
/*
███████ ██   ██ ██████   ██████  ██████  ████████ ███████ ██████
██       ██ ██  ██   ██ ██    ██ ██   ██    ██    ██      ██   ██
█████     ███   ██████  ██    ██ ██████     ██    █████   ██   ██
██       ██ ██  ██      ██    ██ ██   ██    ██    ██      ██   ██
███████ ██   ██ ██       ██████  ██   ██    ██    ███████ ██████
*/

//Set the age of a user
exports.setAgeCmd = function(msg, client, args){
	if(args.length !== 1){
		utils.errorMessage("Too " + args.length>1?"many":"few" + " arguments provided for profileCmd!");
		msg.reply("correct syntax is: `!setAge <age>`.");
		return;
	}
	var age = args[0];
	//Will complete later
}


//Show the profile of a user
exports.profileCmd = function(msg, client, args){
	var user = msg.author;//currently just show the author's profile
	if(args.length > 1){
		utils.errorMessage(`Too many arguments provided for profileCmd!`);
		msg.reply("correct syntax is: `!profile [<user>]` (`<user>` must be a mention).");
		return;
	}else if(args.length === 1){
		var result = (/<@(\d*)>/.exec(args[0]))[0];
		user = client.users.get(result.substring(2, result.length - 1));
		utils.debugMessage(`@${msg.author.username} wants to see the profile of @${user.username}`);
	}else{
		utils.debugMessage(`@${msg.author.username} wants to see their profile.`);
	}
	getProfile(user.id).then((row) => {//get the profile
		if(row){
			//Making the embed
			var embed = new discord.RichEmbed()
				.setColor(0x00CEFF);
			if(row.username === null)embed.setTitle("User profile for " + user.username);
			else embed.setTitle("User profile for " + row.username);
			if(row.profile_pic === null)embed.setThumbnail(user.avatarURL);
			else embed.setThumbnail(row.profile_pic);
			embed.setDescription(`**Gender :**  ${row.gender}\n**Age :**  ${row.age}\n**Games Played :**  ${row.games}\n**Games Won :**  ${row.wins}`);
			embed.addField("Description", row.desc)
				.addField("Record", row.record);
			//Now send the embed
			msg.channel.send({embed});
		}else{
			msg.reply(`user <@${user.id}> has not been registered in global database yet!`);
		}
	}).catch(err => {
		//Error
		utils.errorMessage(err);
		msg.reply("an error occurred.");
		if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008") || config.developerOptions.showErrorsToUsers == "true")){
          msg.channel.send("The error was: ```" + err + "```")
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

exports.registerIfNew = async function /*registerIfNew*/(user){	
	try{
		var username = await checkGlobal(user.id);
		if(!username){
			await registerNewUser(user);
			utils.successMessage(`Registered new user (@${user.username}) gloabally!`);
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

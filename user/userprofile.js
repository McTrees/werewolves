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

//Register yourself in global database
exports.registerGlobalCmd = async function(msg, client, args){
	var user = msg.author;
	if(args.length === 0){
		utils.debugMessage(`@${user.username} wants to register in global database`);
	}else if(args.length === 1){
		if(msg.member.roles.has(config.role_ids.gameMaster) && /^<@!?(\d+)>$/.test(args[0])){
			user = client.users.get(/^<@!?(\d+)>$/.exec(args[0])[1]);
			utils.debugMessage(`@${msg.author.username} wants to register @{user.username} in global database`);
		}else{
			if(msg.member.roles.has(config.role_ids.gameMaster)){
				utils.warningMessage("A GM used incorrect syntax for registerGlobal - <user> wasn't a mention");// I should be more consistent
				msg.reply("correct syntax is `!registerGlobal [<user>]` (`<user>` must be a mention).");
			}else{
				utils.warningMessage("A user used incorrect syntax for registerGlobal");
				msg.reply("correct syntax is `!registerGlobal`");
			}
			return;
		}
	}else{
		utils.warningMessage("A user used incorrect syntax for registerGlobal");
		msg.reply("correct syntax is `!registerGlobal`");
		return;
	}
	var result = await registerIfNew(user);
	if(result === 1){
		msg.reply(user.id==msg.author.id?`${user} was successfully registered globally.`:"you were successfully registered globally.");
	}else if(result === 0){
		msg.reply(user.id==msg.author.id?`${user} is already registered globally.`:"you are already registered globally.");
	}else{
		msg.reply("an error occurred.");
	}
}

//Set the age of a user
exports.setAgeCmd = function(msg, client, args){
	setProperty(msg, client, "Age", args);
}

//Set the gender of a user
exports.setGenderCmd = function(msg, client, args){
	setProperty(msg, client, "Gender", args);
}

//Set the profile picture link of a user
exports.setDPLinkCmd = function(msg, client, args){
	setProperty(msg, client, "DPLink", args);
}

//Set the username of a user
exports.setUsernameCmd = function(msg, client, args){
	setPropertyWithSpaces(msg, client, "Username", args);
}

//Set the personal description of a user
exports.setInfoCmd = function(msg, client, args){
	setPropertyWithSpaces(msg, client, "Info", args);
}

//Register a user in the global database if they aren't already registered
exports.registerIfNew = async function(user){	
	try{
		//Does the player exist?
		if(!await checkGlobal(user.id)){//If not
			await registerNewUser(user);//then register
			utils.successMessage(`Registered new user (@${user.username}) gloabally!`);
			return 1;//and return 1
		}
		return 0;//else return 0
	}catch(err){
		utils.errorMessage(err);//There was an error
		return -1;//so return -1
	}
}

//Show the profile of a user
exports.profileCmd = function(msg, client, args){
	var user = msg.author;//currently just show the author's profile
	if(args.length > 1){
		utils.errorMessage(`Too many arguments provided for profileCmd!`);
		msg.reply("correct syntax is: `!profile [<user>]` (`<user>` must be a mention).");
		return;
	}else if(args.length === 1){
		utils.debugMessage(args[0]);
		var result = /^<@!?(\d+)>$/.exec(args[0]);
		if(result === null){
			utils.errorMessage(`A mention was not provided as argument to profileCmd`);
			msg.reply("correct syntax is: `!profile [<user>]` (`<user>` must be a mention).");
			return;
		}
		user = client.users.get(result[1]);
		utils.debugMessage(`@${msg.author.username} wants to see the profile of @${user.username}`);
	}else{
		utils.debugMessage(`@${msg.author.username} wants to see their profile.`);
	}
	getProfile(user.id).then((row) => {//get the profile
		if(row){
			//Making the embed
			var embed = new discord.RichEmbed()
				.setColor(0x00CEFF);
			if(row.username === null){
				embed.setTitle("User profile for " + user.username);
			}else{
				embed.setTitle("User profile for " + row.username);
			}
			if(row.dplink === null){
				embed.setThumbnail(user.avatarURL);
			}else{
				embed.setThumbnail(row.dplink);
			}
			embed.setDescription(`**Gender :**  ${row.gender}\n**Age :**  ${row.age}\n**Games Played :**  ${row.games}\n**Games Won :**  ${row.wins}`);
			embed.addField("Description", row.desc)
				.addField("Record", row.record);
			//Now send the embed
			msg.channel.send({embed});
		}else{
			msg.reply(user.id===msg.author.id?"you have":`user ${user} has` + " not been registered in global database yet!");
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
			if(row)resolve(true);//if user was found, resolve as true
			else resolve(false);//if user wasn't found, resolve as false
		});
	});
}

function getProfile(id){
	return new Promise((resolve, reject) => {
		userdb.get("select username, ifnull(gender, 'Unknown') as gender, ifnull(age, 'Unknown') as age, ifnull(personal_record, 'No record yet') as record, ifnull(personal_desc, 'No description yet') as desc, games, wins, dplink from global_player where user_id = ?", id, function(err, row) {
			if(err)reject(err);//If error occurred, reject
			if(row)resolve(row);//if user was found, resolve with the profile
			else resolve();//if user wasn't found, resolve without anything
		});
	});
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

function setPropertyWithSpaces(msg, client, name, args){
	var user = msg.author;
	var data = "If you're seeing this the bot isn't functioning correctly.";
	if(!args || args.length == 0){
		utils.errorMessage(`Too few arguments provided for set${name}Cmd!`);
		if(!msg.member.roles.has(config.role_ids.gameMaster)){
			msg.reply(`correct syntax is: \`!set${name} <${name.toLowerCase()}>\`.`);
		}else{
			msg.reply(`correct syntax is: \`!set${name} [<user>] <${name.toLowerCase()}>\` (\`<user>\` must be a mention).`);
		}
	}else if(args.length === 1){
		data = args[0];
	}else{
		if(msg.member.roles.has(config.role_ids.gameMaster) && /^<@!?(\d+)>$/.test(args[0])){
			//The first argument is a mention and a GM is using the command
			user = client.users.get(/^<@!?(\d+)>$/.exec(args[0])[1]);
			data = args.slice(1).join(" ");//Get everything except the first piece of data
		}else{
			data = args.join(" ");//Join the args to make up the data
		}
	}
	var col_name = name;
	if(name == "Info")col_name = "personal_desc";
	updateDB(msg, name, col_name, data, user);
}

function setProperty(msg, client, name, args){
	var user = msg.author;
	var val;
	if(args.length > 2 || (!msg.member.roles.has(config.role_ids.gameMaster) && args.length === 2)){
		utils.errorMessage("Too many arguments provided for setPropertyCmd!");
		if(!msg.member.roles.has(config.role_ids.gameMaster)){
			msg.reply(`correct syntax is: \`!set${name} <${name.toLowerCase()}>\`.`);
		}else{
			msg.reply(`correct syntax is: \`!set${name} [<user>] <${name.toLowerCase()}>\` (\`<user>\` must be a mention).`);
		}
		return;
	}else if(args.length === 2){
		//We know that the author is a GM as if the author isn't a GM the last if would've executed
		var result = /^<@!?(\d+)>$/.exec(args[0]);
		if(result === null){
			utils.errorMessage(`A mention was not provided as first argument to set${name}Cmd by a GM`);
			msg.reply(`correct syntax is: \`!set${name} [<user>] <${name.toLowerCase()}>\` (\`<user>\` must be a mention).`);
			return;
		}
		user = client.users.get(result[1]);
		val = args[1];
		utils.debugMessage(`GM @${msg.author.username} wants to set the ${name.toLowerCase()} of @${user.username}.`);
	}else if(args.length === 1){
		val = args[0];
		utils.debugMessage(`User @${user.username} wants to set their ${name.toLowerCase()}.`);
	}else{
		utils.errorMessage(`Too few arguments provided for set${name}Cmd!`);
		msg.reply(`correct syntax is: \`!set${name} <${name.toLowerCase()}>\`.`);
		return;
	}
	updateDB(msg, name, name, val, user);
}

function updateDB(msg, name, col_name, val, user){
	userdb.run("update global_player set " + col_name + " = ? where user_id = ?", [val, user.id], function(err) {
		if (err) {
			utils.errorMessage(`There was an error: ${err}`);
			msg.reply(`an error occurred.`);
		}
		if(this.changes === 0){
			checkGlobal(user.id).then(exists => {
				if(exists){
					utils.errorMessage(`Something is clearly wrong - ${checkGlobal(user.id)} returned by checkGlobal`);
					msg.reply("an error occurred");
				}else{
					msg.reply(user.id===msg.author.id?"you have":`user ${user} has` + " not been registered in global database yet!");
				}
			}).catch(err =>{
				utils.errorMessage(`There was another error: ${err}`);
				msg.reply(`an error occurred when processing another error.`);
			});
		}else if(this.changes > 1){
			utils.errorMessage(`Strange error - ${this.changes} rows were updated`);
			msg.reply(`strange error - ${this.changes} people's data was updated. Contact the Devs.`);
		}else if(this.changes === 1){
			utils.successMessage(`${name} of @${user.username} successfully set to "${val}!"`);
			msg.reply(`${name} of ${user} successfully set to \`${val}\`!`);
		}else{
			msg.reply("an error occurred");
		}
	});
}
const utils = require("../utils.js")
const sqlite3 = require("sqlite3")
const userdb = new sqlite3.Database("user/user.db")
const discord = require('discord.js')
const config = require('../config');
const aliases = require('./aliases.json');

/*
███████ ██   ██ ██████   ██████  ██████  ████████ ███████ ██████
██       ██ ██  ██   ██ ██    ██ ██   ██    ██    ██      ██   ██
█████     ███   ██████  ██    ██ ██████     ██    █████   ██   ██
██       ██ ██  ██      ██    ██ ██   ██    ██    ██      ██   ██
███████ ██   ██ ██       ██████  ██   ██    ██    ███████ ██████
*/
exports.commands = {}
//Register yourself in global database
exports.commands.register_global = async function(msg, client, args){
	var user = msg.author;
	if(args.length === 0){
		utils.debugMessage(`@${user.username} wants to register in global database`);
	}else if(args.length === 1){
		if(msg.member.roles.has(config.role_ids.gameMaster) && /^<@!?(\d+)>$/.test(args[0])){
			user = client.users.get(/^<@!?(\d+)>$/.exec(args[0])[1]);
			utils.debugMessage(`@${msg.author.username} wants to register @{user.username} in global database`);
		}else{
			if(msg.member.roles.has(config.role_ids.gameMaster)){
				utils.warningMessage("A GM used incorrect syntax for register_global - <user> wasn't a mention");// I should be more consistent
				msg.reply("correct syntax is `!register_global [<user>]` (`<user>` must be a mention).");
			}else{
				utils.warningMessage("A user used incorrect syntax for register_global");
				msg.reply("correct syntax is `!register_global`");
			}
			return;
		}
	}else{
		utils.warningMessage("A user used incorrect syntax for register_global");
		msg.reply("correct syntax is `!register_global`");
		return;
	}
	var result = await exports.registerIfNew(user);
	if(result === 1){
		msg.reply(user.id==msg.author.id?"you were successfully registered globally.":`${user} was successfully registered globally.`);
	}else if(result === 0){
		msg.reply(user.id==msg.author.id?"you are already registered globally.":`${user} is already registered globally.`);
	}else{
		msg.reply("an error occurred.");
	}
}

//Set the age of a user
exports.commands.set_age = function(msg, client, args){
	setProperty(msg, client, "age", args);
}

//Set the gender of a user
exports.commands.set_gender = function(msg, client, args){
	setProperty(msg, client, "gender", args);
}


//Set the profile picture link of a user
//CURRENTLY NOT IN USE
/*
exports.commands.setDPLink = function(msg, client, args){
	setProperty(msg, client, "DPLink", args);
}
*/


//Set the personal description of a user
exports.commands.set_info = function(msg, client, args){
	setPropertyWithSpaces(msg, client, "info", args);
}

//Set the number of games of a user
exports.commands.set_games = function(msg, client, args){
	setProperty(msg, client, "games", args);
}

//Set the number of wins of a user
exports.commands.set_wins = function(msg, client, args){
	setProperty(msg, client, "wins", args);
}

//Set the personal record of a user
exports.commands.set_record = function(msg, client, args){
	setPropertyWithSpaces(msg, client, "record", args);
}


//Register a user in the global database if they aren't already registered
exports.registerIfNew = async function(user){
	try{
		//Does the player exist?
		if(!(await checkGlobal(user.id))){//If not
			await registerNewUser(user);//then register
			utils.successMessage(`Registered new user (@${user.username}) gloabally!`);
			return 1;//and return 1
		}
		utils.debugMessage(`@${user.username} is already registered globally.`);
		return 0;//else return 0
	}catch(err){
		utils.errorMessage(err);//There was an error
		return -1;//so return -1
	}
}

//Show the profile of a user
exports.commands.profile = function(msg, client, args){
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
			embed.setTitle("User profile for " + user.username);
			//For now we want it to not be changeable
			//if(row.dplink === null){
				embed.setThumbnail(user.avatarURL);
			//}else{
				//embed.setThumbnail(row.dplink);
			//}
			embed.setDescription(`**Gender :**  ${row.gender}\n**Age :**  ${row.age}\n**Games Played :**  ${row.games}\n**Games Won :**  ${row.wins}`);
			embed.addField("Description", row.desc)
				.addField("Record", row.record);
			//Now send the embed
			msg.channel.send({embed});
		}else{
			msg.reply((user.id===msg.author.id?"you have":`user ${user} has`) + " not been registered in global database yet!");
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
		userdb.get("select ifnull(gender, 'Unknown') as gender, ifnull(age, 'Unknown') as age, ifnull(personal_record, 'No record yet') as record, ifnull(personal_desc, 'No description yet') as desc, games, wins from global_player where user_id = ?", id, function(err, row) {
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
		utils.errorMessage(`Too few arguments provided for set_${name}!`);
		if(!msg.member.roles.has(config.role_ids.gameMaster)){
			msg.reply(`correct syntax is: \`!set_${name} <${name}>\`.`);
		}else{
			msg.reply(`correct syntax is: \`!set_${name} [<user>] <${name}>\` (\`<user>\` must be a mention).`);
		}
		return;
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
	if(aliases["dbnames"][name]){
		col_name = aliases["dbnames"][name];//If column name is different from the name in the command
	}
	updateDB(msg, name, col_name, data, user);
}

function setProperty(msg, client, name, args){
	var user = msg.author;
	var val;
	if(args.length > 2 || (!msg.member.roles.has(config.role_ids.gameMaster) && args.length === 2)){
		utils.errorMessage(`Too many arguments provided for set_${name}!`);
		if(!msg.member.roles.has(config.role_ids.gameMaster)){
			msg.reply(`correct syntax is: \`!set_${name} <${name}>\`.`);
		}else{
			msg.reply(`correct syntax is: \`!set_${name} [<user>] <${name}>\` (\`<user>\` must be a mention).`);
		}
		return;
	}else if(args.length === 2){
		//We know that the author is a GM as if the author isn't a GM the last if would've executed
		var result = /^<@!?(\d+)>$/.exec(args[0]);
		if(result === null){
			utils.errorMessage(`A mention was not provided as first argument to set_${name} by a GM`);
			msg.reply(`correct syntax is: \`!set$_{name} [<user>] <${name}>\` (\`<user>\` must be a mention).`);
			return;
		}
		user = client.users.get(result[1]);
		val = args[1];
		utils.debugMessage(`GM @${msg.author.username} wants to set the ${name} of @${user.username}.`);
	}else if(args.length === 1){
		val = args[0];
		utils.debugMessage(`User @${user.username} wants to set their ${name}.`);
	}else{
		utils.errorMessage(`Too few arguments provided for set_${name}!`);
		msg.reply(`correct syntax is: \`!set_${name} <${name}>\`.`);
		return;
	}
	if(aliases["dbnames"][name]){
		col_name = aliases["dbnames"][name];//If column name is different from the name in the command
	}
	updateDB(msg, name, name, val, user);
}

function updateDB(msg, name, col_name, val, user){
	if(aliases[(name + "Options")]){
		if(aliases[(name + "Options")][val.toLowerCase()]){
			val = aliases[(name + "Options")][val.toLowerCase()];
		}else{
			msg.reply(`\`${val}\` is not a valid option for \`!set_${name}\``);
			return;
		}
	}
	if(aliases[(name + "CharacterLimit")] && val.length > aliases[(name + "CharacterLimit")]){
		msg.reply(`\`${val}\` has too many characters for \`!set_${name}\` (limit is ${aliases[(name + "CharacterLimit")]})`);
		return;
	}
	userdb.run("update global_player set " + col_name + " = ? where user_id = ?", [val, user.id], function(err) {
		if (err) {
			utils.errorMessage(`There was an error: ${err}`);
			msg.reply(`an error occurred.`);
		}
		if(this.changes === 0){
			checkGlobal(user.id).then(exists => {
				if(exists){
					utils.errorMessage(`Something is clearly wrong -  the user's profile wasn't updated even though they are registered.`);
					msg.reply("an error occurred");
				}else{
					msg.reply((user.id===msg.author.id?"you have":`user ${user} has`) + " not been registered in global database yet!");
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
			msg.reply((msg.author.id==user.id?`your ${name.toLowerCase()}`:`${name.toLowerCase()} of ${user}`)+ ` successfully set to \`${val}\`!`);
		}else{
			msg.reply("an error occurred");
		}
	});
}

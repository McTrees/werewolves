//IMPORTANT NOTE - MAJOR OVERHAUL PROBABLY COMING UP SOON
//Eh, I've forgotten what changes are necessary.

const config = require("../config");
const aliases = require("./polls_aliases");
const utils = require("../utils");
const players = require("../user/user");
const internal = require("./internal");
//The above is self-explanatory, I think

exports.commands = {};//because JS

exports.init = internal.init;//Initialize

exports.commands.start_poll = function (msg, client, args){
	utils.debugMessage(`@${msg.author.username} tried to create a poll.`);
	if(args.length <= 1){
		utils.errorMessage(`Insufficient arguments provided for start_pollCmd!`);
		msg.reply("correct syntax: `!start_poll <type (werewolves/lynch/cult/other)> <heading>`");
		return;
	}
	var type = args[0].toLowerCase(); //The type of poll - so far "lynch" (alias 'l'), "werewolves" (alias 'w'), "cult" (alias 'c')
	var txt = args.slice(1).join(" "); //The text thats displayed at the top of the polls
	if (aliases[type]) {
		type = aliases[type]; //Convert full name to the alias
	}
	var id; //Poll ID
	var ch;
	switch (type) {
	case ("l"):
		//The daily lynch
		ch = config.channel_ids.voting_booth;
		utils.debugMessage("A lynch poll.");
		break;
	case ("w"):
		//The werewolves choose whom to kill
		ch = config.channel_ids.werewolves;
		utils.debugMessage("A werewolves poll.");
		break;
	case ("c"):
		//The cultists choose whom to kill
		ch = config.channel_ids.cult;
		utils.debugMessage("A cult poll.");
		break;
	case ("o"):
		//Any other public polls - namely the mayor, reporter and guardian polls
		ch = config.channel_ids.voting_booth;
		utils.debugMessage("A general poll.");
		break;
	default:
		msg.reply("I'm sorry, but `" + type + "` is not a valid poll type (Types are -\nl - The Daily Lynch\nw - The Werewolves poll\nc - The Cult poll\no- Other polls");
		return;
	}
	var data = {
		msg_text: txt,
		channel_id: ch,
		type: type,
		options: [/*{
			id: "329977469350445069",
			emoji: "😃"
		}, {
			id: "402072907284480000",
			emoji: "😕"
		}, {
			id: "409771209639854081",
			emoji: "💀"
		},{
			id: "334600339208798218",
			emoji: "🍆"
		}*/]
	};
	players.all_alive().then((rows) =>{
		
		if(!rows || rows.length === 0)throw new Error("The database returned nothing! The game has probably not started!");
		rows.forEach((row) => {
			utils.debugMessage("Row: " + row);
			options.push({
				id: row.user_id,
				emoji: row.emoji
			});
		});
		
		id = internal.startPoll(client, data);
		//Send message informing GMs of new poll
		if(id != -1)client.channels.get(config.channel_ids.gm_confirm).send("A new Poll, `" + txt + "` (id: " + id + ") was created.");
	}).catch(err => {
		utils.errorMessage(err);
		msg.reply("an error occurred.");
		if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008") || config.developerOptions.showErrorsToUsers == "true")){
          msg.channel.send("The error was: ```" + err + "```")
        }
	});
}

/**
Function - setvotevalue
Function to set vote value of a particular player in the daily lynch
For now use this
Final bot will have better system
Arguments:
msg - The message that triggered the function
client - The Discord Client that the bot uses
id - The ID of the poll to check
 */
exports.commands.setvotevalue = async function (msg, client, args) {
	var data = await resolve(msg, client, args);
	if(data === -2){
		utils.errorMessage(`Incorrect syntax used for addvotes.`);
		msg.reply("correct syntax is: `!setvotevalue <user> <val>` (`<user>` must either be a mention or the emoji of the player), `<val>` must be an integer.");
		return;
	}else if(data == -1){
		msg.reply("error occurred, please chech console.");
		return;
	}
	var user = data.user;
	var val = data.val;
	var result = internal.setVoteValue(user.id, "l", val);
	
	//See below, this is what happens when you try to code while feeling very sleepy
	if(result === 1){
		msg.reply(`${user}'s vote's value successfully set to ${val}`);
	}else{
		switch(result){//SEE!! I was acting incredibly stupid
			case (-4):
				msg.reply(`error occurred, check console.`);
				break;
			case (-3):
				msg.reply(`${user}'s vote already has a different value!.`);
				break;
			case (-1):
				utils.errorMessage(`No lynch poll underway!!`);
				msg.reply(`no lynch poll is going on.`);
				msg.reply(`Since you're a GM you should first open the lynch poll and then try to add votes to the player.\nThough this is not what should appen, I do not have the time now to set it. Will be set before the main game is started, managed with this for the tests.\nSorry for the inconvenience.`);
				break;
		}
	}
}


/**
Function - threaten
Function to threaten to a particular player in the daily lynch
For now use this
Final bot will have better system
Arguments:
msg - The message that triggered the function
client - The Discord Client that the bot uses
args - args
 */
exports.commands.threaten = async function (msg, client, args) {
	args.push("2");
	if((await exports.commands.addvotes(msg, client, args, true)) == -2){
		msg.reply("correct syntax is: `!threaten <user>` (`<user>` must either be a mention or the emoji of the player).");
	}
}

/**
Function - guard
Function to guard to a particular player in the daily lynch
For now use this
Final bot will have better system
Arguments:
msg - The message that triggered the function
client - The Discord Client that the bot uses
args - args
 */
exports.commands.guard = async function (msg, client, args) {
	args.push("-10000");
	if((await exports.commands.addvotes(msg, client, args, true)) == -2){
		msg.reply("correct syntax is: `!guard <user>` (`<user>` must either be a mention or the emoji of the player).");
	}
}

//Add extra votes for a player
exports.commands.addvotes = async function(msg, client, args, internally){
	var data = await resolve(msg, client, args);
	if(data === -2){
		utils.errorMessage(`Incorrect syntax used for addvotes.`);
		if(internally)return -2;
		msg.reply("correct syntax is: `!addvotes <user> <val>` (`<user>` must either be a mention or the emoji of the player), `<val>` must be an integer.");
		return;
	}else if(data == -1){
		msg.reply("error occurred, please chech console.");
		return;
	}
	var user = data.user;
	var val = data.val;
	var result = internal.extraVotes(user.id, "l", val);
	
	//See below, this is what happens when you try to code while feeling very sleepy
	if(result === 1){
		msg.reply(`${user} has successfully been given ${val} extra votes`);
	}else if(result === 0){
		msg.reply(`${user} already had extra votes, but still added ${val} more votes to them.`);//English isn't proper
	}else{
		switch(result){//SEE!! I was acting incredibly stupid
			case (-4):
				msg.reply(`error occurred.`);
				break;
			case (-1):
				utils.errorMessage(`No lynch poll underway!!`);
				msg.reply(`no lynch poll is going on.`);
				msg.reply(`Since you're a GM you should first open the lynch poll and then try to add votes to the player.\nThough this is not what should appen, I do not have the time now to set it. Will be set before the main game is started, managed with this for the tests.\nSorry for the inconvenience.`);
				break;
		}
	}
}

/**
Function - check_pollCmd
Checks if all the emojis have been added to the poll
Arguments:
msg - The message that triggered the function
client - The Discord Client that the bot uses
id - The ID of the poll to check
 */
exports.commands.check_poll = function (msg, client, id) {
	if(id.length !== 1){
		msg.reply(`correct syntax is \`!check_poll <pollID>\``);
		utils.infoMessage(`@${msg.author.username} used wrong syntax for !check_poll`);
		return;
	}
	utils.debugMessage(`@${msg.author.username} tried to check if emojis were properly added to Poll ${id}`);
	var r = internal.fetchMessages(msg, client, id);
	if(!r)return;
	var poll = r.poll;
	var ch = r.ch;
	r.p.then(msgs => {
		for (var i = 0; i < poll["messages"].length; i++) {
			for (var j = 0; j < poll["messages"][i]["options"].length; j++) {
				//Check if the message has all required emojis, add the missing ones.
				var r = msgs[i].reactions.find(val => val.emoji.name === poll["messages"][i]["options"][j]["emoji"]);
				if (!r || !r.me) {
					msgs[i].react(poll["messages"][i]["options"][j]["emoji"]).catch (function (err) {
						utils.errorMessage(err);
						utils.errorMessage("There was an error when trying to react to the messages. Again. No idea why. Perhaps I should just give up now.");
						ch.send("It still didn't work :(");
					});
				}
			}
		}
		utils.successMessage(`Poll ${id} checked for missing emojis!`);
	}).catch (function (err) {
		utils.errorMessage(err);
		utils.errorMessage("There was an error when trying to fetch the messages.");
		ch.send("An error occurred.");
	});
}

/**
Function - end_pollCmd
Ends a poll
Arguments:
msg - The message that triggered the function
client - The Discord Client that the bot uses
id - The ID of the poll to end
 */
exports.commands.end_poll = function (msg, client, id) {
	if(id.length !== 1){
		msg.reply(`correct syntax is \`!end_poll <pollID>\``);
		utils.infoMessage(`@${msg.author.username} used wrong syntax for !end_poll`);
		return;
	}
	utils.debugMessage(`@${msg.author.username} tried to end Poll ${id}.`);
	var r = internal.fetchMessages(msg, client, id);
	if(!r)return;
	var poll = r.poll;
	var ch = r.ch;
	r.p.then(msgs => {
		//Get the message reactions
		var promises = new Array(poll["options"].length);
		var s = 0;
		utils.debugMessage("Got messages, get reactions");
		for (var i = 0; i < poll.messages.length; i++) {
			for (var j = 0; j < poll.messages[i].options.length; j++) {
				var r = msgs[i].reactions.find(val => val.emoji.name === poll.options[poll.messages[i].options[j]].emoji);
				promises[s] = r.fetchUsers();
				s++;
			}
		}
		return Promise.all(promises).then((vals) => {
			return {
				msgs: msgs,
				values: vals
			};
		});
	}).then((dat) => {
		var results = internal.calculateResults(poll, id, dat.values, client);
		ch.send(results.txt);
		var gms = client.channels.get(config.channel_ids.gm_confirm);
		gms.send(results.log_txt);
		if(results.cmd)gms.send(results.cmd);
		//internal.cleanUp(dat.msgs, id);
		return "Success";
	}).catch (err => {
		utils.errorMessage(err);
		utils.errorMessage(err.stack);
		ch.send("Error occurred.");
	});
}
/*
██ ███    ██ ████████ ███████ ██████  ███    ██  █████  ██
██ ████   ██    ██    ██      ██   ██ ████   ██ ██   ██ ██
██ ██ ██  ██    ██    █████   ██████  ██ ██  ██ ███████ ██
██ ██  ██ ██    ██    ██      ██   ██ ██  ██ ██ ██   ██ ██
██ ██   ████    ██    ███████ ██   ██ ██   ████ ██   ██ ███████
*/
/**
Resolve a message into a user and a value
!command <@mention> <val>
gives back 
{
	user: user,
	val: val
}
val must be an integer
Error codes:
	-1 - Unknown error, check console
	-2 - Syntax error - command was used improperly
	
*/
async function resolve(msg, client, args){
	if(args.length === 2){
		if(!/^-?\d+$/.test(args[1])){
			utils.debugMessage("Not an integer (in polls.resolve) - " + value);
			return -2;
		}
		var value = new Number(args[1]);
		var id;
		try{
			id = await players.resolve_to_id(args[0])
		}catch(err){
			if(err){
				utils.errorMessage(err);
				return -1;
			}
			utils.debugMessage("Not a mention/player emoji (in polls.resolve)");
			return -2;
		}
		var discord_user = client.users.get(id);
		utils.debugMessage(`Resolved to user - @${discord_user.username} and value - ${value}`);
		return{
			user: discord_user,
			val: value
		}
	}else{
		return -2;
	}
}

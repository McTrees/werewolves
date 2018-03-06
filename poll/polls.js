//IMPORTANT NOTE - MAJOR OVERHAUL PROBABLY COMING UP SOON
//Eh, I've forgotten what changes are necessary.

const config = require("../config");
const aliases = require("./polls_aliases");
const utils = require("../utils");
const players = require("../user/user");
const internal = require("./internal");
//The above is self-explanatory, I think

exports.commands.start_poll = function (msg, client, args){
	utils.debugMessage(`@${msg.author.username} tried to create a poll.`);
	if(args.length <= 1){
		utils.errorMessage(`Insufficient arguments provided for start_pollCmd!`);
		msg.reply("correct syntax: `!start_poll <type(werewolves/lynch/cult)> <heading>`");
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
		options: [{
			txt: "<@329977469350445069>",
			emoji: "😃"
		}, {
			txt: "<@402072907284480000>",
			emoji: "😕"
		}, {
			txt: "ABCDEFGH",
			emoji: "💀"
		}]
	};
	players.all_alive().then((rows) =>{
		/*
		if(!rows || rows.length === 0)throw new Error("The database returned nothing! The game has probably not started!");
		rows.forEach((row) => {
			utils.debugMessage("Row: " + row);
			options.push({
				txt: `<@${row.user_id}>`,
				emoji: row.emoji
			});
		});
		*/
		id = internal.startPoll(client, data);
		//Send message informing GMs of new poll
		client.channels.get(config.channel_ids.gm_confirm).send("A new Poll, `" + txt + "` (id: " + id + ") was created.");
	}).catch(err => {
		utils.errorMessage(err);
		msg.reply("an error occurred.");
		if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008") || config.developerOptions.showErrorsToUsers == "true")){
          msg.channel.send("The error was: ```" + err + "```")
        }
	});
}

/**
Function - threatenCmd
Function for the Raven to threaten a player
Arguments:
msg - The message that triggered the function
client - The Discord Client that the bot uses
id - The ID of the poll to check
 */
exports.commands.threaten = async function (msg, client, args) {
	var user;
	if(args.length === 1){
		var id = "";
		try{
			id = await players.resolve_to_id(args[0])
		}catch(err){
			if(err){
				utils.errorMessage(err);
				msg.reply("an error occurred.");
				return;
			}
			utils.errorMessage(`Incorrect syntax for threatenCmd`);
			msg.reply("correct syntax is: `!profile <user>` (`<user>` must either be a mention or the emoji of the player).");
			return;
		}
		user = client.users.get(id);
		utils.debugMessage(`Trying to threaten @${user.username}`);
	}else{
		utils.errorMessage(`Incorrect syntax used for threatenCmd.`);
		msg.reply("correct syntax is: `!profile <user>` (`<user>` must either be a mention or the emoji of the player).");
		return;
	}
	var val = internal.threaten(user.id);
	if(val === 1){
		utils.successMessage(`Successfully threatened @${user.username}!`);
		msg.reply(`${user} has successfully been threatened`);
	}else if(val === 0){
		utils.warningMessage(`@${user.username} has already been threatened!`);
		msg.reply(`${user} has already been threatened`);
	}else{
		utils.errorMessage(`Could not threaten @${user.username}!`);
		msg.reply(`${user} could not be threatened`);
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
		for (var i = 0; i < poll["messages"].length; i++) {
			for (var j = 0; j < poll["messages"][i]["options"].length; j++) {
				var r = msgs[i].reactions.find(val => val.emoji.name === poll["messages"][i]["options"][j]["emoji"]);
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
		var results = internal.calculateResults(poll, dat.values, client);
		ch.send(results.txt);
		internal.cleanUp(dat.msgs, id);
		return "Success";
	}).catch (err => {
		utils.errorMessage(err);
		ch.send("Error occurred.");
	});
}


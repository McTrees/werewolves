//IMPORTANT NOTE - MAJOR OVERHAUL PROBABLY COMING UP SOON

const fs = require("fs");
const config = require("../config");
const polls = require("./polls.json");
const utils = require("../utils");
//The above is self-explanatory, I think

/*
███████ ██   ██ ██████   ██████  ██████  ████████ ███████ ██████
██       ██ ██  ██   ██ ██    ██ ██   ██    ██    ██      ██   ██
█████     ███   ██████  ██    ██ ██████     ██    █████   ██   ██
██       ██ ██  ██      ██    ██ ██   ██    ██    ██      ██   ██
███████ ██   ██ ██       ██████  ██   ██    ██    ███████ ██████
*/
/**
Function startPoll
Start a poll.
Arguments:
client - The Discord Client the bot uses
data - An object containing three properties - msg_text, channel_id, options:
	msg_text - A String, the text that is displayed at the start of the poll.
	channel_id - The ID of the channel in which to have the poll
	options - An array, the list of choices in the poll, along with thier emojis. Each element has two properties - id, emoji:
		id - The player id corresponding to the option
		emoji - The emoji corresponding to the option (It's just a character BTW, just like all basic emojis in discord)

Example for data:{
	msg_text: "Vote for your favourite!",
	channel_id: "4034578342784532XX",
	options: [{
			id: "32997746935044XXXX",
			emoji: "😃"
		}, {
			id: "40207290728448XXXX",
			emoji: "😕"
		}, {
			id: "13457982471294XXXX",
			emoji: "💀"
		}
	]
}
As in example, the "txt" field of the options can be a mention or just some plain text
 */
exports.startPoll = function(client, data) {
	utils.debugMessage(`Function startPoll was called.`);

	var options = data.options;
	var msg_text = data.msg_text;

	var ch = client.channels.get(data.channel_id);

	var nm = (options.length - ((options.length - 1) % 20 + 1)) / 20 + 1; //Number of messages the bot must send
	var txt = new Array(nm); //The text of the messages themselves
	for (var i = 0; i < nm; i++) {
		txt[i] = "";
		if (i === 0)
			txt[0] = msg_text + "-\n";
		for (var j = 0; j < 20; j++) {
		txt[i] += `${options[i * 20 + j].emoji}  -  <@${options[i * 20 + j].id}>`;
			if (i * 20 + j >= options.length - 1)
				break;
			txt[i] += "\n";
		}
	}

	//This will send the messages, and get the Promises of the messages
	var promises = new Array(nm);
	for (i = 0; i < nm; i++) {
		promises[i] = ch.send(txt[i]);
	}
	//Combine all the promises
	Promise.all(promises).then(async function(values){
		//This whole code just adds the emojis
		var msgs = new Array(values.length);
		for (var i = 0; i < values.length; i++) {
			msgs[i] = {
				id: values[i].id,
				options: "If you're seeing this, then the bot isn't working correctly."
			};
			var opts = new Array(0);
			for (var j = 0; j < 20; j++) {
				if (i * 20 + j >= options.length)
					break;
				//make sure to add next emoji only after this one is added
				await values[i].react(options[i * 20 + j].emoji).catch (err => {
					utils.errorMessage(err);
					utils.errorMessage("The bot failed to add an emoji to the message. If you know how I can set this right, please tell me.");
					utils.infoMessage("For now, use !check_poll <id> to set the poll right.");
					ch.send("The bot failed to add an emoji to the message. To set it right, use !check_poll <id>");
				});
				opts.push(i * 20 + j);//adds the ids of all the options
			}
			msgs[i]["options"] = opts;
		}
		utils.debugMessage("Added emojis.");
		//Now save the poll so that a restart of the bot doesn't delete all the data
		var num = ++polls["num"];
		polls["polls"][num] = {
			channel: ch.id,
			type: data.type,
			messages: msgs,
			options: options
		};
		//if the bot crashes at this point for some reason, you might as well abandon the newly created poll
		utils.debugMessage("Saving polls....");
		fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
			if (err) {
				utils.errorMessage(err);
				client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when saving file. This could cause problems - the new poll might be useless.");
			} else {
				utils.successMessage("The poll was created successfully!");
			}
		});
	}).catch (function (err) {
		utils.errorMessage(err);
		utils.errorMessage("There was an error when trying to make the poll.");
		ch.send("The bot failed to make the poll. Perhaps you should contact the Developers of the bot.");
	});
	return polls["num"] + 1; //Return the ID of the poll
}

exports.fetchMessages = function(msg, client, id){
	if (!polls["polls"][id]) {
		utils.errorMessage("The poll with id " + id + " doesn't exist, sadly.");
		msg.reply(`the poll with ID \`${id}\` doesn't exist, or it's results have been checked already.`);
		return false;
	}
	//Fetch the poll and its details
	var poll = polls["polls"][id];
	var ch = client.channels.get(poll["channel"]);
	//Get the messages
	var promises = new Array(poll["messages"].length);
	for (var i = 0; i < promises.length; i++) {
		promises[i] = ch.fetchMessage(poll["messages"][i].id);
	}
	//Work on the messages, and then return a promise of the results
	return {
		p:Promise.all(promises),
		poll: poll,
		ch: ch
	};
}

//at this point I had forgotten what changes I had made
//so forgive me if something here doesn't quite work as expected
exports.calculateResults = function(poll, values, client) {
	//The text message the bot will send
	var txt = "Results of the polls:\n";
	//The object the function will return
	var results = {
		options: poll["options"]
	};
	
	var disqualified = findDisqualified(values, client);
	
	var ranked;
	var mayor_id = "000";
	if(poll.mayor){
		var mayor = getMayorRole(client);
		if(mayor.members.size > 0)mayor_id = mayor.members.first().id;
		if(!poll.raven){
			ranked = rankResults(results, values, mayor_id, false);
		}else{
			ranked = rankResults(results, values, mayor_id, polls.threatened);
		}
	}else{
		ranked = rankResults(results, values, false, false);
	}
	
	results.txt = txt;
	//Return the data
	return results;
}

exports.setVoteValue(user_id, val){
	if(!polls.values){
		polls.values = {
			user_id: val
		};
	}else{
		polls.values[user_id] = val;
	}
}

exports.cleanUp = function(msgs, id) {
	//Delete the messages
	for (var i = 0; i < msgs.length; i++) {
		msgs[i].delete ();
	}
	var fs_error = false;
	//Delete the poll from storage
	delete polls["polls"][id];
	polls.extraVotes = {};
	fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
		if (err) {
			utils.errorMessage(err);
			fs_error = true;
			client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when trying to edit the polls.json file.");
		}
	});
	if (!fs_error)
		utils.successMessage("Successfully ended poll!");
}

exports.extraVotes = function(id, extra){
	var found = false;
	for(var user_id in polls.extraVotes){
		if(user_id == id){
			polls.extraVotes[id] += extra;
			found = true;
			break;
		}
	}
	if(!found){
		polls.extraVotes[id] = extra;
	}
	fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
		if (err) {
			utils.errorMessage(err);
			client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when trying to edit the polls.json file.");
			return -1;
		}
	});
	return 1;
}

/*
██ ███    ██ ████████ ███████ ██████  ███    ██  █████  ██
██ ████   ██    ██    ██      ██   ██ ████   ██ ██   ██ ██
██ ██ ██  ██    ██    █████   ██████  ██ ██  ██ ███████ ██
██ ██  ██ ██    ██    ██      ██   ██ ██  ██ ██ ██   ██ ██
██ ██   ████    ██    ███████ ██   ██ ██   ████ ██   ██ ███████
*/


function rankResults(results, values, poll){
	//Rank the results of the poll (descending order)
	var ranked = new Array(0);
	for (var i = 0; i < values.length; i++) {
		//I really hope I know what I'm doing here
		var n = 0;
		if(poll.extraVotes || poll.voteValues){
			var keys = values[i].keyArray();
			for(var j = 0; j < keys.length; j++){
				if(poll.voteValues[values[i].get(keys[j])]){
					n += poll.voteValues[values[i].get(keys[j])];
				}else{
					n += 1;
				}
			}
			if(polls.extraVotes[results.options[i].id]){
				n += polls.extraVotes[results.options[i].id];
			}
		}else{
			n = values[i].size;
		}
		results.options[i].votes = n; //Also add the vote tally to the results object
		if(n <= 0)continue;
		ranked.push({
			id: i,
			num: n
		});
		
	}
	ranked.sort(function (a, b) {
		return b.num - a.num;
	});
	return ranked;
}

function findNonParticipants(values, disqualified, client){
	//Remove all non-participants
	var non_participants = new Array(0);
	var participants = client.guilds.get(config.guild_id).roles.get(config.role_ids.participant).members;
	for (var i = 0; i < values.length; i++) {
		var users = Array.from(values[i]);
		users.forEach(function(user){
			if(!participants.has(user[0])){
				non_participants.push(user[0]);
				values[i].delete(user[0]);//I hope this works
			}
		});
	}
	//Even check among the disqualified persons
	for(var i = 0; i < disqualified.length; i++){
		if(!participants.has(disqualified[i])){
			non_participants.push(disqualified[i]);
			disqualified.splice(i, 1);
		}
	}
	//return a list of them
	return non_participants;
}

function findDisqualified(values, client){
	//Disqualified persons
	var disqualified = new Array(0);
	var voted = new Array(0); //Who as voted?
	for (var i = 0; i < values.length; i++) {
		//Check if person has voted twice -> disqualify them
		var users = Array.from(values[i]);
		users.forEach(function (item) {
			if (item[1].id !== client.user.id) {
				if (voted.find(element => {
						return element == item[1].id;
					})) {
					if (!disqualified.find(element => {
							return element == item[1].id;
						})) {
						disqualified.push(item[1].id);
					}
				} else {
					voted.push(item[1].id);
				}
			} else {
				values[i].delete (item[0]); //Forget the reactions the bot itself sent
			}
		});
	}
	//Delete the votes of the disqualified
	for (var i = 0; i < values.length; i++) {
		var users = Array.from(values[i]);
		users.forEach(function (item) {
			if (disqualified.find(element => {
					return element == item[1].id;
				}))
				values[i].delete (item[0]);
		});
	}
	return disqualified;
}

function buildMessage(ranked, values, poll, disqualified, log){
	//Build the message to be sent
	var txt = "Results of the polls (ID:" + id + ") :\n\n";
	var winner = false;//I suppose I should use null or undefined, but does it matter?
	var cmd = false;
	if(ranked.length >= 2 && ranked[0].num == ranked[1].num){
		txt += log?"It's a tie!\n":"No result.\n";
	}else if(ranked.length == 0){
		txt += "No result.\n";
	}else{
		winner = poll.options[ranked[0].id].id;
		txt += `<@${winner}> won!\n`;
	}
	if(log){
		for (var k = 0; k < ranked.length; k++) {
			var i = ranked[k].id;
			var users = Array.from(values[i]);
			txt += ("\n" + (ranked[k].num + " votes for " + poll["options"][i]["id"] + " (" + poll["options"][i]["emoji"] + "). Players who voted for " + poll["options"][i]["id"] + " :\n"));
			for (var j = 0; j < users.length; j++) {
				txt += ("\t<@" + users[j][1].id + ">");
				if(poll.voteValues[users[j][1].id]){
					txt += ` (worth ${poll.voteValues[users[j][1].id]} ordinary votes)`;
				}
			}
			txt += '\n';
		}
	}else{
		for(var i = 0; i < values.length; i++){
			var users = Array.from(values[i]);//TODO this needs to be changed
			if(users.length == 0)continue;
			txt += `\n People who voted for ${poll.options[i].txt} (${poll.options[i].emoji}) :\n"`;
			for (var j = 0; j < users.length; j++) {
				txt += ("\t<@" + users[j][1].id + ">\n");
			}
		}
	}
	if(log){
		if(poll.extraVotes){
			txt += "Modifiers:\n";
			var found = false;
			for(var i = 0;  i < poll.extraVotes.length; i++){
				var e = extraVotes[i];//convinience
				//-9000 is arbritrary really, just needs to be low enough,
				//but slightly more than the negative votes used for a person who cannot be voted for
				if(e.extra < -9000){ 
					found = true;//I'm a bit sleepy, so my code isn't exactly that sensible
					txt += `\t<@${e.id}> is immune in this poll!\n`;
				}else if(e.extra < 0){
					found = true;
					txt += `\t<@${e.id}> gets ${-e.extra} fewer votes!\n`;
				}else if(e.extra > 0){
					//if it is 0, ignore
					found = true;
					txt += `\t<@${e.id}> gets ${e.extra} extra votes!\n`;
				}
				
			}
			if(!found){
				txt += "\tNothing actually, sorry to get you excited!\n";
			}
		}
	}
	//And make sure to mention who was disqualified
	if (disqualified.length !== 0) {
		txt += "\n";
		if (disqualified.length === 1) {
			txt += "<@" + disqualified[0] + "> was disqualified as they cast multiple votes.";
		} else {
			disqualified.forEach(function (item, index) {
				txt += "<@" + item + ">";
				if (index === disqualified.length - 2)
					txt += " and ";
				else if (index !== disqualified.length - 1)
					txt += ", "
			});
			txt += " were disqualified as they cast multiple votes.";
		}
	}
	if(log && winner){
		switch(poll.type){
			case ("l"):
				txt += "\nType the following to kill the person who the people voted for (takes care of role specific stuff):\n";
				cmd = "`!lynch_kill <@" + winner + ">`";
				break;
			case ("w"):
				txt += "\nType the following to kill the person who the werewolves voted for (takes care of role specific stuff):\n";
				cmd = "`!ww_kill <@" + winner + ">`";
				break;
			case ("c"):
				txt += "\nType the following to kill the person who the cult voted for (takes care of role specific stuff):\n";
				cmd = "`!cult_kill <@" + winner + ">`";
				break;
			case ("o"):
				txt += "\nTake whatever action you must take, this is some other type of poll.\n";
				break;
			default:
				throw `You managed to make a poll of invalid type (${poll.type}), this is a major error!`;
		}
	}
	return {
		txt: txt,
		cmd: cmd
	}
}

function getMayor(client){
	var members = client.guilds.get(config.guild_id).roles.get(config.role_ids.mayor).members;
	if(members.size > 0){
		return members.first().id;
	}else{
		return "0000000000";//because no one can have _that_ as their ID, and I don't care about 'efficiency' when using JS
	}
}

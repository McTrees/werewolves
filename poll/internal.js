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
	options - An array, the list of choices in the poll, along with thier emojis. Each element has two properties - txt, emoji:
		txt - The text corresponding to the option
		emoji - The emoji corresponding to the option (It's just a character BTW, just like all emojis in discord)

Example for data:{
	msg_text: "Vote for your favourite!",
	channel_id: "4034578342784532XX",
	options: [{
			txt: "<@329977469350445069>",
			emoji: "😃"
		}, {
			txt: "<@402072907284480000>",
			emoji: "😕"
		}, {
			txt: "A",
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
			txt[i] += options[i * 20 + j].emoji + " - " + options[i * 20 + j].txt;
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
	Promise.all(promises).then(values => {
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
				values[i].react(options[i * 20 + j].emoji).catch (err => {
					utils.errorMessage(err);
					utils.errorMessage("The bot failed to add an emoji to the message. If you know how I can set this right, please tell me.");
					utils.infoMessage("For now, use !checkPoll <id> to set the poll right.");
					ch.send("The bot failed to add an emoji to the message. To set it right, use !checkPoll <id>");
				});
				opts.push(options[i * 20 + j]);
			}
			msgs[i]["options"] = opts;
		}
		utils.debugMessage("Added emojis.");
		//Now save the poll so that a restart of the bot doesn't delete all the data
		var num = ++polls["num"];
		//Here I'm saving some stuff twice. It makes my work easier, but it's not storage efficient.
		//Though again, an extra kilobyte or two isn't much
		polls["polls"][num] = {
			channel: ch.id,
			messages: msgs,
			options: options
		};
		utils.debugMessage("Saving....");
		fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
			if (err) {
				utils.errorMessage(err);
				client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when saving file.");
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


exports.calculateResults = function(poll, values, client) {
	//The text message the bot will send
	var txt = "Results of the polls:\n";
	//The object the function will return
	var results = {
		options: poll["options"]
	};
	
	var disqualified = findDisqualified(values, client);

	var ranked = rankResults(results, values);
	//Build the message to be sent
	for (var k = 0; k < ranked.length; k++) {
		var i = ranked[k].id;
		var users = Array.from(values[i]);
		txt += "\n" + (users.length + " voted for " + poll["options"][i]["txt"] + " (" + poll["options"][i]["emoji"] + "):\n");
		for (var j = 0; j < users.length; j++) {
			txt += ("\t<@" + users[j][1].id + ">\n");
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
	results.txt = txt;
	//Return the data
	return results;
}

exports.cleanUp = function(msgs, id) {
	//Delete the messages
	for (var i = 0; i < msgs.length; i++) {
		msgs[i].delete ();
	}
	var fs_error = false;
	//Delete the poll from storage
	delete polls["polls"][id];
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

/*
██ ███    ██ ████████ ███████ ██████  ███    ██  █████  ██
██ ████   ██    ██    ██      ██   ██ ████   ██ ██   ██ ██
██ ██ ██  ██    ██    █████   ██████  ██ ██  ██ ███████ ██
██ ██  ██ ██    ██    ██      ██   ██ ██  ██ ██ ██   ██ ██
██ ██   ████    ██    ███████ ██   ██ ██   ████ ██   ██ ███████
*/


function rankResults(results, values){
	//Rank the results of the poll (descending order)
	var ranked = new Array(0);
	for (var i = 0; i < values.length; i++) {
		results.options[i].votes = values[i].size; //Also add the vote tally to the results object
		if (values[i].size === 0)
			continue;
		ranked.push({
			id: i,
			num: values[i].size
		});
	}
	ranked.sort(function (a, b) {
		return b.num - a.num;
	});
	return ranked;
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

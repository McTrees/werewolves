//IMPORTANT NOTE - MAJOR OVERHAUL PROBABLY COMING UP SOON
const fs = require("fs");
const utils = require("../utils");
const config = require("../config");
var polls;//So that I can load it later
//The above is self-explanatory, I think

/*
███████ ██   ██ ██████   ██████  ██████  ████████ ███████ ██████
██       ██ ██  ██   ██ ██    ██ ██   ██    ██    ██      ██   ██
█████     ███   ██████  ██    ██ ██████     ██    █████   ██   ██
██       ██ ██  ██      ██    ██ ██   ██    ██    ██      ██   ██
███████ ██   ██ ██       ██████  ██   ██    ██    ███████ ██████
*/
/**
Function init
Initialize the polls data
Arguments:
	reset_data - Forcse reset all polls data
*/
exports.init = function(reset_data){
	if(reset_data){
		utils.warningMessage("Resetting polls (because you asked for it).");
		fs.writeFileSync("./poll/polls.json", '{\n\t"num":0,\n\t"polls":{}\n}');
		utils.warningMessage("Reset polls.");
	}else{
		//create polls.json file if it doesn't exist
		//and inform the user
		if(!fs.existsSync("./poll/polls.json")){
			utils.warningMessage("Record of polls not found. Creating new record (poll/polls.json).");
			fs.writeFileSync("./poll/polls.json", '{\n\t"num":0,\n\t"polls":{}\n}');//"./poll/polls.json" because JS is funny
			utils.successMessage("Created polls.json.");
		}
	}
	polls = require("./polls.json");
}


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
	
	if(data.type == "l"){
		if(polls.currentLynch){
			utils.errorMessage("A lynch poll is already underway!");
			client.channels.get(config.channel_ids.gm_confirm).send("A lynch poll is already underway!");
			return -1;
		}else{
			polls.currentLynch = polls.num+1;
		}
	}
	
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
exports.calculateResults = function(poll, poll_id, values, client) {
	//The object the function will return
	var results = {
		options: poll["options"]
	};
	utils.debugMessage("Calculating results of polls");
	var disqualified = findDisqualified(values, client);
	var non_participants = findNonParticipants(values, disqualified, client);
	utils.debugMessage("Checked disqualified and non-participants.")
	var err = 0;
	if(poll.type == "l" || poll.type == "o"){
		err = exports.setVoteValue(getMayor(client), poll_id, 2);
	}
	if(err != 1 && err != -3){
		throw ("Some error occurred: " + (err==-4?"File writing error":"Unknown error"));
	}
	//TODO - Implement the code for frozen people
	
	//LATER!
	
	//Like really, GET THAT DONE!
	utils.debugMessage("Checked Mayor.");
	ranked = rankResults(results, values, poll);
	utils.debugMessage("Ranked results.");
	//What am I even doing??
	//I really really hope this works
	results.txt = buildMessage(ranked, values, poll, poll_id, disqualified, non_participants, false).txt;
	var msg = buildMessage(ranked, values, poll, poll_id, disqualified, non_participants, true);
	utils.debugMessage("Built messages")
	//What is this supposed to do?
	results.log_txt = msg.txt;
	results.cmd = msg.cmd;
	//I'm lost in my own code now
	//Return the data
	return results;
}

exports.setVoteValue = function(user_id, poll_id, val){
	if(poll_id === "l"){
		if(polls.currentLynch)poll_id = polls.currentLynch;
		else return -1;
	}
	if (!polls["polls"][poll_id]) {
		utils.errorMessage("The poll with id " + poll_id + " doesn't exist, sadly.");
		return -2;
	}
	var poll = polls.polls[poll_id];
	if(!poll.voteValues){
		poll.voteValues = {};
		poll.voteValues[user_id] = val;
	}else{
		if(user_id in poll.voteValues){
			utils.warningMessage(`Player's vote already has value of ${poll.voteValues[user_id]} (ID: {user_id}).`);
			return -3;
		}else{
			poll.voteValues[user_id] = val;
		}
	}
	
	try{
		fs.writeFileSync("./poll/polls.json", JSON.stringify(polls, null, 2)); 
	}catch(err){
		utils.errorMessage(err);
		client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when trying to edit the polls.json file.");
		return -4;
		
	};
	utils.successMessage(`Value of a player's (ID:${user_id}) vote in poll ${poll_id} set to ${val}.`);
	return 1;
}

exports.cleanUp = function(msgs, id) {
	//Delete the messages
	for (var i = 0; i < msgs.length; i++) {
		msgs[i].delete();
	}
	if(polls["polls"][id].type == "l")delete polls.currentLynch;
	//Delete the poll from storage
	delete polls["polls"][id];
	
	fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
		if (err) {
			utils.errorMessage(err);
			client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when trying to edit the polls.json file.");
		}else{
			utils.successMessage("Successfully ended poll!");
		}
	});
		
}

exports.extraVotes = function(id, poll_id, extra){
	if(poll_id === "l"){
		if(polls.currentLynch)poll_id = polls.currentLynch;
		else return -1;
	}
	if (!polls["polls"][poll_id]) {
		utils.errorMessage("The poll with id " + poll_id + " doesn't exist, sadly.");
		return -2;
	}
	var poll = polls.polls[poll_id];
	var found = false;
	if(!poll.extraVotes)poll.extraVotes = {};
	for(var user_id in poll.extraVotes){
		if(user_id == id){
			polls.extraVotes[id] += extra;
			found = true;
			break;
		}
	}
	if(!found){
		poll.extraVotes[id] = extra;
	}
	try{
		fs.writeFileSync("./poll/polls.json", JSON.stringify(polls, null, 2)); 
	}catch(err){
		utils.errorMessage(err);
		client.channels.get(config.channel_ids.gm_confirm).send("Error occurred when trying to edit the polls.json file.");
		return -4;
		
	};
	utils.successMessage(`${extra} votes added to a player (ID:${id}) in poll ${poll_id}.`);
	return found?0:1;
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
		if(poll.voteValues){
			var keys = values[i].keyArray();
			for(var j = 0; j < keys.length; j++){
				if(keys[j] in poll.voteValues){
					n += poll.voteValues[keys[j]];
				}else{
					n += 1;
				}
			}
		}else{
			n = values[i].size;
		}
		if(poll.extraVotes){
			if(results.options[i].id in poll.extraVotes){
				n += poll.extraVotes[results.options[i].id];
			}
		}
		results.options[i].votes = n; //Also add the vote tally to the results object
		if(values[i].size <= 0)continue;
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
	var participants = client.guilds.get(config.guild_id).roles.get(config.role_ids.participant).members;//Some error occurs here :(
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

function buildMessage(ranked, values, poll, poll_id, disqualified, non_participants, log){
	//Build the message to be sent
	var txt = "Results of the polls (ID:" + poll_id + ") :\n\n";
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
			if(users.length == 0)continue;
			var n = ranked[k].num;
			if(n < 0)n = 0;
			txt += ("\n" + n + " effective votes for <@" + poll["options"][i]["id"] + "> (" + poll["options"][i]["emoji"] + "). Players who voted for <@" + poll["options"][i]["id"] + "> :\n");
			for (var j = 0; j < users.length; j++) {
				txt += ("\t<@" + users[j][1].id + ">");
				if(users[j][1].id in poll.voteValues){
					txt += ` (worth ${poll.voteValues[users[j][1].id]})\n`;
				}else{
					txt += "\n";
				}
			}
			txt += '\n';
		}
	}else{
		for(var i = 0; i < values.length; i++){
			var users = Array.from(values[i]);//TODO this needs to be changed
			if(users.length == 0)continue;
			txt += `\n People who voted for <@${poll.options[i].id}> (${poll.options[i].emoji}) :\n`;
			for (var j = 0; j < users.length; j++) {
				txt += ("\t<@" + users[j][1].id + ">\n");
			}
		}
	}
	if(log){
		if(poll.extraVotes){
			txt += "Modifiers:\n";
			var found = false;
			var e = poll.extraVotes;//convenience
			for(var id in e){
				//-9000 is arbritrary really, just needs to be low enough,
				//but slightly more than the negative votes used for a person who cannot be voted for
				if(e[id] < -9000){ 
					found = true;//I'm a bit sleepy, so my code isn't exactly that sensible
					txt += `\t<@${id}> is immune in this poll!\n`;
				}else if(e[id] < 0){
					found = true;
					txt += `\t<@${id}> gets ${-e[id]} fewer votes!\n`;
				}else if(e[id] > 0){
					//if it is 0, ignore
					found = true;
					txt += `\t<@${id}> gets ${e[id]} extra votes!\n`;
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
	//And the non-participants
	if (non_participants.length !== 0) {
		txt += "\n";
		if (non_participants.length === 1) {
			txt += "<@" + non_participants[0] + "> you are not allowed to vote, only participants can vote.";
		} else {
			non_participants.forEach(function (item, index) {
				txt += "<@" + item + ">";
				if (index === non_participants.length - 2)
					txt += " and ";
				else if (index !== non_participants.length - 1)
					txt += ", "
			});
			txt += " you are not allowed to vote, only participants can vote.";
		}
	}
	
	//And if this is for the GM channel, give the used command too
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

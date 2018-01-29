const discord = require("discord.js");
const fs = require("fs");
const config = require("../config");
const aliases = require('./polls_aliases')
const polls = require("./polls");
const utils = require("../utils");
//The above is self-explanatory, I think

//PS - I haven't actually finished anything much, only a base.
exports.startPollCmd = function(msg, client, args){
	var type = args[0].toLowerCase();//The type of poll - so far "lynch" (alias 'l'), "werewolves" (alias 'w'), "cult" (alias 'c')
	var txt = args.slice(1).join(" ");//The text thats displayed at the top of the polls
	if(aliases[type])type = aliases[type];//Convert full name to the alias
	var id = -1;//Poll ID
	
	
	
	switch(type){
		case ("l"):
			//The daily lynch
			
			break;
		case ("w"):
			//The werewolves choose whom to kill
			
			break;
		case ("c"):
			//The cultists choose whom to kill
			
			break;
		default:
			msg.reply("I'm sorry, but `" + type + "` is not a valid poll type (Types are -\nl - The Daily Lynch\nw - The Werewolves poll\nc - The Cult poll");
	}	
	//Send message informing GMs of new poll
	if(id !== -1)client.channels.get(config.channel_ids.gm_confirm).send("A new Poll, ``"+txt+"`` (id: "+num+") was created.");
}


/**
	Function startPollActual
	Start a poll.
	Arguments:
	client - The Discord Client the bot uses
	data - An object containing three properties - msg_text, channel_id, options:
		msg_text - A String, the text that is displayed at the start of the poll.
		channel_id - The ID of the channel in which to have the poll
		options - An array, the list of choices in the poll, along with thier emojis. Each element has two properties - txt, emoji:
			txt - The text corresponding to the option
			emoji - The emoji corresponding to the option (It's just a character BTW, just like all emojis in discord)
			
	Example for data:
	{
		msg_text:"Vote for your favourite!",
		channel_id:"4034578342784532XX",
		options:[
			{
				txt:"<@329977469350445069>",
				emoji:"😃"	
			},
			{
				txt:"<@402072907284480000>",
				emoji:"😕"
			},
			{
				txt:"A",
				emoji:"💀"
			}
		]
	}
	As in example, the "txt" field of the options can be a mention or just some plain text
*/
//I'm exporting this just in case it's needed sometime
exports.startPollActual = function(client, data){
	
	var options = data.options;
	var msg_text = data.msg_text;
	
	var ch = client.channels.get(data.channel_id);
	
	var nm = (options.length - ((options.length-1)%20 + 1))/20 + 1;//Number of messages the bot must send
	var txt = new Array(nm);//The text of the messages themselves
	for(i = 0; i < nm; i++){
		txt[i] = "";
		if(i === 0)txt[0] = msg_text+"-\n";
		for(j = 0; j < 20; j++){
			txt[i] += options[i*20 + j].emoji + " - " + options[i*20 + j].txt;
			if(i*20 + j >= options.length-1)break;
			txt[i] += "\n";
		}
	}
	
	//This will send the messages, and get the Promises of the messages
	var promises = new Array(nm);
	for(i = 0; i < nm; i++){
		promises[i] = ch.send(txt[i]);
	}
	//Combine all the promises
	Promise.all(promises).then(values => {
		//This whole code just adds the emojis
		msgs = new Array(values.length);
		for(i = 0; i < values.length; i++){
			msgs[i] = {
				id:values[i].id,
				options:"If you're seeing this, then the bot isn't working correctly."
			};
			opts = new Array(0);
			for(j = 0; j < 20; j++){
				if(i*20 + j >= options.length)break;
				values[i].react(options[i*20 + j].emoji).catch(err => {
					utils.errorMessage(err);
					utils.errorMessage("The bot failed to add an emoji to the message. If you know how I can set this right, please tell me.");
					utils.infoMessage("For now, use !checkPoll <id> to set the poll right.");
					ch.send("The bot failed to add an emoji to the message. To set it right, use !checkPoll <id>");
				});
				opts.push(options[i*20+j]);
			}
			msgs[i]["options"] = opts;
		}
		//Now save the poll so that a restart of the bot doesn't delete all the data
		polls["num"]++;
		var num = polls["num"];
		//Here I'm saving some stuff twice. It makes my work easier, but it's not storage efficient.
		//Though again, an extra kilobyte or two isn't much
		polls["polls"][num] = {
			channel:ch.id,
			messages:msgs,
			options:options
		};
		fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
			if (err) utils.errorMessage(err);
		});
		utils.successMessage("The poll was created successfully!");
	}).catch(function(err){
		utils.errorMessage(err);
		utils.errorMessage("There was an error when trying to make the poll.");
		ch.send("The bot failed to make the poll. Perhaps you should ask the Developers of the bot.");
	});
	return polls["num"]+1;//Return the ID of the poll
}

/**
	Function - checkPollCmd
	Checks if all the emojis have been added to the poll
	Arguments:
	msg - The message that triggered the function
	client - The Discord Client that the bot uses
	id - The ID of the poll to check
*/
exports.checkPollCmd = function(msg, client, id){
	if(!polls["polls"][id]){
		utils.errorMessage("The poll with id " + id + " doesn't exist, sadly.");
		msg.reply(`The poll with ID \`${id}\` doesn't exist, or it's results have been checked already.`);
		return;
	}
	//Get the poll and its details
	var poll = polls["polls"][id];
	var ch = client.channels.get(poll["channel"]);
	//Get the messages (promises of the messages really)
	var promises = new Array(poll["messages"].length);
	for(i = 0; i < promises.length; i++){
		promises[i] = msg.channel.fetchMessage(poll["messages"][i].id);
	}
	Promise.all(promises).then(msgs => {
		for(i = 0; i < poll["messages"].length; i++){
			for(j = 0; j < poll["messages"][i]["options"].length; j++){
				//Check if the message has all required emojis, add the missing ones.
				var r = msgs[i].reactions.find(val => val.emoji.name === poll["messages"][i]["options"][j]["emoji"]);
				if(!r || !r.me){
					msgs[i].react(poll["messages"][i]["options"][j]["emoji"]).catch(function(err){
						utils.errorMessage(err);
						utils.errorMessage("There was an error when trying to react to the messages. Again. No idea why. Perhaps I should just give up now.");
						ch.send("It still didn't work :(");
					});
				}
			}
		}

	}).catch(function(err){
		utils.errorMessage(err);
		utils.errorMessage("There was an error when trying to fetch the messages.");
		ch.send("An error occurred.");
	});
}

/**
	Function - endPollCmd
	Ends a poll
	Arguments:
	msg - The message that triggered the function
	client - The Discord Client that the bot uses
	id - The ID of the poll to end
*/
exports.endPollCmd = function(msg, client, id){
	if(!polls["polls"][id]){
		utils.errorMessage("The poll with id " + id + " doesn't exist, sadly.");
		msg.reply(`The poll with ID \`${id}\` doesn't exist, or it's results have been checked already.`);
		return;
	}
	//Fetch the poll and its details
	var poll = polls["polls"][id]; 
	var ch = client.channels.get(poll["channel"]);
	//Get the messages
	var promises = new Array(poll["messages"].length);
	for(i = 0; i < promises.length; i++){
		promises[i] = ch.fetchMessage(poll["messages"][i].id);
	}
	//Work on the messages, and then return a promise of the results
	return Promise.all(promises).then(msgs => {
		//Get the message reactions
		var promises = new Array(poll["options"].length);
		var s = 0;
		for(i = 0; i < poll["messages"].length; i++){
			for(j = 0; j < poll["messages"][i]["options"].length; j++){
				var r = msgs[i].reactions.find(val => val.emoji.name === poll["messages"][i]["options"][j]["emoji"]);
				promises[s] = r.fetchUsers();
				s++;
			}
		}
		//WARNING - This code is not as efficient as it should be
		return Promise.all(promises).then(function(values){
			//The text message the bot will send
			var txt = "Results of the polls:\n";
			//The object the function will return
			var results = {
				id:id,
				options:poll["options"]
			};
			//Disqualified persons
			var disqualified = new Array(0);
			var voted = new Array(0);//Who as voted?
			for(i = 0; i < values.length; i++){
				//Check if person has voted twice -> disqualify them
				var users = Array.from(values[i]);
				users.forEach(function(item){
					if(item[1].id !== client.user.id){
						if(voted.find(element => {
							return element == item[1].id;
						})){
							if(!disqualified.find(element => {
								return element == item[1].id;
							}))disqualified.push(item[1].id);
						}else{
							voted.push(item[1].id);
						}
					}else{
						values[i].delete(item[0]);//Forget the reactions the bot itself sent
					}
				});
			}
			//Delete the votes of the disqualified
			for(i = 0; i < values.length; i++){
				var users = Array.from(values[i]);	
				users.forEach(function(item){
					if(disqualified.find(element => {
						return element == item[1].id;
					}))values[i].delete(item[0]);
				});
			}
			
			//Rank the results of the poll (descending order)
			var ranked = new Array(0);
			for(i = 0; i < values.length; i++){	
				results.options[i].votes = values[i].size;//Also add the vote tally to the results object
				if(values[i].size === 0)continue;
				ranked.push({
					id:i,
					num:values[i].size
				});
			}
			ranked.sort(function(a, b){
				return b.num - a.num;
			});
			//Build the message to be sent
			for(k = 0; k < ranked.length; k++){
				var i = ranked[k].id;
				var users = Array.from(values[i]);
				txt += "\n" + (users.length + " voted for " + poll["options"][i]["txt"] + " (" + poll["options"][i]["emoji"] + "):\n");
				for(j = 0; j < users.length; j++){
					txt += ("\t<@" + users[j][1].id + ">\n");
				}
			}
			//And make sure to mention who was disqualified
			if(disqualified.length !== 0){
				txt += "\n";
				if(disqualified.length === 1){
					txt += "<@" + disqualified[0] + "> was disqualified as they cast multiple votes.";
				}else{
					disqualified.forEach(function(item, index){
						txt += "<@" + item + ">";
						if(index === disqualified.length - 2)txt += " and ";
						else if(index !== disqualified.length -1)txt += ", "
					});
					txt += " were disqualified as they cast multiple votes.";
				}
			}
			//Send the message - Hooray!
			ch.send(txt);
			//Delete the poll from storage
			delete polls["polls"][id];
			fs.writeFile("./poll/polls.json", JSON.stringify(polls, null, 2), (err) => {
				if (err) console.error(err)
			});
			//Delete the messages
			for(i = 0; i < msgs.length; i++){
				msgs[i].delete();
			}
			utils.successMessage("Successfully ended poll!");
			//Return the data
			return results;
		}).catch(err => {
			utils.errorMessage(err);
			utils.errorMessage("Couldn't fetch reactions.");
			ch.send("Error occurred.");
		});
	}).catch(err => {
		utils.errorMessage(err);
		utils.errorMessage("Couldn't fetch messages.");
		ch.send("Error occurred.");
	});
}
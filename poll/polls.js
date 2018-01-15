const discord = require("discord.js");
const fs = require("fs");
let polls = JSON.parse(fs.readFileSync("./poll/polls.json", "utf8"));

exports.startPoll = function(ch, msg_text, options){
	var nm = (options.length - ((options.length-1)%20 + 1))/20 + 1;
	var txt = new Array(nm);
	for(i = 0; i < nm; i++){
		txt[i] = "";
		if(i === 0)txt[0] = msg_text+"-\n";
		for(j = 0; j < 20; j++){	
			txt[i] += options[i*20 + j].emoji + " - " + options[i*20 + j].txt;
			if(i*20 + j >= options.length-1)break;
			txt[i] += "\n";
		}
	}	
	var promises = new Array(nm);
	for(i = 0; i < nm; i++){
		promises[i] = ch.send(txt[i]);
	}
	Promise.all(promises).then(values => {
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
					//console.error(err);
					console.log("The bot failed to add an emoji to the message. If you know how I can set this right, please tell me.");
					console.log("For now, use !checkpoll <id> to set the poll right.");
				});
				opts.push(options[i*20+j]);
			}
			msgs[i]["options"] = opts;		
		}
		polls["num"]++;
		var num = polls["num"];
		//Here I'm saving some stuff twice. It makes my work easier, but it's not storage efficient.
		//Though again, an extra kilobyte or two isn't much
		polls["polls"][num] = {
			channel:ch.id,
			messages:msgs,
			options:options
		};
		fs.writeFile("./poll/polls.json", JSON.stringify(polls), (err) => {
			if (err) console.error(err)
		});
	}).catch(console.error);
	return polls["num"]+1;
}

exports.checkPoll = function(id, client){
	if(!polls["polls"][id]){
		console.log("The poll with id " + id + " doesn't exist, sadly. I haven't thought of what to do in that case.");
		return;
	}
	var poll = polls["polls"][id];
	var ch = client.channels.get(poll["channel"]);
	var promises = new Array(poll["messages"].length);
	for(i = 0; i < promises.length; i++){
		promises[i] = ch.fetchMessage(poll["messages"][i].id);
	}
	Promise.all(promises).then(msgs => {
		for(i = 0; i < poll["messages"].length; i++){
			for(j = 0; j < poll["messages"][i]["options"].length; j++){
				var r = msgs[i].reactions.find(val => val.emoji.name === poll["messages"][i]["options"][j]["emoji"]);
				if(!r || !r.me)msgs[i].react(poll["messages"][i]["options"][j]["emoji"]).catch("Not again! :(");
			}
		}
		
	}).catch(console.error);
}

exports.endPoll = function(id, client){//I need the client because that's how I'm gonna find the channel. I should make this better sometime.
	if(!polls["polls"][id]){
		console.log("The poll with id " + id + " doesn't exist, sadly. I haven't thought of what to do in that case.");
		return;
	}
	var poll = polls["polls"][id]; 
	var ch = client.channels.get(poll["channel"]);
	var promises = new Array(poll["messages"].length);
	for(i = 0; i < promises.length; i++){
		promises[i] = ch.fetchMessage(poll["messages"][i].id);
	}
	Promise.all(promises).then(msgs => {
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
		Promise.all(promises).then(function(values){
			var txt = "Results of the polls:\n";
			/*
			values.sort(function(a, b){
				return b.size - a.size;
			});
			*/
			var disqualified = new Array(0);
			var voted = new Array(0);
			for(i = 0; i < values.length; i++){
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
						values[i].delete(item[0]);
					}
				});
			}						
			for(i = 0; i < values.length; i++){
				var users = Array.from(values[i]);	
				users.forEach(function(item){
					if(disqualified.find(element => {
						return element == item[1].id;
					}))values[i].delete(item[0]);
				});
			}
			var ranked = new Array(0);
			for(i = 0; i < values.length; i++){	
				if(values[i].size === 0)continue;
				ranked.push({
					id:i,
					num:values[i].size
				});
			}
			ranked.sort(function(a, b){
				return b.num - a.num;
			});
			for(k = 0; k < ranked.length; k++){
				var i = ranked[k].id;
				var users = Array.from(values[i]);
				txt += "\n" + (users.length + " voted for " + poll["options"][i]["txt"] + " (" + poll["options"][i]["emoji"] + "):\n");
				for(j = 0; j < users.length; j++){
					txt += ("\t<@" + users[j][1].id + ">\n");
				}
			}
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
			ch.send(txt);
			//TODO - Now I still need to add the code to return the data. 
		});
	});
}
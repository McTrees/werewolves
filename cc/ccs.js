const config = require('../config'); //include main config
const utils = require('../utils'); //include main config
const game_state = require('../game/game_state');
const user = require('../user/user.js');
var fs = require('fs')



function writecc() { //function writes ccconf (odbj) to cc.json
  fs.writeFile('./cc/cc.json', JSON.stringify(ccconf), {
    encoding: 'utf-8'
  }, function(err) {
    if (err) throw err //throw error
  })
}



function createChannel(showCreator, people, client, name, ccconf, msg) { //function to make a channel in a category, and make new category if full

  //category stuffs
  ccconf.CC_catagory_number = parseInt(ccconf.CC_catagory_number) + 1 //increment the number of catgories
  categoryName = game_state.data().season_code + "_CC_" + ccconf.CC_catagory_number; //phrase name of catgories

  if (msg.guild.channels.get(ccconf.CC_curent_category_id) == undefined) { //if there is no current catagory
    msg.guild.createChannel(categoryName, "category").then(function(channel) { //make a new category
      utils.infoMessage(`had to make a new CC category (${categoryName})`) //log creation of new catagory
      ccconf.CC_curent_category_id = channel.id //update current category id
      writecc(); //write new channel id and number to cc.json
    })
  }

  //make a new channel
  msg.guild.createChannel(name, "text").then(channel =>
    channel.setParent(msg.guild.channels.get(ccconf.CC_curent_category_id)).catch(function(error) { //try to move the channel into a category, catching the errors
      if (error == "DiscordAPIError: Invalid Form Body\nparent_id: Maximum number of channels in category reached (50)") { //check that the error actually is that the category is full
        channel.delete() //delete the category
        msg.guild.createChannel(categoryName, "category").then(function(channel) { //make a new category
          ccconf.CC_curent_category_id = channel.id //update current category id
          utils.infoMessage(`had to make a new CC category (${categoryName})`) //log creation of new catagory
          writecc(); //write new channel id and number to cc.json
          createChannel(name, ccconf, msg) //try to make the channel again
        })
      }
    })

    //set perms
  ).then(function(channel) {
	utils.debugMessage("before bot")
    channel.overwritePermissions(client.user.id, { //the bot can see it
      'VIEW_CHANNEL': true
    })
    utils.debugMessage("added bot")
    channel.overwritePermissions(msg.guild.roles.find("name", "@everyone"), { //@everyone can't see it
      'VIEW_CHANNEL': false
    })
    utils.debugMessage("removed everyone")
    channel.overwritePermissions(msg.guild.roles.get(config.role_ids.gameMaster), { //gamemaster can see it
      'VIEW_CHANNEL': true,
      'READ_MESSAGE_HISTORY': true //perm for owner of cc, to add/remove people
    })
    utils.debugMessage("added GMs")
    channel.overwritePermissions(msg.author, { //author can see it
      'VIEW_CHANNEL': true,
      'READ_MESSAGE_HISTORY': true //perm for owner of cc, to add/remove people
    })
    utils.debugMessage("added author")
    channel.overwritePermissions(msg.guild.roles.get(config.role_ids.dead), { //dead peps (LOL HAHA SUCKS TO BE YOU) can't send in it
      SEND_MESSAGES: false
    })
    channel.overwritePermissions(msg.guild.roles.get(config.role_ids.participant), { //alive peps can send in it
      SEND_MESSAGES: true
    })
    people.forEach(function(element) {
      user.resolve_to_id(element).then(function(user) {
        channel.overwritePermissions(msg.guild.members.get(user), { //everyone specified can see it
          'VIEW_CHANNEL': true
        })
      })
    })
    utils.debugMessage("added others")
    var peoples = []
    if (showCreator == true) {
      channel.send(config.messages.CC.createNotAnonymous) //send the default message to the channel
      message = "<@" + msg.author.id + "> brought you together: "
      people.forEach(function(element) {
        user.resolve_to_id(element).then(function(id) {
          message += "<@" + id + ">";
        }).then(function() {
          channel.send(message); //say whos in the CC
        })
      })
    } else {
      channel.send(config.messages.CC.createAnonymous) //send the default message to the channel
    }
  })
}

exports.createCmd = function(msg, client, args) { //command for making a cc
  utils.debugMessage("start of create CC")
  msg.delete()
  var name = args[0]; //set var for cc name
  var showCreator = true; //default for showing the creator


  //check what the arguments are, and doing error handling
  var syntax = "```" + config.bot_prefix + "c create <name> [show creator (True or False [default True])] <person1> [person2]...```"; //define the syntax to be displayed

  //check if valid arguments
  if (args.length == 0) {
    msg.reply("Incorrect syntax; " + syntax) //alerts user of correct syntax
    return;
  }
  if (args.length == 1) {
    msg.reply("Incorrect syntax; Did you forget to invite someone? " + syntax) //alerts user of correct syntax
    return;
  }
  if (args[1].toLowerCase() == "true") {
    var showCreator = true
    var people = args.slice(2); //'PEOPLE' NEEDS TO BE AN ARRAY OF MENTIONS (<@ID>)) NEEDS TO BE FIXED
  } else if (args[1].toLowerCase() == "false") {
    var showCreator = false
    var people = args.slice(2); //'PEOPLE' NEEDS TO BE AN ARRAY OF MENTIONS (<@ID>)) NEEDS TO BE FIXED
  } else if (args[1][0] == "<" || args[1][0] == ":" || args[1][0] != "") {
    var people = args.slice(1); //'PEOPLE' NEEDS TO BE AN ARRAY OF MENTIONS (<@ID>)) NEEDS TO BE FIXED
  } else {
    console.log(args[1][0])
    msg.reply("Incorrect syntax; you must specify a name " + syntax) //alerts user of correct syntax
    return;
  }

  //check if valid name
  if (name == undefined || name == "" || name[0] == "<") { //test to see if there are no arguments or if name should be thingy
    msg.reply("Incorrect syntax; you must specify a name and it must be a mention or emoji " + syntax).then(message => //alerts user of correct syntax
      msg.delete(config.messageTimeout)) //deletes bots own message after time out
  } else if (people.length == 0) {
    msg.reply("did you forget to invite someone? " + syntax).then(message =>
      msg.delete(config.messageTimeout))
  } else {
    fs.readFile('./cc/cc.json', {
      encoding: 'utf-8'
    }, function(err, data) { //read cc.json to ccconfig
      if (err) throw err; //throw error
      ccconf = JSON.parse(data); //turns string into JSON object
      name = game_state.data().season_code.replace(/[^a-z 0-9 - _]/g, "a") + "-cc-" + name; //phrase name of channel, escaping special chars
      //actually make a channel
      createChannel(showCreator, people, client, name, ccconf, msg);
    })
  }
}

exports.listCmd = function(msg, client, args) { //list people in the cc
  if (!msg.channel.name.startsWith(game_state.data().season_code.replace(/[^a-z 0-9 - _]/g, "a") + "-cc-")) {
    msg.reply("you can only do that in a CC");
    return;
  }
  allPeople = msg.channel.permissionOverwrites.findAll("type", "member") //gets all the members of the cc
  allPeople = allPeople.filter(function(obj) { //removes the bot from the list
    return obj.id !== client.user.id;
  });
  var people = config.messages.CC.listPeople; //starts message with text
  allPeople.forEach(function(element) { //loop through all people, adding new line to the message
    people += "\n - <@" + element.id + "> "
  })
  msg.channel.send(people)
}

exports.addCmd = function(msg, client, args) { //add someone to the cc
  if (!msg.channel.name.startsWith(game_state.data().season_code.replace(/[^a-z 0-9 - _]/g, "a") + "-cc-")) {
    msg.reply("you can only do that in a CC");
    return;
  }
  allPeople = msg.channel.permissionOverwrites.findAll("type", "member") //gets all the members of the cc
  allPeople = allPeople.filter(function(obj) { //removes all members apart from the owner
    return (obj.allow != 0 || obj.allow == 68608) && obj.id != client.user.id;
  });
  allRoles = msg.channel.permissionOverwrites.findAll("type", "role") //gets all the roles of the cc
  allRoles = allRoles.filter(function(obj) { //filters for all roles with permission
    return obj.allow == 66560;
  });
  if (!allPeople[0].id == msg.author.id || !msg.member.roles.has(allRoles[0].id)) { //checks if they have perms, from the role or they are channel owner
    msg.reply(config.messages.general.permission_denied)
    return;
  }
  if (args.length == 0) {
    msg.reply("you must supply people to add")
  }
  people = args
  people.forEach(function(element) {

    try {
      user.resolve_to_id(element).then(function(user) {
        console.log(user)
        msg.channel.overwritePermissions(msg.guild.members.get(user), { //everyone specified can see it
          'VIEW_CHANNEL': true,
          'SEND_MESSAGES': true
        }).catch(function() {
          msg.reply("there was an error adding " + element + " to this cc")
        })
        msg.channel.send(element + " was added")
      }).catch(function() {
        msg.reply("there was an error adding " + element + " to this cc")
      })
    } catch (err) {
      msg.reply("there was an error adding " + element + " to this cc")
    }
  })
}


exports.removeCmd = function(msg, client, args) { //remove someone from the cc
  if (!msg.channel.name.startsWith(game_state.data().season_code.replace(/[^a-z 0-9 - _]/g, "a") + "-cc-")) {
    msg.reply("you can only do that in a CC");
    return;
  }
  allPeople = msg.channel.permissionOverwrites.findAll("type", "member") //gets all the members of the cc
  allPeople = allPeople.filter(function(obj) { //removes all members apart from the owner
    return (obj.allow != 0 || obj.allow == 68608) && obj.id != client.user.id;
  });
  allRoles = msg.channel.permissionOverwrites.findAll("type", "role") //gets all the roles of the cc
  allRoles = allRoles.filter(function(obj) { //filters for all roles with permission
    return obj.allow == 66560;
  });
  if (!allPeople[0].id == msg.author.id || !msg.member.roles.has(allRoles[0].id)) { //checks if they have perms, from the role or they are channel owner
    msg.reply(config.messages.general.permission_denied)
    return;
  }
  if (args.length == 0) { //check if there any arguments
    msg.reply("you must supply people to remove")
  }
  people = args
  people.forEach(function(element) {
    try {
      user.resolve_to_id(element).then(function(user) {
        msg.channel.permissionOverwrites.get(user).delete().catch(function() {
          msg.reply("there was an error removing " + element + " from this cc")
        })
        msg.channel.send(element + " was removed")
      }).catch(function() {
        msg.reply("there was an error removing " + element + " from this cc")
      })
    } catch (err) {
      msg.reply("there was an error removing " + element + " from this cc")
    }
  })
}

const config = require('../config'); //include main config
const utils = require('../utils'); //include main config
const game_state = require('../game/game_state');
const user = require('../user/user.js');
var fs = require('fs')

function writedata(data) { //function writes ccconf (odbj) to cc.json
  fs.writeFile('./channel/channels.json', JSON.stringify(data), {
    encoding: 'utf-8'
  }, function(err) {
    if (err) throw err //throw error
  })
}

exports.init = function(reset) {
  if (!reset) {
    // normal bot startup. create the file if it is not there.
    if (!fs.existsSync("channel/channels.json")) {
      // better create it!
      utils.warningMessage("secret channel file not found - creating a new one.")
      fs.closeSync(fs.openSync("channel/channels.json", 'w'));
    }
  } else {
    // we need to reset it
    utils.warningMessage("resetting secret channel file")
    fs.writeFile("channel/channels.json", "{}", function(err) {
      if (err) {throw err;}
    })
  }
}

exports.createChannel = function(client, guild, ids, name, category, message, role) {
  //client, guild, array of the ids of players to add, ...
  // the name of the channel, the cartegory to go in (id), ...
  // message to be sent in that channel, name of the role to associate with the channel
  fs.readFile('./channel/channels.json', {
    encoding: 'utf-8'
  }, function(err, data) { //read cc.json to ccconfig
    if (err) throw err; //throw error
    data = JSON.parse(data);

    guild.createChannel(name, "text").then(channel =>
      channel.setParent(guild.channels.get(category))
      //set perms
    ).then(function(channel) {
      channel.overwritePermissions(client.user.id, { //the bot can see it
        VIEW_CHANNEL: true
      })
      channel.overwritePermissions(guild.roles.find("name", "@everyone"), { //@everyone can't see it
        VIEW_CHANNEL: false,
      })
      channel.overwritePermissions(guild.roles.get(config.role_ids.gameMaster), { //gamemaster can see it
        VIEW_CHANNEL: true,
      })
      ids.forEach(function(element) {
        channel.overwritePermissions(guild.members.get(element), { //everyone specified can see it
          VIEW_CHANNEL: true
        })
      })
      channel.send(message)
      data[role] = channel.id
      writedata(data)
    })
  })
}



exports.checkChannel = function(channel_id, role_name) {
  return new Promise(function(resolve, reject) {
    fs.readFile('./channel/channels.json', {
      encoding: 'utf-8'
    }, function(err, data) {
      if (err) throw err;
      data = JSON.parse(data);
      resolve(data[role_name] == channel_id)
    })
  })
}

exports.add = function(channel, user) { //add someone to the cc                 channel, userID
        channel.overwritePermissions(msg.guild.members.get(user), {
          'VIEW_CHANNEL': true,
          'SEND_MESSAGES': true
        })
}


exports.remove = function(channel, user) { //remove someone from the cc           channel, userID
        channel.permissionOverwrites.get(user).delete()
}

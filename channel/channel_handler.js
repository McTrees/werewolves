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

exports.createChannel = function(client, guild, ids, name, category, message) { //client, guild, array of the ids of players to add, the name of the channel, the cartegory to go in (id), message to be sent in that channel
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
      user.get_role(ids[0]).then(function(role) {
        data[role] = channel.id
        writedata(data)
      })
    })
  })
}



exports.checkChannel = function(msg) {
  fs.readFile('./channel/channels.json', {
    encoding: 'utf-8'
  }, function(err, data) {
    if (err) throw err;
    data = JSON.parse(data);
    user.get_role(msg.member.id).then(function(role) {
      id = msg.channel.id
      actualId = data[role]
      if (actualId == id) {
        return (true);
      } else {
        return (false);
      }
    })
  })
}

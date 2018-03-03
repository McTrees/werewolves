const config = require('../config'); //include main config
const utils = require('../utils'); //include main config
const game_state = require('../game/game_state');
const user = require('../user/user.js');

exports.createChannel = function(client, guild, ids, name, category, message) { //client, guild, array of the ids of players to add, the name of the channel, the cartegory to go in (id), message to be sent in that channel
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

  })
}

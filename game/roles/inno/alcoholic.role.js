const config = require('../config'); //include main config


exports.name = "Alcoholic"
exports.description = "Can only talk in the tavern."

exports.game_start(game,me){
  guild.channels.find("id", config.channel_ids.town_square).overwritePermissions(guild.fetchMember(me.user_id), { //author can see it
    'SEND_MESSAGES': false,
  }
}

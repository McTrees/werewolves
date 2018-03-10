const config = require('../config'); //include main config

exports.name = "Alcoholic"
exports.description = "Can only talk in the tavern."

exports.game_start = function(game,me) {
  var guild = game.guild
  guild.channels.find("id", config.channel_ids.town_square).overwritePermissions(guild.fetchMember(me.user_id), {
    'SEND_MESSAGES': false,
  }
}

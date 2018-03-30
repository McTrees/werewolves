const role_manager = require("../role_manager")
module.exports = function(game, id_list) {
  id_list.forEach(async id=>{
    var player = game.player(id)
    var role = role_manager.role(await player.role)
    if (typeof role.on_night_to_day == "function") {
      role.on_night_to_day(game, player)
      // this gets run before kill q is executed btw
    }
  })
}

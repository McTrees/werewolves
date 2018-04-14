const role_manager = require("../role_manager")
module.exports = function(game, id_list) {
  return new Promise(function(resolve, reject) {
    id_list.forEach(async id=>{
      var player = game.player(id)
      var role = role_manager.role(await player.role)
      if (typeof role.on_day_to_night == "function") {
        role.on_day_to_night(game, player)
        // this gets run before kill q is executed btw
        // hopefully anyway, i should probably make sure of that.
      }
    })
  });
}

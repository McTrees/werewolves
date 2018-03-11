const db_fns = require("../db_fns")
const role_manager = require("../role_manager")
const utils = require("../../utils")
const PlayerController = require("../player_controller").PlayerController

module.exports = function(game, id_list) {
  // win teams
  utils.debugMessage("Assigning win teams...")
  id_list.map(game.player.bind(game)).forEach(pl=>{
    var ri = role_manager.role(pl.role)
    if (ri.win_teams && Array.isArray(ri.win_teams.starts_on)) {
      ri.win_teams.starts_on.forEach(tm=>{
        db_fns.win_teams.add_win_team(pl.id, tm)
      })
    } else {
      var rif = role_manager.fallback(pl.role)
      if (rif.win_teams && Array.isArray(rif.win_teams.starts_on)) {
        rif.win_teams.starts_on.forEach(tm=>{
          db_fns.win_teams.add_win_team(pl.id, tm)
        })
      }
    }
  })
  // create secret channels

  // do game_start for all roles that have one
  id_list.map(game.player).forEach(pl=>{
    if (typeof role_manager.role(pl.role).game_start == "function") {
      role_manager.role(pl.role).game_start(game, pl)
    }
  })
  // give participant role <-- LAST
}

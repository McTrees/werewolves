const db_fns = require("../db_fns")
const role_manager = require("../role_manager")
const utils = require("../../utils")

module.exports = function(game, id_list) {
  // win teams
  utils.debugMessage("Assigning win teams...")
  id_list.map(game.player).forEach(pl=>{
    var ri = role_manager.role(pl.role)
    if (ri.win_teams && Array.isArray(ri.win_teams.starts_on)) {
      ri.win_teams.starts_on.forEach(tm=>{
        db_fns.win_teams.add_win_team(pl.id, tm)
      })
    }
  })
  // create secret channels
  
  // do game_start for all roles that have one
  // give participant role <-- LAST
}

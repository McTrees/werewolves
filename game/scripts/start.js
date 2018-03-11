const db_fns = require("../db_fns")
const role_manager = require("../role_manager")
const utils = require("../../utils")
const PlayerController = require("../player_controller").PlayerController

module.exports = async function(game, id_list) {
  // win teams
  utils.debugMessage("Assigning win teams...")
  id_list.forEach(async function(id) {
    var player = game.player(id)
    var role = role_manager.role(await (player.role))
    if (role.win_teams && Array.isArray(role.win_teams.starts_on)) {
      role.win_teams.starts_on.forEach(tm=>{
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
  id_list.forEach(async function(id) {
    var player = game.player(id)
    var role = role_manager.role(await (player.role))
    if (typeof role.game_start == "function") {
      role.game_start(game, player)
    }
  })
  // give participant role <-- LAST
}

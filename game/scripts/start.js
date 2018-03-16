const db_fns = require("../db_fns")
const role_manager = require("../role_manager")
const utils = require("../../utils")
const PlayerController = require("../player_controller").PlayerController
const config = require("../../config")
const channels = require("../../channel/channel_handler")
const secret = require("../secret_channel_conf")
const game_state = require("../game_state")

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
      var fb_role = role_manager.fallback(await (player.role))
      if (fb_role.win_teams && Array.isArray(fb_role.win_teams.starts_on)) {
        fb_role.win_teams.starts_on.forEach(team=>{
          db_fns.win_teams.add_win_team(player.id, team)
        })
      }
    }
  })

  // create secret channels
  // we will assume that all role names in the conf file are valid,
  // because it's your fault if you change it and also
  // i cba validating it here

  // individual channels are 1 person per channel
  secret.individual.forEach(async role_name=>{
    var all = await game.u.all_with_role(role_name)
    var role_info = role_manager.role(role_name)
    all.forEach((id, index)=>{
      channels.createChannel(
        client,
        client.guilds.get(config.guild_id),
        [id],
        `${game_state.data().season_code}_${role_info.name}`,
        config.category_ids.secret_channel,
        role_info.documentation
      )
    })
  })

  // do game_start for all roles that have one
  id_list.forEach(async function(id) {
    var player = game.player(id)
    var role = role_manager.role(await (player.role))
    if (typeof role.game_start == "function") {
      role.game_start(game, player)
    }
  })

  // give participant role
  id_list.forEach(async function(id) {
    game._client.guilds.get(config.guild_id).fetchMember(id).then(member=>{
      member.addRole(config.role_ids.participant).then(member=>{
        member.removeRole(config.role_ids.signed_up)
      })
    })
  })
}

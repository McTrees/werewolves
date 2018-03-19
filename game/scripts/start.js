const db_fns = require("../db_fns")
const role_manager = require("../role_manager")
const utils = require("../../utils")
const PlayerController = require("../player_controller").PlayerController
const config = require("../../config")
const channels = require("../../channel/channel_handler")
const secret = require("./secret_channel_conf")
const game_state = require("../game_state")

module.exports = async function(game, id_list) {
  // start tags
  utils.debugMessage("Assigning starting tags")
  id_list.forEach(async function(id) {
    var player = game.player(id)
    var role = role_manager.role(await (player.role))
    if (role.tags && Array.isArray(role.tags.initial)) {
      role.tags.initial.forEach(tag=>{
        db_fns.tags.add_tag(pl.id, tag)
      })
    } else {
      var fb_role = role_manager.fallback(await (player.role))
      if (fb_role.tags && Array.isArray(fb_role.tags.initial)) {
        fb_role.tags.initial.forEach(tag=>{
          db_fns.tags.add_tag(player.id, tag)
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
        game._client,
        game._client.guilds.get(config.guild_id),
        [id],
        `${game_state.data().season_code}-${role_info.name}`,
        config.category_ids.secret_channel,
        role_info.documentation
      )
    })
  })
  Object.keys(secret.all).forEach(async ch_name=>{
    var role_name_list = secret.all[ch_name].roles
    var ids = role_name_list.map(role_name=>game.u.all_with_role(role_name))
    Promise.all(ids).then(ids_got=>{
      // I'm not quite sure how this works but it flattens the list
      flattened_ids = [].concat.apply([], ids_got)
      if (flattened_ids !== []) {
        channels.createChannel(
          game._client,
          game._client.guilds.get(config.guild_id),
          flattened_ids,
          `${game_state.data().season_code}-${ch_name}`,
          config.category_ids.secret_channel,
          secret.all[ch_name].message
        )
      }
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

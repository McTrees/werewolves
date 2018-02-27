const events = require("events")
const config = require("../config")
const fs = require("fs")
const user = require("../user/user.js")
const discord = require("discord.js")
const admin = require("../admin/admin")
const utils = require("../utils")
const game_state = require("./game_state")
const role_manager = require("./role_manager")
const PlayerController = require("./player_controller").PlayerController

const scripts = {
  every_day: require("./scripts/every_day"),
  every_night: require("./scripts/every_night"),
  start: require("./scripts/start")
}

exports.is_started = function () {
  // decides if a game is currently in progress.
  // TODO: replace all uses of this with the proper one
  // DEPRECIATED:: DON'T USE THIS!!!
  return game_state.data().state_num > 1
};

exports.commands.open_signups = function(msg, client) {
  // game state 0->1
  if (game_state.data().state_num !== 0){
    msg.reply("wrong game state!")
  } else {
    game_state.set_state_num(1)
    msg.reply("signups opened! yay!")
  }
}

exports.commands.game_info = function(msg, client) {
  utils.debugMessage("game info command called")
  var data = game_state.data()
  var emb = new discord.RichEmbed()
  emb.title = "Game info"
  emb
    .setColor(0x44009b)
    .addField("Season name", `${data.season_name} (\`${data.season_code}\`)`)
    .addField("Game phase", `${game_state.nice_names[data.state_num]} (#${data.state_num})`)
    .addField("Game time", `${data.night_time ? "Night" : "Day"} #${data.day_num}`)
  msg.channel.send(emb)
}

exports.commands.set_season_info = function(msg, client, args) {
  utils.debugMessage("set season info command called")
  game_state.set_season_code(args[0])
  game_state.set_season_name(args.slice(1).join(" "))
}

exports.commands.start_season = function (msg, client) {
  // game state 1 -> 2
  // start a new season
  if (game_state.data().state_num !== 1) {
    msg.reply("we are not in the right game state to do that")
  } else {
    user.all_signed_up().then(asu=>{
      if (asu.length == 0) { // 0 players isn't enough!
        msg.reply("there aren't enough players signed up to do that.")
      } else {
        msg.channel.send("Starting season! Please check <#" + config.channel_ids.gm_confirm + "> and enter player's roles.");
        startgame(client);
      }
    })
  }
};

function startgame(client) {
  game_state.set_state_num(2)
  user.all_signed_up().then(asu=>{
    role_manager.all_roles_list().then(VALID_ROLES=>{
      gm_confirm = client.channels.get(config.channel_ids.gm_confirm)
      gm_confirm.send(`Signed up users: ${asu.map(id=>`\n- <@${id.user_id}>`)}`)
      gm_confirm.send(`Valid roles: ${VALID_ROLES.map(n=>`\n- \`${n}\` (${role_manager.role(n).name})`)}`)
      gm_confirm.send("For every user, please say `!g set_role @mention ROLE`, where ROLE is any of " + VALID_ROLES)
    })
  })
}

exports.commands.set_role = async function (msg, client, args) {
  // game state 2 only
  if (args.length !== 2) {
    msg.reply("invalid syntax!")
    return
  }
  let VALID_ROLES = await role_manager.all_roles_list()
  let usr = args[0]
  let role = args[1]
  if (game_state.data().state_num !== 2) {
    msg.reply("signups are currently open or a game is not being set up")
  } else {
    if (!VALID_ROLES.includes(role)) {
      msg.reply("invalid role: `"+role+"`!")
    } else {
      var id = await user.resolve_to_id(usr)
      // now we need to check that user actually signed up
      var all = await user.all_signed_up()
      ids = all.map(row=>row.user_id) // get array of all the user ids
      if (!ids.includes(id)) {
        // that user hasn't signed up!
        msg.reply(`the user <@${id}> hasn't signed up! You probably don't want to give them a role...`)
      } else {
        msg.reply(`giving <@${id}> role ${role}`)
        user.finalise_user(id, role)
      }
    }
    setTimeout(()=>{ //delay by 1 sec to allow the database to be updated. it's not perfect but it works
      user.any_left_unfinalised().then(any_left => {
        if (!any_left) {
          // all players have a role assigned
          msg.reply("all players now have a role assigned.\nTo send everyone their roles, do `!g send_roles`")
        } else {
          // still some left
          msg.reply("there are still user(s) with no role")
        }
      })
    }, 1000)
  }
}

exports.commands.send_roles = async function(msg, client) {
  // game state 2->3
  if (game_state.data().state_num !== 2){
    msg.reply("signups are currently open or a game is not being set up")
  } else {
    var any_left = await user.any_left_unfinalised()
    if (any_left) {
      msg.reply("how do you expect me to tell everyone their roles when you haven't even given everyone a role yet? ಠ_ಠ")
    } else {
      game_state.set_state_num(3)
      utils.infoMessage("sending roles to players")
      msg.reply("sending roles to all players!")
      var all_users = await user.all_alive()
      var id_list = all_users.map(row=>row.id)
      id_list.forEach(async function(id) {
        var role = await user.get_role(id)
        var u = client.users.get(id)
        if (u === undefined) {
          utils.warningMessage("Couldn't send message to user with ID "+id+"!")
          msg.reply("Couldn't send message to user with ID "+id+"!")
        } else {
          utils.infoMessage(`sending role to ${u.username}`)
          u.send("your role is "+role).catch(e=>{
            if (e.message == 'Cannot send messages to this user') {
              msg.reply(`user <@${id}> has DMs disabled!`)
              utils.warningMessage(`user ${u.username} has DMs disabled!`)
            }
          })
        }
      })
    }
  }
}

exports.commands.begin = async function(msg, client) {
  // game state 3->4
  // TODO: scripts/start here too
  if (game_state.data().state_num !== 3 ){
    msg.reply("wrong game state")
  } else {
    msg.reply("😁 game started actually yay")
    game_state.set_state_num(4)
  }

}

exports.commands.day = async function(msg, client) {
  if (game_state.data().state_num !== 4) {
    msg.reply("wrong game state")
    return
  }
  var d = game_state.data()
  if (!d.night_time) {
    msg.reply("it's already day time! specifically day "+d.day_num)
  } else {
    game_state.next_day_or_night()
    msg.reply(`👍 now it's day ${d.day_num}`)
  }
}

exports.commands.night = async function(msg, client) {
  if (game_state.data().state_num !== 4) {
    msg.reply("wrong game state")
    return
  }
  var d = game_state.data()
  if (d.night_time) {
    msg.reply("it's already night time! specifically night "+d.day_num)
  } else {
    game_state.next_day_or_night()
    msg.reply(`👍 now it's night ${d.day_num}`)
  }
}

exports.commands.kill = async function(msg, client, args) {
  // kills someone
  // args[0] should be who killed them (how they died). currently 'l' for lynch or 'w' for werewolves.
  // args[1] should be who to kill
  if (args.length !== 2) {
    msg.reply("wrong syntax!")
  } else {
    var dead_person_id = await user.resolve_to_id(args[1])
    kill(dead_person_id, args[0], client)
  }
}

async function kill(who, why, client) {
  // who should be id of who to kill
  // why should be who killed them (how they died)
  var their_role = await user.get_role(who)
  var their_role_i = role_manager.role(their_role)

  // TODO: more info available to functions
  var kill_desc = { by: why }
  var game = { masters: client.channels.get(config.channel_ids.gm_confirm)}
  var me = new PlayerController(who)
  var did_they_die
  if (typeof their_role_i.on_death === "function") {
    // there is a custom death function
    did_they_die = their_role_i.on_death(kill_desc, game, me)
  } else {
    // no custom death function
    // so we should use the fallback
    did_they_die = role_manager.fallback(their_role).on_death(kill_desc, game, me)
  }
  if (did_they_die){
    set_dead(who, client)
  }
}

function set_dead(id, client) {
  // gives them the dead role
  let ch = client.channels.get(config.channel_ids.gm_confirm)
  ch.send(`<@${id}> is dead!`)
  ch.guild.fetchMember(id).then(m=>{
    if (m) {
      m.addRole(config.role_ids.dead)
      //TODO remove living role
    }
  })
}

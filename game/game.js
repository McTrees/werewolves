const events = require("events")
const config = require("../config")
const fs = require("fs")
const user = require("../user/user.js")
const discord = require("discord.js")
const admin = require("../admin/admin")
const utils = require("../utils")
const game_state = require("./game_state")
const role_manager = require("./role_manager")

exports.is_started = function () {
  // decides if a game is currently in progress.
  // TODO: replace all uses of this with the proper one
  // DEPRECIATED:: DON'T USE THIS!!!
  return game_state.data().state_num > 1
};

exports.open_signupsCmd = function(msg, client) {
  // game state 0->1
  if (game_state.data().state_num !== 0){
    msg.reply("wrong game state!")
  } else {
    game_state.set_state_num(1)
    msg.reply("signups opened! yay!")
  }
}

exports.game_infoCmd = function(msg, client) {
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

exports.startseasonCmd = function (msg, client) {
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
    gm_confirm = client.channels.get(config.channel_ids.gm_confirm)
    gm_confirm.send(`Signed up users: ${asu.map(id=>`\n- <@${id.user_id}>`)}`)
    gm_confirm.send("For every user, please say `!g setrole @mention ROLE`, where ROLE is any of " + VALID_ROLES)
  })
}

exports.setroleCmd = async function (msg, client, args) {
  // game state 2 only
  if (args.length !== 2) {
    msg.reply("invalid syntax!")
    return
  }
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
          msg.reply("all players now have a role assigned.\nTo send everyone their roles, do `!g sendroles`")
        } else {
          // still some left
          msg.reply("there are still user(s) with no role")
        }
      })
    }, 1000)
  }
}

exports.sendrolesCmd = async function(msg, client) {
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

exports.dayCmd = async function(msg, client) {

}

exports.nightCmd = async function(msg, client) {

}

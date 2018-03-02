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
const db_fns = require("./db_fns")
exports.commands = {}

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
    msg.channel.send("This is the wrong game state, buddy!")
  } else {
    game_state.set_state_num(1)
    msg.reply("the sign-up has been opened! Yay!")
  }
}

exports.commands.game_info = function(msg, client) {
    utils.debugMessage("Game info command called")
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
    utils.debugMessage("Set season info command called")
    game_state.set_season_code(args[0])
    game_state.set_season_name(args.slice(1).join(" "))
}

// Tags
exports.commands.tag = function(msg, client, args) {
  if (game_state.data().state_num !== 4){
    msg.reply("a game is not in progress")
  } else {
    utils.debugMessage(`tag command: ${msg.content}}`)
    var subcommand = args[0]
    switch (subcommand) {
      case "add":
        if (args.length !== 3) {
          msg.reply("wrong syntax!")
          return
        }
        user.resolve_to_id(args[1]).then(id=>{
          db_fns.tags.add_tag(id, args[2])
        })
        break
      case "remove":
        if (args.length !== 3) {
          msg.reply("wrong syntax!")
          return
        }
        user.resolve_to_id(args[1]).then(id=>{
          db_fns.tags.remove_tag(id, args[2])
        })
        break
      case "all_with":
        if (args.length !== 2) {
          msg.reply("wrong syntax!")
          return
        }
        db_fns.tags.all_with_tag(args[1]).then(list=>{
          msg.channel.send(`All players with tag \`${args[1]}\`:
${list.map(id=>`- <@${id}>`).join("\n")}`)
        })
        break
      case "all_of":
        if (args.length !== 2) {
          msg.reply("wrong syntax!")
          return
        }
        user.resolve_to_id(args[1]).then(id=>{
          db_fns.tags.all_tags_of(id).then(list=>{
            msg.channel.send(`All tags of player <@${id}>:
${list.map(tag=>`- \`${tag}\``).join("\n")}`)
          })
        })
        break
    }

  }
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
        msg.channel.send("Starting season! Please check <#" + config.channel_ids.gm_confirm + "> and enter players' roles.");
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
    msg.reply("the sign-up is currently open, or a game is not being set up.\nI'm sorry for the inconvenience!")
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
        msg.reply(`user <@${id}> hasn't signed up! Don't to give them a role, silly. 😏`)
      } else {
        msg.reply(`giving <@${id}> role ${role}`)
        user.finalise_user(id, role)
      }
    }
    setTimeout(()=>{ //delay by 1 sec to allow the database to be updated. it's not perfect but it works
      user.any_left_unfinalised().then(any_left => {
        if (!any_left) {
          // all players have a role assigned
          msg.reply("all players now have a role assigned.\nTo send everyone their roles, please type `!g send_roles`.")
        } else {
          // still some left
          msg.reply("there are still user(s) without a role.")
        }
      })
    }, 1000)
  }
}

exports.commands.send_roles = async function(msg, client) {
  // game state 2->3
  if (game_state.data().state_num !== 2){
    msg.reply("the sign-up is currently open, or a game is not being set up.\nI'm sorry for the inconvenience!")
  } else {
    var any_left = await user.any_left_unfinalised()
    if (any_left) {
      msg.reply("that's not gonna work, pal. How do you expect me to send everyone their roles when you haven't even given everyone a role yet? ಠ_ಠ")
    } else {
      game_state.set_state_num(3)
      utils.infoMessage("Sending roles to players...")
      msg.reply("sending roles to all players!")
      var all_users = await user.all_alive()
      var id_list = all_users.map(row=>row.id)
      id_list.forEach(async function(id) {
        var role = await user.get_role(id)
        var u = client.users.get(id)
        if (u === undefined) {
          utils.warningMessage("Couldn't send message to user with ID "+id+"!")
          msg.reply(`couldn't send message to user <@${id}> (ID \`id\`)!`)
        } else {
          utils.infoMessage(`sending role to ${u.username}`) // NOTE: The following message still needs the season number.
          //This next line is still a WIP
          u.send("This message is giving you your role for season *TODO* of the Werewolves game.\n\nYour role is `"+role+"`.\n\n**You are not allowed to share a screenshot of this message!** You can claim whatever you want about your role, but you may under **NO** circumstances show this message in any way to any other participants.\nWe hope you are happy with the role you gained, and we hope you'll enjoy the game as much as we do.\n\nGood luck... :full_moon:\n\n\nDo you not understand your role? Don't worry! Use the command `~rm roleinfo ROLE` for an explanation.\nYou can now use commands in this Direct Message!").catch(e=>{
            if (e.message == 'Cannot send messages to this user') {
              msg.reply(`user <@${id}> has DMs disabled!`)
              utils.warningMessage(`User ${u.username} has DMs disabled!`)
            }
          })
        }
      })
      msg.channel.send("All DMs sent!")
    }
  }
}

exports.commands.begin = async function(msg, client) {
  // game state 3->4
  // TODO: scripts/start here too
  if (game_state.data().state_num !== 3 ){
    msg.reply("this is the wrong game state for that, buddy.")
  } else {
    msg.reply("😁, the game actually started, yay!")
    game_state.set_state_num(4)
  }

}

exports.commands.day = async function(msg, client) {
  if (game_state.data().state_num !== 4) {
    msg.reply("nope nope nope, wrong game state, mate.")
    return
  }
  var d = game_state.data()
  if (!d.night_time) {
    msg.reply("it's already day time! In particular, it's currently day "+d.day_num+".")
  } else {
    game_state.next_day_or_night()
    msg.reply(`[👍] It is now day ${d.day_num}!`)
  }
}

exports.commands.night = async function(msg, client) {
  if (game_state.data().state_num !== 4) {
    msg.reply("nope nope nope, wrong game state, mate.")
    return
  }
  var d = game_state.data()
  if (d.night_time) {
    msg.reply("it's already night time! In particular, it's currently night "+d.day_num+".")
  } else {
    game_state.next_day_or_night()
    msg.reply(`[👍] It is now night ${d.day_num}!`)
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

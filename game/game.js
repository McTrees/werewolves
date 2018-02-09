const events = require("events")
const config = require("../config")
const fs = require("fs")
const user = require("../user/user.js")
const discord = require("discord.js")
const admin = require("../admin/admin")

const VALID_ROLES = ["INNOCENT", "WEREWOLF"]

class Game extends events.EventEmitter {
  constructor(season_number) {
    this.season_number = season
    this.cycle = 0 // incremented at the start of every day
  }

  day() {
    this.emit("day", ++this.cycle)
  }
  night() {
    this.emit("night", this.cycle)
  }
}

exports.is_started = function () {
  // decides if a game is currently in progress.
  return fs.existsSync("game.dat")

};

exports.startseasonCmd = function (msg, client) {
  // start a new season
  if (exports.is_started()) {
    msg.reply("It appears that we are already in a game... -_-")
  } else {
    msg.channel.send("Starting season! Please check <#" + config.channel_ids.gm_confirm + "> and enter player's roles.");
    startgame(client);
  }
};

function startgame(client) {
  fs.writeFile("game.dat", "GAME", err =>{if (err) throw err})
  user.all_signed_up().then(asu=>{
    gm_confirm = client.channels.get(config.channel_ids.gm_confirm)
    gm_confirm.send(`Signed up users: ${asu.map(id=>`\n- <@${id.user_id}>`)}`)
    gm_confirm.send("For every user, please say `!g setrole @mention ROLE`, where ROLE is any of " + VALID_ROLES)
  })
}

exports.setroleCmd = async function (msg, client, args) {
  if (args.length !== 2) {
    msg.reply("invalid syntax!")
    return
  }
  let usr = args[0]
  let role = args[1]
  if (!exports.is_started()) {
    msg.reply("signups are currently open or a game is not being set up")
  } else {
    if (!VALID_ROLES.includes(role)) {
      msg.reply("invalid role: `"+role+"`!")
    } else {
      var id = await user.resolve_to_id(usr)
      msg.reply(`giving <@${id}> role ${role}`)
      user.finalise_user(id, role)
    }
    if (!await user.any_left_unfinalised()) {
      // all players have a role assigned
      msg.reply("all players now have a role assigned.\nTo send everyone their roles, do `!g sendroles`")

    } else {
      msg.reply("there are still user(s) with no role")
    }
  }
}

exports.sendrolesCmd = async function(msg, client) {
  msg.channel.send("TODO: this")
}

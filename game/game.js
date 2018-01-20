const events = require("events")
const config = require("../config")
const fs = require("fs")
const user = require("../user/user")
const discord = require("discord.js")

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
    startgame(client)
  }
};

exports.setroleCmd = function (msg, client, user, role) {
  if (!exports.is_started()) {
    msg.reply("signups are currently open or a game is not being set up")
  } else {
    
    user.finalise_user()
  }
}

function startgame(client) {
  fs.writeFile("game.dat", "GAME", err =>{if (err) throw err})
  user.all_signed_up().then(asu=>{
    gm_confirm = client.channels.get(config.channel_ids.gm_confirm)
    gm_confirm.send(`Signed up users: ${asu.map(id=>`\n- <@${id.user_id}>`)}`)
    gm_confirm.send("For every user, please say `!g setrole @mention ROLE`, where ROLE is any of " + VALID_ROLES)
  })
}

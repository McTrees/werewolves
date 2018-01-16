const events = require("events")
const config = require("../config")
const fs = require("fs")

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

  }
};

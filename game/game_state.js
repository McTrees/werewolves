// functions for managing game state
// such as, whether a game is in progress, whether signups are closed,
// what season this is, what day/night we're on
// etc.
// stored in a file called state.json

// state_num values:
// 0 - off
// 1 - signups open
// 2 - signups closed, assigning roles
// 3 - roles sent, awaiting start
// 4 - game in progress

// day/night numbering:
// game start         :   day 0   : {night_time: false, day_num: 0}
// first night        :  night 1  : {night_time: true,  day_num: 1}
// first lynching day :   day 1   : {night_time: false, day_num: 1}
// etc.
// in other words: number gets incremented day->night, but not night->day.


// available things:
  // exports.init()                : init function, to be called when program starts
  // exports.data()                : promise of contents of state.JSON
  // exports.set_state_num(v)      : }
  // exports.set_season_code(v)    :  } you can probably guess these 3
  // exports.set_day(night_time, n): }

// TODO in the future probably: make this use getters and setters rather than lots of functions

const fs = require("fs")
const path = require("path")
const filename = path.join(__dirname, "state.json")
const defaults = {
  state_num: 0,
  season_code: "??",
  day_num: 0,
  night_time: false
}
const nice_names = {
  0: "off",
  1: "signups open",
  2: "assigning roles",
  3: "awaiting start",
  4: "game in progress"
}

const utils = require("../utils")

exports.init = function() {
  // called when program starts
  // creates file if it doesn't exist, and if it does it checks it's valid
  if (fs.existsSync("game/state.json")) {
    // it exists, so do some checks
    fs.readFile(filename, {encoding: 'utf-8'}, function(err, data){
      try {
        var pdata = JSON.parse(data)
        if (0 <= pdata.state_num && pdata.state_num <= 4) {
          // good
          utils.infoMessage(`game state is currently '${nice_names[pdata.state_num]}' (#${pdata.state_num}) `)
        } else {
          // bad
          throw "out of range"
        }

      } catch(e) {
        // oh no, the json file isn't valid!
        // better complain loudly and stop the process
        utils.errorMessage("Game state file is corrupted or invalid! please fix this, or delete the file to fix automatically")
        process.exit(1)
        /*fs.unlink(filename, function(err) {
          if (err) {throw err; }
          create_with_defaults(false)
        })*/
      }
    })
  } else {
    // need to create one with some sensible defaults.
    create_with_defaults(true)
  }
}

function create_with_defaults(warn) {
  if (warn) {
    utils.warningMessage("game state file not found - creating a new one")
  }
  fs.writeFile(filename, JSON.stringify(defaults), function(err) {
    if (err) {throw err;}
  })
}

exports.data = function() {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, {encoding: 'utf-8'}, function(err, data) {
      if (err) {throw err;}
      resolve(data)
    })
  });
}

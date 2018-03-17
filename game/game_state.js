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
// (time value)
// game start         :   0
// first night        :   1
// first lynching day :   2
// etc.
// in other words: even = day, odd = night.


// available things:
  // exports.nice_names            : nice names for game states
  // exports.init()                : init function, to be called when program starts
  // exports.data()                : contents of state.json
  // exports.is_day(n)
  // exports.nice_time(t)
  // exports.set_state_num(v)      : }
  // exports.set_season_code(v)    :  } you can probably guess these 4
  // exports.set_day(n)            :  }
  // exports.set_season_name(n)    : }

// utility things:
  // exports.next_day_or_night()   : goes to the next day or night.

// TODO in the future probably: make this use getters and setters rather than lots of functions

const fs = require("fs")
const path = require("path")
const filename = path.join(__dirname, "state.json")
const max_state = 4
const season_code_max_length = 8

const defaults = {
  state_num: 0,
  season_code: "??",
  season_name: "No Season Name Yet!",
  time: 0
}

const nice_names = {
  0: "pre-signups",
  1: "signups open",
  2: "assigning roles",
  3: "roles sent, awaiting start",
  4: "game in progress"
}
exports.nice_names = nice_names

const utils = require("../utils")

exports.init = function(reset) {
  // called when program starts
  // creates file if it doesn't exist, and if it does it checks it's valid
  if (reset) {
    create_with_defaults(true)
  } else {
    if (fs.existsSync("game/state.json")) {
      // it exists, so do some checks
      fs.readFile(filename, {encoding: 'utf-8'}, function(err, data){
        try {
          var pdata = JSON.parse(data)
          if (0 <= pdata.state_num && pdata.state_num <= max_state) {
            // good
            utils.infoMessage(`game state is currently '${nice_names[pdata.state_num]}' (#${pdata.state_num}) `)
          } else {
            // bad
            throw new Error("out of range")
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
      create_with_defaults(false)
    }
  }
  init_kill(reset)
}

function create_with_defaults(reset) {
  utils.warningMessage(reset?"resetting game state":"game state file not found - creating a new one")
  fs.writeFile(filename, JSON.stringify(defaults), function(err) {
    if (err) {throw err;}
  })
}

function init_kill(reset) {
  if (reset) {
    create_kill_with_defaults(true)
  } else {
    if (fs.existsSync("game/kill_queue.json")) {
      // it exists, so do some checks
      fs.readFile(filename, {
        encoding: 'utf-8'
      }, function(err, data) {
        try {
          var pdata = JSON.parse(data)
          if (0 <= pdata.state_num && pdata.state_num <= max_state) {
            // good
          } else {
            // bad
            throw "out of range"
          }
        } catch (e) {
          // oh no, the json file isn't valid!
          // better complain loudly and stop the process
          utils.errorMessage("Kill Queue file is corrupted or invalid! please fix this, or delete the file to fix automatically")
          process.exit(1)
          /*fs.unlink(filename, function(err) {
            if (err) {throw err; }
            create_with_defaults(false)
          })*/
        }
      })
    } else {
      // need to create one with some sensible defaults.
      create_kill_with_defaults(false)
    }
  }
}

function create_kill_with_defaults(reset) {
  utils.warningMessage(reset ? "resetting kill queue" : "kill queue file not found - creating a new one")
  fs.writeFile("game/kill_queue.json", JSON.stringify([]), function(err) {
    if (err) {
      throw err;
    }
  })
}

exports.data = function() {
  var r = require("./state.json")
  utils.debugMessage(`get state data called, data is ${JSON.stringify(r)}`)
  return r
}

function set_data(d) {
  var datastring = JSON.stringify(d)
  utils.debugMessage(`set_data : ${datastring}`)
  fs.writeFile(filename, datastring, function(err) {
    if (err) {throw err ;}
  })
}

exports.set_state_num = function(v) {
  // sets state_num to v
  if (typeof v == "number" && (0 <= v && v <= max_state)) {
    var data = exports.data()
    data.state_num = v
    set_data(data)
  }
}

exports.set_season_code = function(v) {
  // sets season code to v
  if (typeof v == "string" && v.length <= season_code_max_length) {
    var data = exports.data()
    data.season_code = v
    set_data(data)
  }
}

exports.set_season_name = function(n) {
  // sets season name to n
  var data = exports.data()
  data.season_name = n
  set_data(data)
}

exports.set_time = function(n) {
  // sets state_num to v
  if (typeof n == "number" && n >= 0) {
      var data = exports.data()
      data.time = n
      set_data(data)
  }
}

exports.next_day_or_night = function() {
  // next day or night :p
    var data = exports.data()
    data.time += 1
    set_data(data)
}

exports.is_day = function(n = exports.data().time) {
  // true if n is day time, false if n is night time
  return (n % 2) == 0 // even numbers are day time
}

exports.nice_time = function(t) {
  return `${exports.is_day(t)?"Day":"Night"} #${Math.floor(t/2)} (Time period \`${t}\`)`
}

utils = require("../utils")
fs = require("fs")
path = require("path")

try {
  var stats = require( path.resolve( __dirname, "./stats.json" ) )
} catch(err) {
  utils.warningMessage("Resetting today's stats because erors are fun")
  json = `
  {
      "Messages": 0,
      "GMPings": 0,
      "CCCreations": 0
  }`
  fs.writeFileSync("./analytics/stats.json", json, 'utf8')
  var stats = require( path.resolve( __dirname, "./stats.json" ) )
}


exports.increment = function(thing, amount) {

  stats[thing] = stats[thing] + amount
  utils.debugMessage("Incrementing " + thing + ": Got " + stats[thing])
  fs.writeFileSync( path.resolve( __dirname, "./stats.json" ) , JSON.stringify(stats), 'utf8'); // write it back
}

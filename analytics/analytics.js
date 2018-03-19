utils = require("../utils")
fs = require("fs")
path = require("path")

const STATS_PATH = "./analytics/stats.json"
const DEFAULTS = JSON.stringify(
{
    "Messages": 0,
    "GMPings": 0,
    "CCCreations": 0
})

if (!fs.existsSync(STATS_PATH)) {
  utils.warningMessage("Resetting stats on startup")
  fs.writeFileSync(STATS_PATH, DEFAULTS, 'utf8')
}


exports.reset_data = function(confirm) {
  if (confirm) {
    utils.infoMessage("Resetting stats")
    fs.writeFileSync(STATS_PATH, DEFAULTS, 'utf8')
  }
}
exports.increment = function(thing, amount) {
  var stats_r = fs.readFileSync(STATS_PATH)
  var stats = JSON.parse(stats_r)
  stats[thing] = stats[thing] + amount
  fs.writeFileSync(STATS_PATH , JSON.stringify(stats), 'utf8'); // write it back
}

exports.get_stats = function() {
  return JSON.parse(fs.readFileSync(STATS_PATH))
}

exports.on_death = function(kill_desc, game, me) {
  return true // a basic innocent always dies
}

exports.win_teams = {}
exports.win_teams.starts_on = ["innocents"]
// starts off on the innocents win team

exports.win_teams.wins_with = "innocents"
// wins when the only people left are on the innocents win team

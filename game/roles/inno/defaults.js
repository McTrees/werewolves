exports.on_death = function(kill_desc, game, me) {
  return true // a basic innocent always dies
}

exports.tags = {}
exports.win_teams.initial = ["w_innocents"]
// starts off on the innocents win team

exports.win_teams.wins_with = "w_innocents"
// wins when the only people left are on the innocents win team

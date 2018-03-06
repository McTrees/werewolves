exports.name = "Angel"
exports.description = "Wins if they die on the first lynch"

exports.on_death = function(kill_desc, game, me) {
  if (kill_desc.by == "l" && game.state.time == 2) {
    game.masters.send(`<@${me.id}> was lynched on the first day; They win!`)
    game.win([me.id])
    return false // didn't die
  } else {
    return true // did die
  }
}

exports.name = "Runner"
exports.description = "can run away from the werewolves once"

exports.on_death = function(kill_desc, game, me) {
  if (kill_desc.by == "w") {
    game.masters.send(`<@${me.id}> was killed by werewolves so they ran away`)
    me.role = "inno/basic"
    return false // didn't die
  } else {
    return true // did die
  }
}

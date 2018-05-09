//sacred werewolf role

exports.name = "Sacred Werewolf"
exports.description = "Sacred Werewolf. Cannot be killed at night."

exports.on_death = function(kill_desc, game, me) {
  if (kill_desc.by !== "l") { // not lynch - survives
    game.masters.tell(me.id, "someone attempted to kill me, but i'm sacred so I'm ok :)")
    return false // didn't die
  } else {
    return true // did die
  }
}

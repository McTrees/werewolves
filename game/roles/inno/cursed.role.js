exports.name = "Cursed Civilian "
exports.description = "will become werewolf on death"

exports.on_death = function(kill_desc, game, me) {
  if (kill_desc.by == "w") {
    game.masters.send(`<@${me.id}> was attacked by the werewolves! However, as they were a **Cursed Civilian**, they have now become a **Werewolf** and have joined the wolf pack.`)
    me.role = "wolf/werewolf"
    return false // didn't die
  }
  return true // did die
}

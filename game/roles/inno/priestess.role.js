exports.name = "Priestess"
exports.description = "Can purify one player per night"

exports.abilities = {}
exports.abilties.purify = {
  name: "Purify",
  desc: "Turn a cursed civilian into an innocent, or a sacred wolf into a regular wolf",
  timings: {
    allow_day: false,
    periods: 2
  },
  run(game, me, args, cb) {
    game.masters.tell(me.id, `purifying <@${args[0]}>`)
    game.u.resolve_to_id(args[0]).then(id=>{
      var pl = game.player(id)
      if (pl.role == "inno/cursed"){
        pl.role = "inno/basic"
        cb(true, "**Positive**: that player was a Cursed Civilian or Sacred Werewolf, and has been purified to either an Innocent or Werewolf, respectively.")
      } else if (pl.role == "wolf/sacredwolf") {
        pl.role = "wolf/werewolf"
        cb(true, "**Positive**: that player was a Cursed Civilian or Sacred Werewolf, and has been purified to either an Innocent or Werewolf, respectively.")
      } else if (pl.role == "inno/basic" || pl.role == "wolf/werewolf") {
        cb(true, "**Neutral**: that player was already an Innocent or Werewolf, and their role has been changed.")
      } else {
        cb(true, "**Negative**: that player was not a Cursed Civilian, Sacred Werewolf, Innocent, or Werewolf, and their role has not been changed.")
      }
    }).catch(()=>{
      cb(false, "could not find that player")
    })
  }
}

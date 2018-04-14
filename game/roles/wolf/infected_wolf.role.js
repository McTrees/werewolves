exports.name = "Infected Wolf"
exports.description = "Can turn one werewolf into a player each night."

exports.abilities = {} //Because Javascript
exports.abilities.curse = {
  name: "infect",
  desc: "Turn a player into a werewolf",
  timings: {
    periods: 2,
    allow_day: false
  },
  run(game, me, args, cb) {
    game.masters.tell(`attempting to infect ${args[0]}`)
    game.u.resolve_to_id(args[0]).then(t => {
      p = game.player(t)
      if (p.role == "wolf/werewolf") {
        cb(true, `Your infection result is **neutral**. You haven't infected ${t}, because they already were a **WEREWOLF**!`)
        return
      }
      p.role = "wolf/werewolf"
      p.tell("**You have been turned into a werewolf.**")
      cb(true, `Your infection result is **positive**. You have infected ${t} successfully, and they are now a **Werewolf**!`)
    })
  }
}

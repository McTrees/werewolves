// o.o
const KILL_ROLES = [ // not all of these roles are done and the names might change
  "vamp/vampire",
  "vamp/undead",
]

exports.name = "Exorcist" // i think i spelled that right
exports.description = "Every night, the Exorcist may choose a player to undoom"

exports.abilities = {}
exports.abilities.undoom = {
  timings: {
    periods:2,
    allow_day:false
  },
  name: "Undoom",
  desc: "Un-demonise or kill someone affiliated with vampires"
  run(game, me, args, cb) {
    game.masters.tell("attempting to undoom "+args[0])
    game.u.resolve_to_id(args[0]).then(id=>{
      pl = game.player(id)
      if (KILL_ROLES.includes(pl.role)) {
        game.kill(id, "inno/exorcist")
      } else if (pl.has_tag("demonized")) {
        game.tags.remove_tag(id, "demonized") // secret channel config will need to be done here
      }
    })
  }
}

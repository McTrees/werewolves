exports.name = "Flute Player"
exports.description = "enchants people TODO description"

const ENCHANT_TAG = "enchanted"

exports.tags = {}
exports.tags.initial = [ENCHANT_TAG]
exports.tags.wins_with = ENCHANT_TAG // wins when everyone is enchanted

exports.abilities = {}
exports.abilities.enchant = {
  timings: {
    periods: 2,
    allow_day: false,
    number_times: 2 // can enchant 2 people every night
  },
  name: "Enchant",
  desc: "Cause one player to be enchanted",
  run(game, me, args, cb) {
    game.masters.tell(me.id, `enchanting ${args[0]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      game.u.get_role(id).then(r=>{
        if (r === undefined) {
          cb(false, "couldn't powder that person")
        } else if (r == "solo/flute") {
          cb(false, "that person was a flute player! try again")
        } else {
          game.tags.has_tag(id, ENCHANT_TAG).then(has=>{
            if (!has) {
              game.tags.add_tag(id, ENCHANT_TAG)
              cb(true, `successfully enchanted <@${id}>`)
            } else {
              cb(false, `they are already enchanted! try again`)
            }
          })
        }
      })
    }).catch(e=>{
      cb(false, "couldn't enchant that person")
    })
  }
}

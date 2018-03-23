//Pyromancer role
exports.name = "Pyromancer"

exports.description = "Powders a player per night, or can ignite all powdered players."

const POWDER_TAG = "powdered"

exports.abilities = {} //Because Javascript
exports.abilities.powder = {
  timings : {
    periods : 2,
    allow_day : false
  },
  name: "Powder",
  desc: "Powder one player. Usable once per night.", //TODO: Make timeframe work
  run(game, me, args, cb) {
    game.masters.tell(me.id, `powdering ${args[0]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      game.u.get_role(id).then(r=>{
        if (r === undefined) {
          cb(false, "couldn't powder that person")
        } else if (r == "solo/pyro") {
          cb(false, "that person was a pyromancer! try again")
        } else {
          game.tags.has_tag(id, POWDER_TAG).then(has=>{
            if (!has) {
              game.tags.add_tag(id, POWDER_TAG)
              cb(true, `successfully powdered <@${id}>`)
            } else {
              cb(false, `they are already powdered! try again`)
            }
          })
        }
      })
    }).catch(e=>{
      cb(false, "couldn't powder that person")
    })
  }
}
exports.abilities.ignite = {
  timings : {
    allow_night : false
  },
  name: "Ignite",
  desc: "Ignite (kill) all players who have been powdered",
  run(game, me, args, cb) {
    game.masters.tell(me.id, `igniting all powdered players`)
    game.all_with_tag("powdered").then(list=>{
      if (list === []) {
        cb(false, "no powdered players! try powdering someone")
      } else {
        list.forEach(person=>person.kill("pyro"))
        cb(true, `killed ${list.length} people`)
      }
    })
  }
}

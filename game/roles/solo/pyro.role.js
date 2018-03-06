//Pyromancer role
exports.name = "Pyromancer"

exports.description = "Powders a player per night, or can ignite all powdered players."

exports.abilities = {} //Because Javascript
exports.abilities.powder = {
  timings = {
    periods : "2",
    allow_day = false
  }
  name: "Powder",
  desc: "Powder one player. Usable once per night.", //TODO: Make timeframe work
  run(game, me, args, cb) {
    game.masters.tell(`powdering <@${args[0]}>`)
    game.u.resolve_to_id(args[0]).then(id=>{
      game.tags.add_tag(id, "powdered")
      cb(true)
      me.tell(`successfully powdered <@${args[0]}>`)
    }).catch(e=>{
      me.tell("couldn't powder that person")
      cb(false)
    })
  }
}
exports.abilities.ignite = {
  timings = {
    allow_night = false
  }
  name: "Ignite",
  desc: "Ignite (kill) all players who have been powdered",
  run(game, me, args, cb) {
    game.masters.tell(`igniting all powdered players`)
    game.all_with_tag("powdered").then(list=>{
      if (list === []) {
        me.tell("no powdered players! try powdering someone")
        cb(false)
      } else {
        list.forEach(person=>person.kill("pyro"))
        me.tell(`killed ${list.length} people`)
      }
    })
  }
}

exports.name = "Tanner"
exports.description = "Can disguise anyone as another role for a night"

exports.abilities = {} //Because Javascript
exports.abilities.disguise = {
  timings : {
    periods : 2,
    allow_day : false
  },
  name: "disguise",
  desc: "Disguise anyone as another role.",
  run(game, me, args, cb) {
    game.masters.tell(me.id, `disguiseing <@${args[0]}> as ${args[1]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      game.rels.add_rel(id, "disguised_as", args[1])
      cb(true)
    }).catch(e=>{
      cb(false, "couldn't disguise that person")
    })
  }
}

exports.on_night_to_day = function(game, me) {
  game.rels.all_of_type("disguised_as").then(rows=>{
    rows.forEach(row=>{
      game.rels.remove_rel(row.affector_id, "disguised_as", row.affectee_id)
    })
  })
}

exports.name = "Tanner"
exports.description = "Can disguise anyone as another role for a night"

exports.abilities = {} //Because Javascript
exports.abilities.disguise = {
  timings : {
    periods : 2,
    allow_day : false
  },
  name: "disguise",
  desc: "disguise peeps",
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

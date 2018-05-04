exports.name = "Warlock"
exports.description = "Can check which role a player is"

exports.abilities = {} //Because Javascript
exports.abilities.tell = {
  timings : {
    periods : 2,
    allow_day : false
  },
  name: "Tell",
  desc: "Can check which role a player is",
  run(game, me, args, cb) {
    game.masters.tell(me.id, `Checking the Role of <@${args[0]}>`)
    if (me.has_tag("enchanted")) {
      game.u.resolve_to_id(args[0]).then(id=>{
        utils.disguised_role(id).then(role=>{
          if (me.has_tag("enchanted" && Math.random > 1/10 * 6) {
            role = "solo/flute"
          }
          cb(true, `<@${args[0]}> has the role: ${role}`)
        })
      }).catch(e=>{
        cb(false, "couldn't get the role of that person")
      })
    }
  }
}

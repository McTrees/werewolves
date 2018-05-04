exports.name = "Aura Teller"
exports.description = "Can check whether a player is in the wolf pack"

var wolfpack_roles = ["werewolf","sacred_werewolf","white_werewolf"]

exports.abilities = {} //Because Javascript
exports.abilities.tell = {
  name: "Tell",
  desc: "Can check whether a player is in the wolf pack",
  timings : {
    periods : "2",
    allow_day : false
  },
  run(game, me, args, cb) {
    game.masters.tell(me.id, `checking the Aura of <@${args[0]}>`)
    game.u.resolve_to_id(args[0]).then(id=>{
      if (wolfpack_roles.includes(user.get_role(id))) {
        cb(true)
        me.tell(`that player is in the wolf pack`)
      }else{
        cb(true)
        me.tell(`that player is not in the wolf pack`)
      }
    }).catch(e=>{
      me.tell("couldn't tell the aura of that person")
      cb(false)
    })
  }
}

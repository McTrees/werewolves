exports.name = "Priest"
exports.description = "Can either kill a werewolf or die"

exports.abilities = {}
exports.abilities.sprinkle = {
  name: "Sprinkle",
  desc: "If target is a werewolf, kill them; otherwise, kill the priest",
  timings: {
    allow_day: false,
    periods: 2
  },
  run(game, me, args, cb) {
    game.masters.tell(me.id, `sprinkling <@${args[0]}>`)
    game.u.resolve_to_id(args[0]).then(id=>{
      var pl = game.player(id)
      pl.role.then(r=>{
        if (r.startsWith("wolf/")){
          game.kill(id)
          cb(true, "that player was on the werewolf team and will now die")
        } else {
          game.kill(me.id)
          cb(true, "uh oh! that player was not on the werewolf team, so you'll die instead!")
        }
      })  
    }).catch(()=>{
      cb(false, "could not find that player")
    })
  }
}

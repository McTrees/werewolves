// white werewolf role

exports.name = "White Werewolf"
exports.description = "Kills a single wolf per 2 nights"

const wolfpack_roles = require("../util_fns").wolfpack_roles

exports.abilities = {}
exports.abilities.kill = {
  name: "kill",
  desc: "Kill a werewolf",
  timings : {
    periods : 4,
    allow_day : false
  },
  run(game, me, args, cb) {
    game.masters.tell(me.id, `attempting to white wolf kill ${args[0]}`)
    game.u.resolve_to_id(args[0]).then(t=> {
      p = game.player(t)
      p.role.then(r=>{
        if (wolfpack_roles.includes(r)) {
          game.kill(t)
          cb(true, `successfully killed ${p}`)
        } else {
          cb(fals, `${p} is not in the wolf pack, so you can't kill them`)
        }
      })
    })
  }
}

// white werewolf role

exports.name = "White Werewolf"
exports.description = "Kills a single wolf per 2 nights"

exports.extra_secret_channels = ["wolf/werewolf"]

exports.abilities = {}
exports.abilities.kill = {
  name: "kill",
  desc: "Kill anyone (Can be werewolf; doesn't have to be)",
  timings : {
    periods : 4,
    allow_day : false
  },
  run(game, me, args, cb) {
    game.masters.tell(`<@${me.id}> is attempting to white wolf kill ${args[0]}`)
    game.u.resolve_to_id(args[0]).then(t=> {
      p = game.player(t)
      game.add_to_kill_q(args[0], "ww", client)
    })
  }
}

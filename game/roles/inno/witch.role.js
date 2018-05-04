exports.name = "Witch"
exports.description = "todo"

exports.tags = {}
exports.tags.initial = ["has_nodeath_potion", "has_kill_potion"]

exports.abilities = {}

exports.abilities.kill = {
  timings: {
    allow_night: false
  },
  run(game, me, args, cb) {
    if (!me.has_tag("has_kill_potion")) {
      cb(false, "you no longer have that potion. most likely, you have already used it!")
    } else {
      game.u.resolve_to_id(args[0]).then(id=>{
        game.kill(id, "witch")
        game.tags.remove_tag(me.id, "has_kill_potion")
        game.masters.tell(me.id, `witch killing <@${id}>`)
        cb(true, `killed <@${id}>`)
      }).catch(err=>{
        cb(false, "could not kill that person")
      })
    }
  }
}

exports.abilities.protect = {
  timings: {
    allow_day: false
  },
  run(game, me, args, cb) {
    if (!me.has_tag("has_nodeath_potion")) {
      cb(false, "you no longer have that potion. most likely, you have already used it!")
    } else {
      game.tags.remove_tag(me.id, "has_nodeath_potion")
      game.tags.add_tag(me.id, "using_nodeath_potion")
      game.masters.tell(me.id, "using no-death potion!")
      cb(true, "no one will die tonight")
    }
  }
}

exports.on_night_to_day = function(game, me) {
  if (me.has_tag("using_nodeath_potion")) {
    game.kill_q.write([]) // clear kill_q
    game.tags.remove_tag(me.id, "using_nodeath_potion")
  }
}

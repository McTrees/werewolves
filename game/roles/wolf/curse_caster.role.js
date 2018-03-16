exports.name = "Curse Caster"
exports.description = "Can change an innocents's role to Cursed Civilian."

exports.abilities = {} //Because Javascript
exports.abilities.curse = {
  name: "curse",
  desc: "Turn an innocent into a cursed one. (Usage: [curse <@person>])",
  timings : {
    periods : "2",
    allow_day : false
  },
  run(game, me, args, cb) {
    game.masters.tell(`<@${me.id}> is attempting to curse ${args[0]}`)
    game.u.resolve_to_id(args[0]).then(t=>{
      p = game.player(t)
      if(p.role == "inno/cursed") {
        cb(true, "Your curse result is **neutral**. You haven't cursed <@${t}>, because they already were a **Cursed Civilian**!")
        if(p.role == "inno/basic") {
          p.role = "inno/cursed"
          p.tell("**You have been cursed!** The curse caster has chosen you, an innocent, to get cursed!\nThis means that if the werewolves attack you, you will now become a werewolf yourself!")
          cb(true, "Your curse result is **positive**. You have cursed <@${t}> successfully, and they are now a **Cursed Civilian**!")
        } else {
          me.tell()
          cb(true, "Your curse result is **negative**. <@${t}> wasn't an innocent, so they haven't been cursed!")
        }
      }
    })
  }
}

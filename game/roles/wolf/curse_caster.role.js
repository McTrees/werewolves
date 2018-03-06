exports.name = "Curse Caster"
exports.description = "Can change an innocents's role to Cursed Civilian."

exports.abilities = {} //Because Javascript
exports.abilities.curse = {
  name: "curse",
  desc: "Turn an innocent into a cursed one. (Usage: [curse <@person>])",
  timings = {
    periods : "2",
    allow_day = false
  }
  run(game, me, args, cb) {
      game.masters.tell(`<@${me.id}> is attempting to curse ${args[0]}`)
      t = await game.u.resolve_to_id(args[0])
      p = game.player(t)
      if(p.role == "inno/basic") {
        p.role = "inno/cursed" //99% sure this won't work
        p.tell("You've been cursed! Now when you die, you shall become a werewolf!")
        cb(true)
      }
    }else{
      me.tell("Sorry, but that user is unable to be cursed!")
      cb(false)
    }
  }
}

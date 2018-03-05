exports.name = "Curse Caster"
exports.description = "Can change an innocents's role to Cursed Civilian."

exports.abilities = {} //Because Javascript
exports.abilities.curse = {
  name: "curse",
  desc: "Turn an innocent into a cursed one. (Usage: [curse])",
  timings.periods = "2"
  timings.allow_day = false
  run(game, me, args, cb) {
      game.masters.tell(`<@${me.id}> is attempting to curse ${args[0]}`)
      r = await user.get_role(args[0])
      if(r == "inno/basic") {
        r.role = "inno/cursed" //99% sure this won't work
        r.tell("You've been cursed! Now when you die, you shall become a werewolf!")
        cb(true)
      }
    }else{
      me.tell("Sorry, but that user is unable to be cursed!")
      cb(false)
    }
  }
}

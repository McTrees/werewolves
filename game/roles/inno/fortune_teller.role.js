exports.name = "Fortune Teller"
exports.description = "Can check which role a player is"

exports.abilities = {} //Because Javascript
exports.abilities.tell = {
  name: "Tell",
  desc: "Can check which role a player is",
  tell(game, me, args, cb) {
    if (game.night_time == false){
      me.tell("you can only get the role of someone at night")
      cb(false);
      return;
    }
    game.masters.tell(`Checking the Role of <@${args[0]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      role = user.get_role(id)
      me.tell(`<@${args[0]} has the role: ${role}`)
      cb(true)
    }).catch(e=>{
      me.tell("couldn't get the role of that person")
      cb(false)
    })
  }
}

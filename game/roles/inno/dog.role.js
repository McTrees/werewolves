exports.name = "Dog"
exports.description = "Can choose their role on the first night"

exports.abilities = {} //Because Javascript
exports.abilities.become = {
  name: "become",
  desc: "choose the role they would like to become",
  become(game, me, args, cb) {
    if(args[0].toUpperCase() == "WEREWOLF"){
      game.masters.tell(`Changing the role of <@${me.id} to wolf/werewolf`)
      me.role = "wolf/werewolf"
    } else if( args[0].toUpperCase() == "INNOCENT"){
      game.masters.tell(`Changing the role of <@${me.id} to inno/basic`)
      me.role = "inno/basic"
    } else if(args[0].toUpperCase() == "CURSED CIVILIAN"){
      game.masters.tell(`Changing the role of <@${me.id} to inno/cursed`)
      me.role = "inno/cursed"
    }else{
      me.tell("that is not a valid role, roles include `innocent`, `werewolf` and `cursed civilian`")
    }
  }
}

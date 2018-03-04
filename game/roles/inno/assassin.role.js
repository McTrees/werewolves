exports.name = "Assasin"
exports.description = "Can assassinate one player per night, exept the first night"

exports.abilities = {} //Because Javascript
exports.abilities.assasinate = {
  name: "Assasinate",
  desc: "Assasinate one player. Usable once per **TODO**", //TODO: Make timeframe work
  assasinate(game, me, args, cb) {
    game.masters.tell(`Assasinating <@${args[0]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      if (game.state.day_num == 1 && game.state.night_time == false){
        cb(false)
        me.tell(`You can't assasinate on the first night`)
      }else{
        game.player(id).kill("assasinated")
        cb(true)
        me.tell(`successfully assassinated <@${args[0]}>`)
      }
    }).catch(e=>{
      me.tell("couldn't assassinate that person")
      cb(false)
    })
  }
}

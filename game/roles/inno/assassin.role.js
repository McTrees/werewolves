exports.name = "Assasin"
exports.description = "Can assassinate one player per night, exept the first night"

exports.abilities = {} //Because Javascript
exports.abilities.assasinate = {
  timings : {
    periods : "2",
    allow_day : false
  },
  name: "Assasinate",
  desc: "Assasinate one player. Usable once per night",
  run(game, me, args, cb) {
    game.masters.tell(`Assasinating <@${args[0]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      if (game.state.time > 2){
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

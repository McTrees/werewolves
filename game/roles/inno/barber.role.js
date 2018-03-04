exports.name = "Barber"
exports.description = "Can kill one player, exept the first night"

exports.abilities = {} //Because Javascript
exports.abilities.kill = {
  name: "Kill",
  desc: "kill one player.",
  kill(game, me, args, cb) {
    game.masters.tell(`Barber-killing <@${args[0]}`)
    game.u.resolve_to_id(args[0]).then(id=>{
      if (game.state.day_num == 1 && game.state.night_time == false){
        cb(false)
        me.tell(`You can't kill on the first day`)
      }else if(game.state.night_time == true){
        cb(false)
        me.tell(`You can't kill during the night`)
      }else{
        if (args[1] == true){
          game.masters.tell(`The barber would like be announced`)
          me.tell(`You will be announced as barber`)
        } else{
          me.tell(`You won't be announced as barber`)
        }
        game.player(id).kill("barber-killed")
        cb(true)
        me.tell(`successfully killed <@${args[0]}>`)
      }
    }).catch(e=>{
      me.tell("couldn't kill that person")
      cb(false)
    })
  }
}

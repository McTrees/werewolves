exports.name = "Barber"
exports.description = "Can kill one player, exept the first night"

exports.abilities = {} //Because Javascript
exports.abilities.kill = {
  name: "Kill",
  desc: "kill one player.",
  timings : {
    allow_night : false
  },
  run(game, me, args, cb) {
    game.masters.tell(me.id, `barber-killing <@${args[0]}>`)
    game.u.resolve_to_id(args[0]).then(id=>{
      if (game.state.time == 1){
        cb(false)
        me.tell(`You can't kill on the first day`)
      }else{
        if (args[1] == true){
          game.masters.tell(me.id, `the barber would like be announced`)
          me.tell(`You will be announced as barber`)
        } else{
          me.tell(`You won't be announced as barber`)
        }
        game.player(id).kill("barber-killed");//Do NOT change the word "barber-killed"
        cb(true)
        me.tell(`successfully killed <@${args[0]}>`)
      }
    }).catch(e=>{
      me.tell("couldn't kill that person")
      cb(false)
    })
  }
}

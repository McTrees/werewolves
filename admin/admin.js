const discord = require("discord.js")
const gm_confirm_channel_id = require("../config").channel_ids.gm_confirm

exports.confirm = function(confirm_msg, client) {
  // posts confirm_msg to the confirm channel
  // resolves true if accepted, false if denied, and rejects if timed out
  return new Promise(function(resolve, reject) {
    let gm_confirm_channel = client.channels.get(gm_confirm_channel_id)
    gm_confirm_channel.send(confirm_msg
      + "\n*Please react with `:white_check_mark:`* (\\✅, ✅) *to confirm.*"
      + "\n*Alternatively react with `:negative_squared_cross_mark:`* (\\❎, ❎) *to deny."
      + "\n*This will automatically be denied in 1 hour.*"
      ).then(msg=>{
        let rc = new discord.ReactionCollector(msg, mr => {
          mr.emoji.name === "✅" || mr.emoji.name === "❎"
        }, {time: 60*60*1000}) // 60 mins, 60 secs, 1000 millsecs
        rc.on("collect", (mr) => {
          rc.stop()
          if (mr.emoji.name === "✅") {
            resolve(true)
          } else if (mr.emoji.name === "❎") { // this could be an `else` but if the filter changes it would break
            resolve(false)
          }
        })
        rc.on("end", (col, reas) => {
          if (reas === "time") { //not stopped by us so must have timed out
            reject()
          }
        })
    })
  });
}

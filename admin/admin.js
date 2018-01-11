const discord = require("discord.js")
const gm_confirm_channel_id = require("../config").gm_confirm_channel_id

exports.confirm = function(confirm_msg, client) {
  // posts confirm_msg to the confirm channel
  // resolves if accepted, rejects if declined or timed out
  return new Promise(function(resolve, reject) {
    let gm_confirm_channel = client.channels.get(gm_confirm_channel_id)
    gm_confirm_channel.send(confirm_msg
      + "\n*Please react with `:white_check_mark:`* (\\✅, ✅) *to confirm*"
      ).then(msg=>{
        let rc = new discord.ReactionCollector(msg, mr => mr.emoji.name === "✅")
        rc.on("collect", (mr) => {
          rc.stop()
          resolve()
      })
    })
  });
}

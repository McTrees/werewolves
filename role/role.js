const role_manager = require("../game/role_manager")
const config = require("../config")

exports.commands = {}
exports.commands.info = function(msg, client, rn) {
  // sends the user info about a role
  // expects a role name, such as inno/basic
  try {
    msg.channel.send(`${role_manager.role(rn).documentation}`)
  } catch (err) {
      msg.reply("that isn't a valid role name. use `"+ config.bot_prefix + "r list` for a list of roles")
  }
}

exports.commands.list = function(msg, client, rest) {
  role_manager.all_roles_list().then(function(roles) {
    //msg.reply(roles.join("\n"))

    msg.reply(`**Role List**${roles.map(n=>`\n- \`${n}\` (${role_manager.role(n).name})`)}
*For info on a specific role, type \`!r info ROLE\`, where ROLE is the internal name of the role*`)
  })
}

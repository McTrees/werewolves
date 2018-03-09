const role_manager = require("../game/role_manager")

exports.commands = {}
exports.commands.role_info = function(msg, client, rn) {
  // sends the user info about a role
  // expects a role name, such as inno/basic
  try {
    msg.channel.send(`${role_manager.role(rn).documentation}`)
  } catch (err) {
    role_manager.all_roles_list().then(function(roles) {
      msg.reply("that isn't a valid role name. Here's a list of possible roles: \n" + roles.join("\n"))
  })
  }
}

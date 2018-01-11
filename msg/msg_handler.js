/* this file recieves the message object
   and decides what do do with it

   it calls functions from other files with the message object
*/


module.exports = function(msg, client) {
  if (msg.author == client.user) return; //ignore own messages
  // TODO: make this a proper lookup thing and not just a big if/else
  if (msg.content.startsWith("!signup")) {
    require("../user/user").signupCmd(msg, client);
  } else if (msg.content.startsWith("!confirm")) {
    require("../admin/admin").confirm("test test test", client)
  }
};

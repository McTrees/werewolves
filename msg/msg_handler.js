/* this file recieves the message object
   and decides what do do with it

   it calls functions from other files with the message object
*/


module.exports = function(msg, client) {
  // TODO: make this a proper lookup thing and not just a big if/else
  if (msg.content.startsWith("!signup")) {
    require("../user/user.js").signupCmd(msg, client);
  }
};

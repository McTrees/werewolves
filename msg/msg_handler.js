/* this file recieves the message object
   and decides what do do with it

   it calls functions from other files with the message object
*/


const config = require('../config');
module.exports = function(msg, client) {
  if (msg.author == client.user) return; //ignore own messages
  switch(true){
    case msg.content.startsWith(config.bot_prefix+"signup"):
      require("../user/user").signupCmd(msg, client);break;
  }
};

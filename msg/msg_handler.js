/* this file recieves the message object
   and decides what do do with it

   it calls functions from other files with the message object
*/


const config = require('../config');
module.exports = function(msg, client) {
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
  if (messageContent[0][0] == config.bot_prefix){
    messageContent[0] = messageContent[0].slice(1);
    switch(messageContent[0]){
      case ("u"):
        try{
        console.log(messageContent[1]+"Cmd");
        }catch(err){
          console.log("invalid command");
        }
        break;
      default:
        msg.reply(`\`${msg.content}\` is an unknown command...`);
        break;
      }
  };
};

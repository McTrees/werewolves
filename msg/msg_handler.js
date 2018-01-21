/* this file recieves the message object
and decides what do do with it

it calls functions from other files with the message object
*/
const config = require('../config');
const aliases = require('./aliases');
/*syntax: "alias" :"defined as",
all other arguments that get send with the alias get added to the send
alieses need to be one word
*/

module.exports = function(msg, client) {
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
  if (messageContent[0][0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
    messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    try {
      messageContent = (aliases[messageContent[0]].split(" ").concat(messageContent.slice(1)));
    } catch (err) {} //check aliases
    try {
      switch (messageContent[0]) { //swicth the first part of the command, then run the function of the second part of the command, with any
        case ("u"):
          require("../user/user.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        case ("p"):
          require("../poll/polls.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        case ("c"):
          require("../cc/ccs.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        case ("g"):
          require("../game/game.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2), messageContent.slice(3));
          break;
        case("h"):
          require("../help/main.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        default: //replies if no command found
          msg.reply(`\`${msg.content}\` is an unknown command...`);
          break;
      }
    } catch (err) {
      if (err == "TypeError: require(...)[(messageContent[1] + \"Cmd\")] is not a function") {
        msg.reply(`\`${msg.content}\` is an unknown command...`);
      } else {
        msg.reply(`an error occurred...`)
        if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008" ) || config.developerOptions.showErrorsToUsers == "true")){
          msg.channel.send("the error was: ```" + err + "```")
        }
        console.log(err);
      }
    }
  };
};

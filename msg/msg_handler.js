/* this file recieves the message object
and decides what do do with it

it calls functions from other files with the message object
*/

// CALLING CONVENTION FOR COMMAND FUNCTIONS:
// 1st arg ("msg") = the message object containing the command
// 2nd arg ("client") = the client object representing the discord bot
// 3rd arg ("args") = an array containing the rest of the args.
const config = require('../config');
const aliases = require('./aliases');
const utils = require("../utils")
const permissions = require("./permissions")
/*syntax: "alias" :"defined as",
all other arguments that get send with the alias get added to the send
alieses need to be one word
*/

module.exports = function(msg, client) {
  if (msg.author == client.user) {return}; //ignore own messages
  if (msg.content[0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
    var messageContent = msg.content.split(" ");
    messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    try {
      messageContent = (aliases[messageContent[0]].split(" ").concat(messageContent.slice(1)));
    } catch (err) {;} //check aliases

    // permissions checks

    cmd = messageContent[0] + " " + messageContent[1]
    utils.debugMessage(`Checking ${cmd} against permissions.json`)
    p = permissions.gm_only
    if(permissions.gm_only.includes(cmd)) {
      utils.debugMessage(`Command ${cmd} was in permissions.json; Checking roles now.`)
      if (msg.member.roles.has(config.role_ids.gameMaster)) {
        utils.debugMessage(`User had permissions; continuing execution.`)
      }
      else {
        utils.debugMessage(`User did not have permissions; returning.`)
        msg.reply(config.messages.general.permission_denied)
        return
      }
    }
    else {
      utils.debugMessage(`Anyone can run this command, it was not in permissions.json`)
    }

    try {
      switch (messageContent[0]) { //swicth the first part of the command, then run the function of the second part of the command, with any args
        case ("u"):
          require("../user/user.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        case ("up"):
          require("../user/userprofile.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
	case ("p"):
          require("../poll/polls.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
	  break;
        case ("c"):
          require("../cc/ccs.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        case ("g"):
          require("../game/game.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        default: //replies if no command found
          console.log(["helpCmd"](msg, client, messageContent.slice(1), messageContent.slice(2)))
          msg.reply(`\`${msg.content}\` is an unknown command...`);
          break;
      }
    } catch (err) {
      if ( messageContent.slice(0)=="h"){             //help command
        require("../help/help.js")["helpCmd"](msg, client, messageContent.slice(1), messageContent.slice(2));
      }
      else if (err instanceof TypeError) {
        msg.reply(`\`${msg.content}\` is an unknown command...`);
	utils.debugMessage(err);
      } else {
	msg.reply(`An error occurred...`);
        if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008" ) || config.developerOptions.showErrorsToUsers == "true")){
          msg.channel.send("the error was: ```" + err + "```\nand occurred at: ```" + err.stack + "```");
          utils.errorMessage(`error ${err} at ${err.stack}`);
        }
      }
    }
  };
};

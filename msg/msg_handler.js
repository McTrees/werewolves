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
    p = permissions[cmd]
    if(p == undefined) {
      utils.debugMessage(`Command ${cmd} wasn't in permissions.json; assuming everyone can run it.`)
    }
    else {
      utils.debugMessage(`got ${p} from permissions.json; checking if user has that role now against ${msg.member.roles}.`)
      if (msg.member.roles.has(p)) {
        utils.debugMessage(`User had permission to run command.`)
      }
      else {
        utils.debugMessage(`${p} was not in ${msg.author.roles}, user did not have permission to run command.`)
        msg.reply(config.messages.general.permission_denied)
        return
      }
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
        case("h"):
          require("../help/main.js")[messageContent[1] + "Cmd"](msg, client, messageContent.slice(2));
          break;
        default: //replies if no command found
          msg.reply(`\`${msg.content}\` is an unknown command...`);
          break;
      }
    } catch (err) {
      if (err instanceof TypeError) {
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

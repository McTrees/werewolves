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
const utils = require("../utils");
const role_specific = require("./role_specific_handler")
const permissions = require("./permissions")
/*syntax: "alias" :"defined as",
all other arguments that get send with the alias get added to the send
alieses need to be one word
*/

const FILENAMES = {
  // map first word category names to filenames relative to here
  u: "../user/user.js",
  up: "../user/userprofile.js",
  p: "../poll/polls.js",
  c: "../cc/ccs.js",
  g: "../game/game.js"
}

module.exports = function(msg, client) {
  if (msg.author == client.user) {return}; //ignore own messages
  if (msg.content[0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
    var splitMessage = msg.content.split(" ");

    splitMessage[0] = splitMessage[0].slice(1); //remove the prefix from the message
    var firstWord = splitMessage[0]
    if (aliases[firstWord]) {
      splitMessage = (aliases[firstWord].split(" ").concat(splitMessage.slice(1)));
      var firstWord = splitMessage[0]
    }
    var cmdName = splitMessage[1]
    var rest = splitMessage.slice(2)
    // permissions checks

    cmd = firstWord + " " + cmdName
    utils.debugMessage(`Checking ${cmd} against permissions.json`)
    p = permissions.gm_only
    if(p.includes(cmd)) {
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

    // now run it
    try {
      if (firstWord == "h") { require("../help/help.js")(msg, client, rest)}
      else if (require(FILENAMES[firstWord]).commands[cmdName]) {
        require(FILENAMES[firstWord]).commands[cmdName](msg, client, rest)
      } else if (require(FILENAMES[firstWord])[cmdName + "Cmd"]){
        require(FILENAMES[firstWord])[cmdName + "Cmd"](msg, client, rest)
      } else {
        msg.reply(`\`${msg.content}\` is an unknown command...`);
      }
    } catch (em_all) {
      msg.reply(`An error occurred...`);
      if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008" ) || config.developerOptions.showErrorsToUsers == "true")){
       msg.channel.send("the error was: ```" + em_all + "```\nand occurred at: ```" + em_all.stack + "```");
       utils.errorMessage(`error ${em_all} at ${em_all.stack}`);
    }
    }
  }
}

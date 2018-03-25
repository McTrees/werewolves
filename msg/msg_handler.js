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
const state = require("../game/game_state")
const game = require("../game/game")
const msg = require("./msg_handler")
const didYouMean = require("didYouMean")
const stats = require("../analytics/analytics.js")
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
  g: "../game/game.js",
  r: "../role/role.js"
}
getAllCommands = function() {
  commands = []
  for (i in FILENAMES) {
    start = i
    var iE = require(FILENAMES[i]);
    var iA = Object.keys(iE)
    try {
      var iB = Object.keys(iE.commands)
    } catch (err) {}
    for (j in iA) {
      if (iA[j].endsWith("Cmd")) {
        ting = config.bot_prefix + i + " " + iA[j]
        ting = ting.slice(0, -3)
        commands.push()
      }
    }
    for (k in iB) {
      commands.push(config.bot_prefix + i + " " + iB[k])
    }
  }
  for(var k in aliases) {
    commands.push(config.bot_prefix + k)
  }
  return commands
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = function(msg, client) {
  //msg.content = msg.content.replaceAll("_", "")
  if (msg.author == client.user) {return}; //ignore own messages
  if (message.guild === null){msg.reply("currently you cannot send commands in a DM");return};//prevent DMs
  if (msg.channel.type == "text" && msg.guild.id !== config.guild_id) {return}
  stats.increment("Messages", 1)
  if (msg.content.indexOf(`<@&${config.role_ids.gameMaster}>`) > -1) {
    stats.increment("GMPings", 1)
  }
  if (msg.content[0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
    var splitMessage = msg.content.split(" ");
    splitMessage[0] = splitMessage[0].slice(1); //remove the prefix from the message
    if (splitMessage[1]) {
      msg_cmd_na = splitMessage[0] + " " + splitMessage[1]
    } else {
      msg_cmd_na = splitMessage[0]
    }
        msg_cmd_na = msg_cmd_na.replaceAll("_", "")
        msg_cmd_na = msg_cmd_na.split(" ")
        splitMessage[0] = msg_cmd_na[0]
        if (msg_cmd_na.length > 1) {
          splitMessage[1] = msg_cmd_na[1]
        }


        utils.debugMessage(msg.author +" sent a command: "+ msg.content + ". I interpreted this as "+splitMessage)

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
      // help is special-cased
      if (firstWord == "h") {
        require("../help/help.js")["helpCmd"](msg, client, splitMessage.slice(1), splitMessage.slice(2));
      } else if(firstWord == "guide") {
        require("../help/guide.js")["guideCmd"](msg, client, splitMessage.slice(1), splitMessage.slice(2));
      } else {
        if (!FILENAMES[firstWord]) {
          fail(msg, client, splitMessage)
        } else {
          var root = require(FILENAMES[firstWord])
          if (root.commands && root.commands[cmdName]) {
            root.commands[cmdName](msg, client, rest)
          } else if (root[cmdName + "Cmd"]){
            root[cmdName + "Cmd"](msg, client, rest)
          } else {
            fail(msg, client, splitMessage)
          }
        }
      }
    } catch (em_all) {
      msg.reply(`An error occurred...`);
      if ((config.developerOptions.showErrorsToDevs == "true" && msg.member.roles.has("395967396218667008" ) || config.developerOptions.showErrorsToUsers == "true")){
        if (em_all.stack.length < 1900) {
          msg.channel.send("the error was: ```" + em_all + "```\nand occurred at: ```" + em_all.stack + "```");
        } else {
          msg.channel.send("the error was: ```" + em_all + "```The stack trace is too long for me to send, please check the console.")
        }
        utils.errorMessage(`error ${em_all} at ${em_all.stack}`);
     }
    }
  } else if (msg.content[0] == config.ability_prefix) {
    // ability commands are a bit different
    if (state.data().state_num !== 4) {
      msg.reply("we're not in a game at the moment so you can't do that.")
    } else {
      var no_prefix = msg.content.slice(1)
      var split_msg = no_prefix.split(' ')
      game.use_ability(msg, client, split_msg[0], split_msg.slice(1))
    }
  }
}

function fail(msg, client, splitMessage) {
  // invalid command
  if (splitMessage[1]) {
    msg_cmd = config.bot_prefix + splitMessage[0] + " " + splitMessage[1]
  } else {
    msg_cmd = config.bot_prefix + splitMessage[0]
  }
  const all_commands = getAllCommands()
  probablecommand = didYouMean(msg_cmd, all_commands)
  if (probablecommand == null) {
    msg.reply(`\`${msg_cmd}\` is an unknown command.`)
  } else {
    msg.reply(`\`${msg_cmd}\` is an unknown command. Did you mean \`${probablecommand}\`?`)
  }
}

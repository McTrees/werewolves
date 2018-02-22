const config = require('../config');
const aliases = require('../msg/aliases');
const user = require("../user/user")
const utils = require("../utils")
const discord = require("discord.js")
const path = require("path")
var fs = require('fs')
const glob = require('glob')


exports.helpCmd = function(msg, client, args, cmd) {
  if (msg.content.split(" ").length == 1){
    msg.reply("`help` help")
  }
  console.log(msg.content.split(" ").length == 1)
  utils.debugMessage("helpCmd called with args: '" + args + "' and cmd '" + cmd + "'")
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
   if (messageContent[0][0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
     messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    }

    if (args == [] || args == undefined || args == "") {
      p = "./cmds/"
      const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

      msg.channel.send(`
Help:
**Usage:** !help category commands
**Example:** !help u signup

` + dirs())
      return
}
     else if (cmd == [] || cmd == undefined || cmd == "") {
      glob("**.md", { cwd: path.join(__dirname, "cmds/" + args) }, function(err, matches) {
        if (matches) {
          commands = []
          for (var match in matches) {
            match = matches[match]
            match = match.replace(/\.md$/, "") /*This general section could be a ton more efficient; I'll do that once it works*/
            match = match + "\n"
            match = " - " + match
            commands.push(match)
          }
          msg.channel.send(`**Commands in category ${args}:**\n${commands.join("")}\n\n*Need more help on a command? Use !help ${args} <command>.*`)
        }
        else {
          msg.channel.send("Sorry, but I don't have any commands in that help category. Valid categories are: *[WIP/TODO]*")
        }
      } )
      // msg.reply("This will eventually list all commands in the category specified")
      return

    } else {
      utils.debugMessage(`Help cmd called w/ ${cmd} & ${args}`)
    }

    try {
      messageContent = (aliases[messageContent[0]].split(" ").concat(messageContent.slice(1)));
    } catch (err) {} //check aliases
    utils.debugMessage('Reading file: ' + './help/cmds/' + args[0] + "/" +cmd[0] + '.md')
    try {
    fs.readFile('./help/cmds/' + args[0] + '/' + cmd[0] + '.md', {
      encoding: 'utf-8'
    }, function(err, data) {
      if (err) {
        msg.channel.send("Sorry, I dont have any help for that topic. ")
        return
      }
      msg.channel.send(data);
    })
  } catch (err) {
    msg.channel.send("Sorry, I don't have any help for that topic.")
  }
}

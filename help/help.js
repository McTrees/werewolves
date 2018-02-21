const config = require('../config');
const aliases = require('../msg/aliases');
const user = require("../user/user")
const utils = require("../utils")
const discord = require("discord.js")
const path = require("path")
var fs = require('fs')


exports.helpCmd = function(msg, client, args, cmd) {
  utils.debugMessage("helpCmd called with args:" + args)
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
   if (messageContent[0][0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
     messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    }

    if (args == undefined) {
      msg.reply(`Help:
        **Usage:** !help category commands
        **Example:** !help u signup

        *Possible categories: wip*`)
      return

    } else if (cmd == undefined) {
      msg.reply("This will eventually list all commands in the category specified")
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
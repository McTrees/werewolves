const config = require('../config');
const aliases = require('../msg/aliases');
const user = require("../user/user")
const discord = require("discord.js")
var fs = require('fs')


exports.uCmd = function(msg, client, args) {
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
  if (messageContent[0][0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
    messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    }
    try {
      messageContent = (aliases[messageContent[0]].split(" ").concat(messageContent.slice(1)));
    } catch (err) {} //check aliases

    fs.readFile('./help/cmds' + args[0] + '.md', {
      encoding: 'utf-8'
    }, function(err, data) { //read cc.json to ccconfig
      if (err) {
        msg.channel.send("Sorry, I dont have any help for that topic. ")
      }
      msg.channel.send(data);
}

const config = require('../config');
const aliases = require('../msg/aliases');
const user = require("../user/user")
const discord = require("discord.js")



exports.uCmd = function(msg, client, args) {
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
  if (messageContent[0][0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
    messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    }
    try {
      messageContent = (aliases[messageContent[0]].split(" ").concat(messageContent.slice(1)));
    } catch (err) {} //check aliases
    if (args[0] == "signup") {
      msg.channel.send("```--!u signup--\nDescription: Used to sign up for the next season of werewolves.\nUsage: '!u signup <emoji>' where <emoji> is an actual emoji (eg 💩)\nNotes:\n  Cannot be used whilst a game is in progress.```");
    }
}
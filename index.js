/* werewolves bot */

const config = require('./config');
const token = config.token;

const discord = require('discord.js');
const client = new discord.Client();

const msg_handler = require("./msg/msg_handler")

client.on('ready', () => {
  console.log("Logged in!")
});

client.on('message', msg => {
  msg_handler(msg, client);
});

client.login(token)

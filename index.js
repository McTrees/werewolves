/* werewolves bot */

const config = require('./config');
const token = require('./token').token;

const discord = require('discord.js');
const client = new discord.Client();

const utils = require('./utils');
const msg_handler = require("./msg/msg_handler");
const failsafes = require("./failsafes");

client.on('ready', () => {
  utils.successMessage("Logged in!");
  failsafes(client) // actually actually run the darn thing
});

client.on('message', msg => {
  msg_handler(msg, client);
});

require("./user/user").init()
client.login(token)

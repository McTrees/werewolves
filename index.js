/* werewolves bot */
const utils = require('./utils');
// Check to see if the user wants to run in debug mode
if (process.argv.indexOf("--debug") > -1) {
	utils.debugMode();
}

utils.debugMessage("Debug messages enabled.");
utils.infoMessage("Startup process begginning...");
const config = require('./config');
const token = require('./token').token;
utils.successMessage("Config loaded");

utils.infoMessage("Loading external modules...");
const discord = require('discord.js');
const client = new discord.Client();

utils.infoMessage("Loaded external modules, loading other modules.");
const msg_handler = require("./msg/msg_handler");
const failsafes = require("./failsafes");
utils.infoMessage("Loaded modules");

if (token == 'insert-token-here') {
	utils.errorMessage("Incorrect login credentials passed! Please edit token.json with your bot's token.", true)
	process.exit();
}

client.on('ready', () => {
  utils.successMessage("Logged in!", true);
  failsafes(client) // run 'failsafes' module
});

client.on('message', msg => {
  msg_handler(msg, client);
});

require("./user/user").init()
client.login(token)

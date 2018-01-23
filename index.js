/* werewolves bot */
const utils = require('./utils');

utils.infoMessage("Startup process begginning");
const config = require('./config');
const token = require('./token').token;
utils.infoMessage("Config loaded");

try {
	const discord = require('discord.js');
	const client = new discord.Client();
} catch (ball) {
	utils.errorMessage("Issue whilst loading discordJS and initializing client. Please ensure you have run 'npm i' at least once after downloading");
	process.exit();
}


const msg_handler = require("./msg/msg_handler");
const failsafes = require("./failsafes");
utils.infoMessage("Loaded libraries");

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

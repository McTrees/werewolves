/* werewolves bot */

const config = require('./config');
const token = config.token;


const discord = require('discord.js');
const client = new discord.Client();

client.on('ready', () => {
  console.log("Logged in!")
});

client.login(token)

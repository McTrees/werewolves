/* werewolves bot */
const fs = require('fs');

const utils = require('./utils');
update = true
reset_data = false;

utils.infoMessage("Starting bot...");
// Check to see if the user wants to run in debug mode
if (process.argv.indexOf("--debug") > -1) {
	utils.debugMode();
}

//Check if the user wants to reset the entire server data (including global profiles)
//WARNING - Use this flag only during the testing phase, or if the server is being reset.
if(process.argv.indexOf("--reset-data") > -1){
	reset_data = true;
	utils.warningMessage("Will reset database.");
}

if (process.argv.indexOf("--noupdate") > -1) {
	update = false; //dont check for updates
}

// Check for updates
/*
//Why was this commented out?
if (update) {
	try {
	checkForUpdate();
	} catch(err) {
		utils.errorMessage("Could not check for updates. Please check your internet connection and try again.")
	}
} else { */
    utils.infoMessage("Skipping update check.")
		/*
}
*/

utils.debugMessage("Debug messages enabled.");
const config = require('./config');
const token = require('./token').token;
utils.debugMessage("Config loaded!");

utils.debugMessage("Loading external modules...");
const discord = require('discord.js');
const client = new discord.Client();

utils.debugMessage("Loaded external modules, loading other modules.");
const msg_handler = require("./msg/msg_handler");
const failsafes = require("./failsafes");
utils.debugMessage("Loaded modules.");

utils.debugMessage("Running inits:")
require("./user/user").init()
require("./game/game_state").init()
utils.debugMessage("Inits done")

if (token == 'insert-token-here') {
	utils.errorMessage("Incorrect login credentials passed! Please edit token.json with your bot's token.", true)
	process.exit();
}

// this makes unhandled promise rejections a fatal error, not a supressed warning.
// this should hopefully make debugging easier
process.on('unhandledRejection', up => { throw up })

client.on('ready', () => {
  utils.successMessage("Logged in!", true);
  failsafes(client) // run 'failsafes' module
});

client.on('message', msg => {
  msg_handler(msg, client);
});

require("./user/user").init(reset_data);//Reset the database if reset-data flag is present

//Now login
client.login(token)






// Internals


/*
function checkForUpdate() {
const https = require('https');
url = "https://ben.mctrees.net/api/checkGitVersion.php?repo=werewolves";

	currentVer = require('./package').version;
      https.get(url, res => {
	  res.setEncoding("utf8");
	  let body = "";
	  res.on("data", data => {
	    body += data;
	  });
	  res.on("end", () => {
	    	utils.debugMessage(`got ${body} from version API`);
	    	utils.debugMessage(`Current version from package.json is ${currentVer}`)
	    	if (currentVer == body) {
	    		utils.infoMessage("You are up-to-date with the latest version from Github.")
	    	}
	    	else {
	    		utils.warningMessage(`You are not on the latest version. You should update for fixes and features by doing a git pull.
	    			Remote version: ${body}
	    			Local version: ${currentVer}
	    			Please update.`)
	    	}
	  });
	});
}
*/

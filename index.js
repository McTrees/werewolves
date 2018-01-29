/* werewolves bot */
const utils = require('./utils');
update = true

utils.infoMessage("Startup process begginning...");
// Check to see if the user wants to run in debug mode
if (process.argv.indexOf("--debug") > -1) {
	utils.debugMode();
}
if (process.argv.indexOf("--noupdate") > -1) {
	update = false; //dont check for updates
}

// Check for updates
if (update) {
	try {
	checkForUpdate();
	} catch(err) {
		utils.errorMessage("Could not check for updates. Please check your internet connection and try again.")
	}
} else {
    utils.infoMessage("Skipping update check.")
}


utils.debugMessage("Debug messages enabled.");
const config = require('./config');
const token = require('./token').token;
utils.successMessage("Config loaded!");

utils.infoMessage("Loading external modules...");
const discord = require('discord.js');
const client = new discord.Client();

utils.infoMessage("Loaded external modules, loading other modules.");
const msg_handler = require("./msg/msg_handler");
const failsafes = require("./failsafes");
utils.infoMessage("Loaded modules.");

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






// Internals



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
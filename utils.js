debugmode = false



var fs = require('fs');
const config = require("./config");

var date = new Date();
logName = "./logs/" + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + "_" + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + ".log"
log = function (type, msg) {
	if (config.developerOptions.saveLogFiles == "true") {
		var date = new Date();
		msg = "[" + type + " @ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]: " + msg
		fs.appendFile(logName, msg + "\n", function(err) {
		    if(err) {
		        return console.log(err);
		    }
		}); 
	}
}


exports.debugMode = function () {
	debugmode = true;
}

exports.toBase64 = function (str) {
  return Buffer.from(str).toString("base64");
};

exports.fromBase64 = function (b64) {
  return Buffer.from(b64, "base64").toString("utf8")
};

exports.infoMessage = function (str, force) {
	if (config.developerOptions.logOtherMessages == "true" || force == "force" || force == true || debugmode == true) {
  		console.log('\x1b[2m\x1b[36m%s\x1b[0m', "[-] ".concat(str));
  	}
  	log("INFO", str)
};

exports.successMessage = function (str, force) {
	if (config.developerOptions.logOtherMessages == "true" || force == "force" || force == true || debugmode == true) {
		console.log('\x1b[2m\x1b[32m%s\x1b[0m', "[*] ".concat(str));
	}
	log("SUCCESS", str)
}

exports.warningMessage = function (str, force) {
	if (config.developerOptions.logOtherMessages == "true" || force == "force" || force == true || debugmode == true) {
		console.log('\x1b[2m\x1b[35m%s\x1b[0m', "[!] ".concat(str));
	}
	log("WARN", str)
}

exports.errorMessage = function (str, force) {
	if (config.developerOptions.logOtherMessages == "true" || force == "force" || force == true || debugmode == true) {
		console.error('\x1b[2m\x1b[31m%s\x1b[0m', "[!] ".concat(str));
	}
	log("ERR", str)
}

exports.debugMessage = function (str, force) {
	if (config.developerOptions.logDebugMessages == "true" || force == "force" || force == true || debugmode == true) {
		console.log('\x1b[2m\x1b[33m%s\x1b[0m', "[#] ".concat(str));
	}
	log("DEBUG", str)
}

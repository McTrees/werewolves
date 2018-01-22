const config = require("./config");

exports.toBase64 = function (str) {
  return Buffer.from(str).toString("base64");
};

exports.fromBase64 = function (b64) {
  return Buffer.from(b64, "base64").toString("utf8")
};

exports.infoMessage = function (str) {
	if (config.developerOptions.logOtherMessages == "true") {
  		console.log('\x1b[2m\x1b[36m%s\x1b[0m', "[-] ".concat(str));
  	}
};

exports.successMessage = function (str) {
	if (config.developerOptions.logOtherMessages == "true") {
		console.log('\x1b[2m\x1b[32m%s\x1b[0m', "[*] ".concat(str));
	}
}

exports.errorMessage = function (str) {
	if (config.developerOptions.logOtherMessages == "true") {
		console.log('\x1b[2m\x1b[31m%s\x1b[0m', "[!] ".concat(str));
	}
}

exports.debugMessage = function (str) {
	if (config.developerOptions.logDebugMessages == "true") {
		console.log('\x1b[2m\x1b[33m%s\x1b[0m', "[#] ".concat(str));
	}
}
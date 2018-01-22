exports.toBase64 = function (str) {
  return Buffer.from(str).toString("base64");
};

exports.fromBase64 = function (b64) {
  return Buffer.from(b64, "base64").toString("utf8")
};

exports.infoMessage = function (str) {
  console.log('\x1b[2m\x1b[36m%s\x1b[0m', "[-] ".concat(str));
};

exports.successMessage = function (str) {
	console.log('\x1b[2m\x1b[32m%s\x1b[0m', "[*] ".concat(str));
}

exports.errorMessage = function (str) {
	console.log('\x1b[2m\x1b[31m%s\x1b[0m', "[!] ".concat(str));
}

exports.debugMessage = function (str) {
	console.log('\x1b[2m\x1b[33m%s\x1b[0m', "[#] ".concat(str));
}
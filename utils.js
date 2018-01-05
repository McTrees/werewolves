exports.toBase64 = function (str) {
  return Buffer.from(str).toString("base64");
};

exports.fromBase64 = function (b64) {
  return Buffer.from(b64, "base64").toString("utf8")
};

exports.toBase64 = function (str) {
  return new Buffer(str).toString("base64");
};

exports.fromBase64 = function (b64) {
  return new Buffer(b64, "base64").toString("utf8")
};

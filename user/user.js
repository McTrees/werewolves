exports.signupCmd = function (msg, client) {
  msg.channel.send(`${msg.content.split(" ")[1]} wants emoji ${msg.content.split(" ")[2]}.`);
};

exports.assassinate = function (msg, client) {
  // TODO: add option to use emoji/nickname/mention in command
  splitCmd = msg.content.split(" ");
  if (splitCmd.length !== 2){
    msg.reply("The correct syntax is `%assassinate <@player>`")
  } else {
    game_log.send(`The Assassin <@${msg.author.id}> has sent a request to Assassinate <@${splitCmd[1]}>!`)
    msg.channel.send(`Your request has been sent to the @Game Masters!`)
  }
};

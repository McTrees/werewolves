const discord = require("discord.js")

module.exports = function(client) {
var general = client.channels.get("395966781589815298");
client.on('guildMemberRemove', member => {
  let guild = member.guild
  const embed = new discord.RichEmbed()
  .setColor(0x00AE86)
  .setTimestamp()
  .addField('User Update',
    `${member.user} has left! :neutral_face: `)
  general.sendEmbed(embed);
});
}

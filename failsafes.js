const discord = require("discord.js")
const config = require("./config")

module.exports = function(client) {
var general = client.channels.get(config.channel_ids.gm_confirm);
client.on('guildMemberRemove', member => {
  let guild = member.guild
  const embed = new discord.RichEmbed()
  .setColor(0x00AE86)
  .setTimestamp()
  .addField('User Update',
    `${member.user} has left! :neutral_face: `)
  general.send(embed);
});
}

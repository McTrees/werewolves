exports.name = "Cursed Civilian "
exports.description = "will become werewolf on death"

exports.on_death = function(kill_desc, game, me) {
    game.masters.send(`<@${me.id}> was killed so they were turned into a werewolf`)
    me.role = "wolf/werewolf"
}

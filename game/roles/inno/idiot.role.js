exports.name = "Idiot"
exports.description = "If the idiot dies during the death poll" +
	" or during the night, the ﬁrst attack will be prevented." +
	"\n However, the idiot loses the right to vote";
	//Copied this from instruction manual, you might wanna change this @Randium
	
const NO_VOTE_TAG = "cannot-vote-idiot";//Because there's other reasons for which a player can't vote

exports.on_death = function(kill_desc, game, me) {
  if (kill_desc.by == "barber-killed") {
    game.masters.send(`<@${me.id}> was killed by a barber so they died.`)
    return true // did die
  } else {
	game.masters.send(`Someone tried to kill <@{me.id}>, but they are a barber, so they didn't die. (kill reason - **${kill_desc.by}**)`)
	game.tags.add_tag(me.id, NO_VOTE_TAG)
	me.role = "inno/basic"
    return false // didn't die
  }
}
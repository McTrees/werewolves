# `config.json`
This file describes all of the parameters in `/config.json`, what they do and how to edit them.

## default configuration
```JSON
{
  "bot_prefix": "!",
  "season": "5",
  "defaultMessage": "heyyy come here offten? (this can be the message that it says lol)",
  "messageTimeout": 3000,

  "developerOptions": {
    "showErrorsToDevs": "true",
    "showErrorsToUsers": "false"
  },

  "channel_ids": {
    "gm_confirm": "400350702138032140",
    "story_time": "401767386400948225",
    "voting_booth": "402127047478083584",
    "werewolves": "403457591444766731",
    "cult": "403457834278453248"
  },

  "role_ids": {
    "gameMaster": "403220526903853066",
    "everyone": "395966781589815296"
  }
}

```
## parameters
 `bot_prefix`
> String, the prefix for the bot, can be any single character
`season`
>String, the season to append to all CCs
`defaultMessage`
>String, the message the bot sends to new CCs once they are created
`messageTimeout`
>Integer, the amount of time the bot waits before deleting it's own error messages

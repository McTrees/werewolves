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
    "gm_confirm": "Insert ID here!",
    "story_time": "Insert ID here!",
    "voting_booth": "Insert ID here!",
    "werewolves": "Insert ID here!",
    "cult": "Insert ID here!"
  },

  "role_ids": {
    "gameMaster": "Insert ID here!",
    "everyone": "Insert ID here!"
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

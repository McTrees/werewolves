# `config.json`
This file describes all of the parameters in `/config.json`, what they do and how to edit them.

## default configuration
```JSON
{
	"bot_prefix": "!",
	"season": "5",
	"messageTimeout": 3000,
	"guild_id":"395966781589815296",

	"messages": {
		"CC": {
			"createAnonymous": "Look, look! Over @here, a new conspiracy channel has been created! Someone who prefers to remain anonymous has brought you together! Maybe they have something to say..."
		},
		"general": {
			"permission_denied": "I'm sorry, but you don't have permission to run that command!"
		}
	},

	"channel_ids": {
		"gm_confirm": "400350702138032140",
		"story_time": "401767386400948225",
		"voting_booth": "402127047478083584",
		"werewolves": "403457591444766731",
		"cult": "403457834278453248"
	},

	"role_ids": {
		"gameMaster": "414734541614350347",
		"mayor":"413347795437879297",
		"dead":"417290230882893845"
	},

	"developerOptions": {
		"showErrorsToDevs": "true",
		"showErrorsToUsers": "false",
		"logDebugMessages": "false",
		"logOtherMessages": "true",
		"saveLogFiles": "true",
		"remoteErrorReporting": "true"
	}
}

```
## Parameters

#### Globals
| Name             |   Type    | description                                                     |
|:-----------------|:---------:|:----------------------------------------------------------------|
| `bot_prefix`     | `String`  | Prefix that the bot uses                                        |
| `season`         | `String`  | Season that is appended to all CCs                              |
| `defaultMessage` | `String`  | Default message the bot sends to new CCs                        |
| `messageTimeout` | `Integer` | amount of time bot waits before deleting its own error messages |

 #### developerOptions
| Name                |   Type   | description                          |
|:--------------------|:--------:|:-------------------------------------|
| `showErrorsToDevs`  | `String` | If bot logs errors to users with dev |
| `showErrorsToUsers` | `String` | If bot logs errors to all users      |
| `saveLogFiles`      | `String` | If the bot should save log files (can be large) |
| `remoteErrorReporting` | `String` | If the bot should remotely report errors |

#### channel_ids
| Name           |   Type   | description             |
|:---------------|:--------:|:------------------------|
| `gm_confirm`   | `String` | GM confirm channel id   |
| `story_time`   | `String` | story time channel id   |
| `voting_booth` | `String` | voting_booth channel id |
| `werewolves`   | `String` | werewolves channel id   |
| `cult`         | `String` | cult channel id         |

#### role_ids
| Name         |   Type   | description        |
|:-------------|:--------:|:-------------------|
| `gameMaster` | `String` | gameMaster id role |

----
> Side note, you can get the ID of a role by doing: `\@role`

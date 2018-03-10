**g tag**
Description: Used to manage tags during the game.

Usage: `!g tag <subcommand> [argument1] [argument2]`, where `subcommand` can be any of `add`, `remove`, `all_with`, `all_of`
Example: `!g tag add @dummy#0000 powdered`

**Notes:**
 - Game master only.
 - `add`, `remove` expect usage `g tag <add/remove> <@player#0000> <tagname>`
 - `all_with` expects usage `g tag all_with <tagname>`
 - `all_of` expects usage `g tag all_of <@player#0000>`
 - Sometimes if you get the arguments the wrong way around the bot crashes; we are working on a fix

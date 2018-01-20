# what the bot should do

## when season starts

- close signups
- for every person signed up:
- ask the gms for their role
- assign them that role in a db (with a unique string for each role)
- create channels:
	- werewolves channel with all the werewolves in
	- bakers channel with all the bakers in
	- etc
- tell everyone what their role is
- begin!


## daytime and nighttime:
triggered by gm with command

first day has no lynching    
first night has no cult

### day -> night
- close lynching poll
- get results
- account for extra stuff, like mayor, raven etc
- Any non-death events are evaluated
- Any deaths are evaluated
- Win conditions are checked

### night -> day
- close werewolves, cult, etc. polls
- get results
- account for any extra stuff
- Any non-death events are evaluated
- Any deaths are evaluated
- Win conditions are checked

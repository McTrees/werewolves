# Werewolves Bot

A Discord bot designed to automate the heavy-lifting of game server Werewolves

[![Build Status](https://scrutinizer-ci.com/g/McTrees/werewolves/badges/quality-score.png)](https://scrutinizer-ci.com/g/McTrees/werewolves/)


## Getting Started

Run the main file with `node index.js` or opening `run.bat` (windows only). Note that you should first edit `config.json` and `token.json` with the correct settings. See [Configuration](#configuration) for options.


### Installing

Download the project to your local machine using git (or by downloading the zip).

```
git clone https://github.com/McTrees/werewolves.git
```

### Install dependencies

```
npm install
```

Edit `config.json` and `token.json` with required settings. See [Configuration](#configuration) for options.

Run with `node index.js` or by opening `run.bat` (windows only)


## Configuration
This project offers several configuration options via both `config.json` and `token.json`:
 - `config.json`
   - bot_prefix: the prefix the bot should respond to (defaults to `!`)
   - season: likely to be removed soon in favour of game_state managing seasons.
   - messageTimeout: how long the bot should wait before deleteing some of it's own error messages.
   - messages: categorised messages which the bot sends upon several actions being completed.
   - channel_ids: IDs of channels the bot should send several types of message in.
   - role_ids: IDs of roles which the bot should use to establish permissions, etc.
   - developerOptions: Whether or not the bot should do things like show messages to users or create logs.
 - `token.json`
   - token: The token of the account which the bot should run under. Will throw an error if set to default value.
   
For more info see the [docs](https://github.com/McTrees/werewolves/blob/master/docs/readme.md)

## Attribution
This code has been developed by [Ben Griffiths](https://github.com/BenTechy66), [Calvin Edwards](https://github.com/ed588), [Robbie Bradshaw](https://github.com/trebor97351), [Oliver Hynds](https://github.com/oliverh57) and [Lord of Galaxy](https://github.com/Lord-of-the-Galaxy).
It is licensed under the MIT license, a copy of which can be found in this repository, in the `LICENSE` file.


[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)  [![forthebadge](http://forthebadge.com/images/badges/built-with-swag.svg)](http://forthebadge.com)  [![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://forthebadge.com)  [![forthebadge](http://forthebadge.com/images/badges/gluten-free.svg)](http://forthebadge.com)  [![forthebadge](http://forthebadge.com/images/badges/uses-badges.svg)](http://forthebadge.com)  [![forthebadge](http://forthebadge.com/images/badges/built-by-developers.svg)](http://forthebadge.com) [![forthebadge](http://forthebadge.com/images/badges/powered-by-electricity.svg)](http://forthebadge.com)

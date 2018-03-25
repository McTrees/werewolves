const config = require('../config');
const aliases = require('../msg/aliases');
const user = require("../user/user")
const utils = require("../utils")
const discord = require("discord.js")
const path = require("path")
var fs = require('fs')
const glob = require('glob')
const permissions = require('../msg/permissions')



function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}


exports.helpCmd = function(msg, client, args, cmd) {
  items_removed = false
  var messageContent = msg.content.split(" ");
  messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
  const dirs = getDirectories("./help/cmds/")
  if (msg.author == client.user) return; //ignore own messages
  messageContent = msg.content.split(" ");
   if (messageContent[0][0] == config.bot_prefix) { //only run if it is a message starting with the bot prefix (if it's a command)
     messageContent[0] = messageContent[0].slice(1); //remove the prefix from the message
    }
    try {
      args = aliases[args[0]].split(" ");
      cmd[0] = args[1]
    } catch (err) {} //check aliases
    utils.debugMessage("helpCmd called with args: '" + args + "' and cmd '" + cmd + "'")

    if (args == [] || args == undefined || args == "") {
      p = "./cmds/"
dirsF = []
for(i in dirs){dirsF[i] = '`'+dirs[i]+'`'}
      msg.channel.send(`
\`help\` help:

**Usage:** \`!help category command\`

**Example:** \`!help u signup\`

Possible categories: ` + dirsF.join(", "))
      return
}
     else if (cmd == [] || cmd == undefined || cmd == "") {
      glob("**.md", { cwd: path.join(__dirname, "cmds/" + args) }, function(err, matches) {
        if (matches) {
          commands = []
          var i = matches.indexOf("index.md");
          if(i != -1) {
            matches.splice(i, 1);
          }
          matches_2 = Array.from(matches)
          for (var match in matches) {
            utils.debugMessage(`Checking ID ${match} (${matches[match]})`)
            match = matches[match]
            match = match.replace(/\.md$/, "")
            cmd = args[0] + " " + match
            utils.debugMessage("Calculating permissions for user and removing commands which he has no permissions for.")
            utils.debugMessage(`Checking ${cmd} against permissions.json`)
            p = permissions.gm_only
            if(permissions.gm_only.includes(cmd)) {
              utils.debugMessage(`Command ${cmd} was in permissions.json; Checking roles now.`)
              if (msg.member.roles.has(config.role_ids.gameMaster)) {
                utils.debugMessage(`User had permissions; continuing execution.`)
              }
              else {
                utils.debugMessage(`User did not have permissions; removing from list.`)
                var i = matches_2.indexOf(match + ".md")
                utils.debugMessage(`Removing ${i} (${matches_2[i]}) from ${matches_2}`)
                matches_2.splice(i, 1)
                items_removed = true

              }

            } else {
              utils.debugMessage("Command not in permissions; assuming all can run")
            }
          }
          matches = matches_2
          for (var match in matches) {
            match = matches[match]
            match = match.replace(/\.md$/, "") /*This general section could be a ton more efficient; I'll do that once it works*/
            match = match + "\n"
            match = " - " + match
            commands.push(match)
          }
          fs.readFile('./help/cmds/' + args[0] + '/index.md', {
            encoding: 'utf-8'
          }, function(err, data) {
            if (err) {

              utils.debugMessage("Index.md was not present; assuming category does not exist")
              msg.channel.send(`Sorry, but that category does not exist.`)
            } else {
              utils.debugMessage("Sending help data")
              append = ""
              if (items_removed) {
                append = "\n\n*Some items have been removed as you did not have permission to run them.*"
              }
              msg.channel.send(`${data}${commands.join("")}\n\n*Need more info? Use \`help category command\`. For example: \`!help ${args} ${matches[0].replace(/\.md$/, "")}\`*${append}`)
            }
          })

        }
        else {
          msg.channel.send("Sorry, but I don't have any commands in that help category. Valid categories are: *[WIP/TODO]*")
        }
      } )
      // msg.reply("This will eventually list all commands in the category specified")
      return

    } else {
      utils.debugMessage(`Help cmd called w/ ${cmd} & ${args}`)
    }
    /**
    * For the brave souls who get this far: You are the chosen ones,
    * the valiant knights of programming who toil away, without rest,
    * fixing our most awful code. To you, true saviors, kings of men,
    * I say this: never gonna give you up, never gonna let you down,
    * never gonna run around and desert you. Never gonna make you cry,
    * never gonna say goodbye. Never gonna tell a lie and hurt you.
    */
    utils.debugMessage('Reading file: ' + './help/cmds/' + args[0] + "/" +cmd[0] + '.md')
    try {
    fs.readFile('./help/cmds/' + args[0] + '/' + cmd[0] + '.md', {
      encoding: 'utf-8'
    }, function(err, data) {
      if (err) {
        msg.channel.send("Sorry, I dont have any help for that topic. ")
        return
      }
      msg.channel.send(data);
    })
  } catch (err) {
    msg.channel.send("Sorry, I don't have any help for that topic.")
  }
}

const config = require('../config'); //include main config
const configcc = require('./configcc'); //include config for CCs

exports.createCmd = function(msg, clinet, args){//mgs = message obdj, client = bot client obdj, args = array of arguments
  msg.delete();// del message
  makeChannel(msg, args[0]);
}

function makeChannel(message, name){//function to create
    var server = message.guild.catgory; //set server to the server message was sent from
    //var server = message.catgory; //set server to the server message was sent from
    name = "S" + config.season + "_CC_" + name
    server.createChannel(name, "text");
    var thing = client.channels.find("name",name)
    trhing.setParent(402933080119312398);
}

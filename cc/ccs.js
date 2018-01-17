const config = require('../config'); //include main config
const configcc = require('./configcc'); //include config for CCs

exports.createCmd = function(msg, clinet, args){//mgs = message obdj, client = bot client obdj, args = array of arguments
  msg.delete();// del message
  makeChannel(msg, args[0]);
}

function makeChannel(message, name){//function to create
    var server = message.guild; //set server to the server message was sent from
    //var server = message.catgory; //set server to the server message was sent from
    name = "S" + config.season + "_CC_" + name; //phrase name of catgory
    var currentcatgory = "402933080119312398"; //ID of the currentcatgory that channels are stored in. NEEDS WORK

    server.createChannel(name, "text").then(channel => //creates channels
      channel.setParent(server.channels.get(currentcatgory))).then(channel => //move new channel into currentcatgory
        channel.send(config.defaultMessage)); //sends defaut message
}

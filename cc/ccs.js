const config = require('../config'); //include main config
var fs = require('fs')

var ccconf; //decalre cc conf var as global



exports.createCmd = function(msg, clinet, args){//mgs = message obdj, client = bot client obdj, args = array of arguments
  msg.delete();// del message
  makeChannel(msg, args[0]);
}

function makeChannel(message, name){//functiohn to create
  if(name == "" || name.split(0) == "@"){ //test to see if there are no arguments or if name should be thingy
    message.reply("Incorenct syntax; you must specify a name *note: it cant start with `@`*")
  }else{
    fs.readFile('./cc/cc.json', {encoding: 'utf-8'}, function (err, data) { //read ccconfg.json to ccconfg
      if (err) throw err; //throw error
      ccconf = JSON.parse(data); //turns string into JSON object

      ccconf.CC_curent_number = ccconf.CC_curent_number + 1; //adds one to the number of CCs
      message.reply("Current number of CCs: `" + ccconf.CC_curent_number + "` Current ID of cc catgory: `" + ccconf.CC_curent_id + "`")

      name = "S" + config.season + "_CC_" + name; //phrase name of catgory

      message.guild.createChannel(name, "text").then(channel => //creates channels
        channel.setParent(message.guild.channels.get(configcc.CC_curent_id))).then(channel => //move new channel into currentcatgory
          channel.send(config.defaultMessage)); //sends defaut message

      writecc(); //write cc conf to cc.json
    })

  }
}

function readcc(){ //function read cc.json and parses it as ccconf (obdj)

}

function writecc(){ //function writes ccconf (odbj) to cc.json
  fs.writeFile('./cc/cc.json', JSON.stringify(ccconf),{encoding: 'utf-8'}, function(err) {
    if (err) throw er //throw error
  })
}

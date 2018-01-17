const config = require('../config'); //include main config
const configcc = require('./configcc'); //include config for CCs
const fs = require('fs'); //require lib for files

let student = {
    name: 'Mike',
    age: 23,
    gender: 'Male',
    department: 'English',
    car: 'Honda'
};

var data = JSON.stringify(student);

exports.createCmd = function(msg, clinet, args){//mgs = message obdj, client = bot client obdj, args = array of arguments
  msg.delete();// del message
  makeChannel(msg, args[0]);
}

  function makeChannel(message, name){//function to create
  var currentcatgory = "402933080119312398"; //ID of the currentcatgory that channels are stored in. NEEDS WORK
  var server = message.guild; //set server to the server message was sent from

  if(name == "" || name.split(0) == "@"){ //test to see if there are no arguments or if name should be thingy
    fs.writeFileSync('./configcc', data);
    name = "S" + config.season + "_CC_" + name; //phrase name of catgory

    server.createChannel(name, "text").then(channel => //creates channels
      channel.setParent(server.channels.get(configcc.CC_curent_id))).then(channel => //move new channel into currentcatgory
        channel.send(config.defaultMessage)); //sends defaut message

  }else{
    message.reply("Incorenct syntax; you must specify a name *note: it cant start with `@`*")
  }

}

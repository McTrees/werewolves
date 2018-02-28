const path = require("path")
const fs = require("fs")
const sqlite3 = require("sqlite3")
const gamedb = new sqlite3.Database("game/game.db")

exports.init = function(reset_data) {
  // called on bot start
  fs.readFile(path.join(__dirname, 'game.db'), {encoding: "utf-8"}, function(err, data){
    if(err) throw err;
    if (data === '' || reset_data) { // database is empty and needs to be created
      fs.readFile(path.join(__dirname, 'game_db_schema.sql'), {encoding: "utf-8"}, function(er, schema) {
        if (er) throw er
        else {
          utils.warningMessage(reset_data?"You chose to reset the game database for this bot, creating new game database.":"game database not found - creating a new one");
          gamedb.exec(schema);
          if(reset_data){
            utils.warningMessage("Database reset.");
          }else{
            utils.successMessage("Database created!");
          }
        }
      })
    }
  })
}

exports.add_tag = function(id, tag) {
  
}

exports.remove_tag = function(id, tag) {

}

exports.has_tag = function(id, tag) {

}

exports.all_tags_of = function(id) {

}

exports.all_with_tag = function(tag) {

}

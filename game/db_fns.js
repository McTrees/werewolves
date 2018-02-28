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

// NB: nothing here actually checks to see if a user exists or if a tag is valid!

exports.tags.add_tag = function(id, tag) {
  // adds a tag to a user
  gamedb.run("insert into player_tags (user_id, tag_name) values ($id, $t);", {$id:id,$t:tag}, function(err) { if (err) throw err})
}


exports.tags.remove_tag = function(id, tag) {
  // removes tag from user
  gamedb.run("delete from player_tags where user_id = $id and tag_name = $t;", {$id:id,$t:tag}, function(err) {if (err) throw err})
}

exports.tags.has_tag = function(id, tag) {
  // true or false, whether user `id` has tag `tag`
  return new Promise(function(resolve, reject) {
    gamedb.get("select user_id from player_tags where user_id = $id and tag_name  = $t;", {$id:id,$t:tag}, function(err, row) {
      if (err) { throw err; }
      resolve(!!row)
    })
  })
}

exports.tags.all_tags_of = function(id) {
  return new Promise(function(resolve, reject) {
    // promise of list of tags a user has, or [] if none
    gamedb.all("select tag_name from player_tags where user_id = ?;", id, function(err, rows) {
      if (err) { throw err; }
      resolve(rows.map(row=>row.tag_name))
    })
  })
}

exports.tags.all_with_tag = function(tag) {
  return new Promise(function(resolve, reject) {
    // promise of a list of users who have that tag.
    gamedb.all("select user_id from player_tags where tag_name = ?;", tag, function(err, rows){
      if (err) { throw err; }
      resolve(rows.map(row=>row.user_id))
    })
  })
}

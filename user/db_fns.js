const sqlite3 = require("sqlite3");
const userdb = new sqlite3.Database("user/user.db")
const fs = require("fs")
const path = require("path")

exports.init = function() {
  // should only be called if the database does not exist.
  fs.readFile(path.join(__dirname, 'user_db_schema.sql'), {encoding: "utf-8"}, function(err, data) {
    if (err) throw err
    else {
      console.log(data)
    }
  })
}

exports.getUserEmoji = function (id) {
  // returns promise of base64 of emoji for user
  return new Promise(function(resolve, reject) {
    userdb.get("select emoji from signed_up_users where user_id = ?", id, function(err, row) {
      if (err) throw err;
      if (row) {
        resolve(row.emoji)
      } else {
        reject()
      }
    })
  });
};

exports.getUserId = function (emoji) {
  // returns promise of id for user by emoji
  return new Promise(function(resolve, reject) {
    userdb.get("select user_id from signed_up_users where emoji = ?", emoji, function(err, row) {
      if (err) throw err;
      if (row) {
        resolve(row.user_id)
      } else {
        reject()
      }
    })
  });
};
exports.addUser = function (id, emoji) {
  // if no one else is using that emoji, sign them up
  // or change their emoji
  // returns promise:
    // reject = id of user using that emoji
    // resolve: old emoji if changed, nothing (undefined) otherwise
  return new Promise(function(resolve, reject) {
    exports.getUserId(emoji).then(i=>{
      reject(i)
    }).catch(()=>{
      //check if user is already signed up
      exports.getUserEmoji(id).then(old_emoji=>{
        //user already signed up, wants to change their emoji
        userdb.run("replace into signed_up_users values (?, ?)", [id, emoji], ()=>{
          resolve(old_emoji);
        })
      }).catch(()=>{
        //not signed up, wants to.
        userdb.run("insert into signed_up_users values (?, ?)", [id, emoji], ()=>{
          resolve()
        })
      })
    })
  })
};

exports.all_signed_up = function() {
  // returns promise of a list of all signed up users' ids
  //intentionally does not include emojis to prevent this being used for polls etc
  return new Promise(function(resolve, reject) {
    userdb.all("select user_id from signed_up_users", [], function(err, rows){
      if (err) {
        throw err
      } else {
        resolve(rows)
      }
    })
  });
}

exports.add_actual_user = function(id, lives, role) {
    userdb.run("replace into players (user_id, lives, role) values (?, ?, ?)", [id, lives, role]);
}

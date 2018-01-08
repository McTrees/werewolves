const sqlite3 = require("sqlite3");
const userdb = new sqlite3.Database("user/user.db")

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
exports.getUser = function (data) {
  // returns promise of id for user by emoji/id
  return new Promise(function(resolve, reject) {
    userdb.get("select user_id from signed_up_users where emoji = ? or user_id = ?", emoji,emoji, function(err, row) {
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

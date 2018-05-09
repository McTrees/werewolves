// utility functions that many roles might need
// to avoid duplication
// DRY
const db_fns = require("../db_fns")
const user = require("../../user/user")

exports.disguised_role = function(player_id) {
  return new Promise(function(resolve, reject) {
    db_fns.relationships.all_affectees_of(player_id, "disguised_as").then(list=>{
      if (list.length > 0) {
        resolve(list[0])
      } else {
        user.get_role(player_id).then(resolve)
      }
    })
  })
  // if a player is disguised, return their disguised role
  // otherwise, return their actual role
  // as the role id string
}

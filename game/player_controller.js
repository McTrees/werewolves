const user = require("../user/user")
const utils = require("../utils")

class PlayerController {
  constructor(id) {
    console.log(`PlayerController constructed with id ${id}`)
    this.id = id
  }

  get role() {
    return new Promise(function(resolve, reject) {
      user.get_role(this.id).then(role=>{
        resolve(role)
      })
    });
  }

  set role(v) {
    user.set_role(this.id, v)
  }
}


exports.PlayerController = PlayerController

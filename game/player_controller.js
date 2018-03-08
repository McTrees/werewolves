const user = require("../user/user")
const utils = require("../utils")
const db_fns = require("./db_fns")

class PlayerController {
  constructor(id, client) {
    this.id = id
    this._client = client
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

  async has_tag(tag) {
    return await db_fns.tags.has_tag(this.id, tag)
  }

  tell(msg) {
    // todo: actually tell them. for now it just prints it to the console.
    this._client.users.get(this.id).send(msg)
  }
  }
}

exports.PlayerController = PlayerController

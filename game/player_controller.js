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
      user.get_role(this.id).then(resolve)
    }.bind(this));
  }
  set role(v) {
    user.set_role(this.id, v)
  }

  async has_tag(tag) {
    return await db_fns.tags.has_tag(this.id, tag)
  }

  tell(msg) {
    this._client.users.get(this.id).send(msg)
  }

  toString() {
    return `<@${this.id}>`
  }

  kill(reason) {
    //TODO
  }
}

exports.PlayerController = PlayerController

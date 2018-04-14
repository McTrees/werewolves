// fns for managing the roles in files and making it easier to access them.
const glob = require("glob")
const path = require("path")
const utils = require("../utils")

const BASE = "./roles/" // change if you want roles somewhere else

exports.all_roles_list = function() {
  // promise of a list of the internal names of all available roles.
  return new Promise(function(resolve, reject) {
    glob("**/*.role.js", { cwd: path.join(__dirname, "roles")}, function(err, files){
      if (err) {throw err;}
      // get rid of .role.js suffix
      var role_names = files.map(n=>n.replace(/\.role\.js$/, ''))
      resolve(role_names)
    })
  });
}

exports.role = function(name) {
  var d = require(BASE+name+".role.js")
  d.id = name
  if (!d.hasOwnProperty("documentation")) {
    Object.defineProperty(d, "documentation", {
      get: function() {
        return(
`**${this.name}** (\`${this.id}\`)

${this.description?this.description:"[no description]"}
${this.long_description?"\n"+this.long_description:""}`
        )
      }
    })
  }
  return d
}

exports.fallback = function(name) {
  if (typeof name !== "string") {
    throw new Error("fallback arg needs to be the name of the role!")
  }
  let res = name.replace(/\w+$/, "defaults.js")
  let data = require(BASE+res)
  return data
}

//exports.RoleInterface.from = exports.role // depreciated, don't use



/*                      _              _           _       _                        _               _
  _ __ ___  ___  ___ | |_   _____   | |_ ___    (_)_ __ | |_ ___ _ __ _ __   __ _| |    _ __ ___ | | ___     _ __   __ _ _ __ ___   ___
 | '__/ _ \/ __|/ _ \| \ \ / / _ \  | __/ _ \   | | '_ \| __/ _ \ '__| '_ \ / _` | |   | '__/ _ \| |/ _ \   | '_ \ / _` | '_ ` _ \ / _ \
 | | |  __/\__ \ (_) | |\ V /  __/  | || (_) |  | | | | | ||  __/ |  | | | | (_| | |   | | | (_) | |  __/   | | | | (_| | | | | | |  __/
 |_|  \___||___/\___/|_| \_/ \___|___\__\___/___|_|_| |_|\__\___|_|  |_| |_|\__,_|_|___|_|  \___/|_|\___|___|_| |_|\__,_|_| |_| |_|\___|
                                |_____|    |_____|                                |_____|              |_____|
*/

exports.resolve_to_internal_role_name = function(role_name) {
  //Expects a role name, for example "Vampire" and returns an internal role name, such as vamp/vampire
  //role_name is case insensitive
  //Spaces are handled, but this function shouldn't be called with a list, such as ['white', 'werewolf']
  //role_name should be a string, containing only the role name, as defined in a role's exports.name

}

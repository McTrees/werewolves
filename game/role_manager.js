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
  return d
}

exports.fallback = function(name) {
  let res = name.replace(/\w+$/, "defaults.js")
  let data = require(BASE+res)
  return data
}

//exports.RoleInterface.from = exports.role // depreciated, don't use

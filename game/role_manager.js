// fns for managing the roles in files and making it easier to access them.
const glob = require("glob")
const path = require("path")

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

class RoleInterface {
  // class for wrapping a role and getting info about it
  constructor(data){
    // TODO
  }

  static from(role_name) {
    
  }
}

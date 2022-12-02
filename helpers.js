//HELPER FUNCTIONS

const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};


//FUNCTION EXPORTS
module.exports = { getUserByEmail }
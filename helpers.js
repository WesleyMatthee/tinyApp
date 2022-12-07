//HELPER FUNCTIONS
//GET USER BY ID
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

//RANDOM STRING GENERATOR
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//URLS FOR USER
const urlsForUser = function(id, urlDatabase) {
  const result = {};
  for (const user in urlDatabase) {
    if (id === urlDatabase[user].userID) {
      result[user] = urlDatabase[user].longURL;
    }
  }

  return result;
};

//URLS BELONGS TO USER
const urlBelongsToUser = function(userID, shortUrl, urlDatabase) {
  const urlInfo = urlDatabase[shortUrl];
  if (urlInfo && urlInfo.userID === userID) {
    return true;
  }
  return false;
};

//GET USER FROM REQ
const getUserFromReq = function(req, users) {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return null;
  }
  return user;

};

//FUNCTION EXPORTS
module.exports = { 
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlBelongsToUser,
  getUserFromReq

}
const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user object when its provided with an valid email from the database', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);

  });
  it('should return a non-existent email as undefined', function() {
    const user = getUserByEmail("user41@example.com", testUsers);
    assert.equal(user, undefined);

  });




});
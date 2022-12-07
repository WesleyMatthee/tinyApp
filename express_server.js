//REQUIREMENTS
const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {

  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlBelongsToUser,
  getUserFromReq

} = require("./helpers.js");

const app = express();
const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: "session",
  keys: ['key1', 'key2']
}));


app.set("view engine", "ejs");//sets ejs as teplating engine

//--------------------------DATA OBJECTS---------
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//------------------------MIDDLEWARE------------------
app.use(express.urlencoded({ extended: true })); //this parses for readablilty
app.use(cookieParser());


//---------------------------ROUTES/ENDPOINTS-----------
//HOME
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
  return res.redirect("/login");
  }
  return res.redirect("/urls");
});

//GET JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//HELLO
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//GET URLS
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.send("<html><body>Please <b>login</b> or <b>register</b></body></html>\n");
  }
  const urlData = urlsForUser(userID, urlDatabase);

  const templateVars = {
    user: user,
    urls: urlData
  };

  res.render("urls_index", templateVars);
});

//GET URLS NEW
app.get("/urls/new", (req, res) => {
  const user = getUserFromReq(req, users);

  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars =
  {
    user: user
  };
  res.render("urls_new", templateVars);
});

//GET URLS ID
app.get("/urls/:id", (req, res) => {
  const user = getUserFromReq(req, users);

  if (!user) {
    return res.redirect("/login");
  }

  if (!urlBelongsToUser(user.id, req.params.id, urlDatabase)) {

    res.status(403);
    res.send("<html><body>This URL doesn't belong to you!</body></html>\n");
    return;
  }

  const templateVars = {
    user: users[req.session["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };

  res.render("urls_show", templateVars);
});

//GENERATE RANDOM URL
app.post("/urls", (req, res) => {
  const user = req.session["user_id"];

  if (!user) {
    res.send("<html><body>Please login to use Tiny App, thank you!</body></html>\n");
    return;
  }

  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: user
  };


  res.redirect(`/urls/${id}`);
});

//POST DELETE
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("URL does not exist");

  }
  if (!req.session["user_id"]) {
    return res.status(401).send("Your not logged in");
  }
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.status(403).send('You dont have permission to access urls!');
  }
  const urlToDelete = req.params.id;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

//GET U ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    res.send("<html><body>Short url does not exist!</body></html>\n");
    return;
  }

  res.redirect(longURL);
});

//Edit submit
app.post("/urls/:id/", (req, res) => {


  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("URL does not exist");

  }
  if (!req.session["user_id"]) {
    return res.status(401).send("You are not logged in");

  }
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.status(403).send("You don't have permission to access urls!");
  }

  urlDatabase[req.params.id].longURL = req.body.updatedUrl;
  res.redirect("/urls");
});

//POST LOGIN && cookies
app.post("/login", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user = getUserByEmail(user_email, users);

  if (user === null) {
    return res.send(403, "You do not have rights to visit this page!");
  }
  if (!user_email || !user_password) {
    return res.send(403, "Invalid email and password!");
  }
  if (!bcrypt.compareSync(user_password, user.password)) {
    return res.send(403, "Your email or password is incorrect!");
  }
  const user_id = users["user_id"];
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//GET LOGIN
app.get("/login", (req, res) => {
  const user = getUserFromReq(req, users);
  if (user) {
    res.redirect("/urls");

  } else {
    const templateVars =
    {
      user: user
    };
    res.render("urls_login", templateVars);
  }
});

//LOGOUT
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/login");
});

//GET REGISTRATION
app.get("/register", (req, res) => {
  const user = getUserFromReq(req, users);
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: user
  };
  res.render("urls_register", templateVars);
});

//POST REGISTRATION
app.post("/register", (req, res) => {
  const user_id = generateRandomString(5);
  const user_email = req.body.email;
  const user_password = req.body.password;

  if (!user_email || !user_password || getUserByEmail(user_email, users)) {
    res.status(400).send("Invalid entry, please try again!");
  }

  let newUser = {
    id: user_id,
    email: user_email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  users[user_id] = newUser;
  req.session.user_id = user_id;
  res.redirect("/urls");

});


//------------------------LISTNER---------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


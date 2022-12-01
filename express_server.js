//REQUIREMENTS
const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

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

//-----------------------HELPER FUNCTIONS------------
//URLS FOR USERS
const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};
  for (const user in urlDatabase) {
    if (id === urlDatabase[user].userID) {
      userUrls[user] = urlDatabase[user];
    }
  }
  return userUrls;
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

//GET USER BY EMAIL
const getUserByEmail = function(email) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

//GET USER FROM REQ
const getUserFromReq = function(req) {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return null;
  }
  return user;

};


//---------------------------ROUTES/ENDPOINTS-----------
//HOME
app.get("/", (req, res) => {
  res.send("Hello!");
});

//GET URLS
app.get("/urls", (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    res.send("<html><body>Please <b>login</b> or <b>register</b></body></html>\n")
  }

  const templateVars = {
    user: user,
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

//LOGIN && cookies
app.post("/login", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user = getUserByEmail(user_email);

  if (user === null) {
    return res.send(403, "You do not have rights to visit this page!");
  }
  if (!user_email || !user_password) {
    return res.send(403, "Invalid email and password!");
  }
  if (user.password !== user_password) {
    return res.send(403, "Your email or password is incorrect!");
  }
  const user_id = users["user_id"];
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

//LOGIN
app.get("/login", (req, res) => {
  const user = getUserFromReq(req);
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
  //console.log(req.body);
  res.clearCookie("user_id");
  res.redirect("/login");
});

//GET REGISTRATION
app.get("/register", (req, res) => {
  const user = getUserFromReq(req);
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

  if (!user_email || !user_password || getUserByEmail(user_email)) {
    res.status(400).send("Invalid entry, please try again!");
  }

  let newUser = {
    id: user_id,
    email: user_email,
    password: user_password
  };
  users[user_id] = newUser;
  res.cookie("user_id", user_id);
  res.redirect("/urls");
  console.log(users);
});



//GET URLS NEW
app.get("/urls/new", (req, res) => {
  const user = getUserFromReq(req);
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
  console.log(req.params.id);
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

//GET JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//HELLO
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//GENERATE RANDOM URL
app.post("/urls", (req, res) => {
  const user = getUserFromReq(req);
  console.log(req.body);
  console.log('user:', user);

  if (!user) {
    res.send("<html><body>Please login to use Tiny App, thank you!</body></html>\n");
    return;
  }

  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: user.id
  };

  res.redirect(`/urls/${id}`);
});

//POST DELETE
app.post("/urls/:id/delete", (req, res) => {
  
  const urlToDelete = req.params.id;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

//Edit submit
app.post("/urls/:id/", (req, res) => {
  // const user = getUserByEmail(user_email);
  // if (!user) {
  //   res.redirect("/login");
  //   return;
  //}
  if (!urlDatabase[req.params.id]) {
    res.send("URL does not exist");
    return;
  }

  urlDatabase[req.params.id] = req.body.updatedUrl;
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

//------------------------LISTNER---------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


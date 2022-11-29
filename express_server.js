//REQUIREMENTS
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");//sets ejs as teplating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true })); //this parses for readablilty

//ROUTES/ENDPOINTS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!2");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const urlToDelete = req.params.id;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});
//???????
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedUrl;
  res.redirect("/urls");
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


//LISTNER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['whaddup_bro'],
  maxAge: 24 * 60 * 60 * 1000
}))

app.set("view engine", "ejs");

function generateRandomString() {
  var allValues = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var randomValue = ""
  for (var i = 6; i > 0; i--){
    var numberPicker = Math.floor(Math.random() * allValues.length)
    var selectedValue = allValues.substring(numberPicker, numberPicker + 1).toString()
    randomValue += selectedValue
  }
  return randomValue
}

//Filters for URLs that belong to a specific user
function urlsForUser(id){
  var urlDatabaseFiltered = {};
  for (var i in urlDatabase){
    if (id === urlDatabase[i]["id"]){
      urlDatabaseFiltered[i] = urlDatabase[i]
    }
  }
  return urlDatabaseFiltered
}

var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", id: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", id: "mikejones"},
  "6AxK54": {longURL: "http://www.youtube.com", id: "bettychau"},
  "123456": {longURL: "http://www.espn.com", id: "mikejones"},
  "654321": {longURL: "http://www.facebook.com", id: "mikejones"},
  "999999": {longURL: "http://www.twitter.com", id: "mikejones"},
  "111111": {longURL: "http://www.instagram.com", id: "rickwong"}
};

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
 "mikejones": {
    id: "mikejones",
    email: "mike@mike.com",
    password: bcrypt.hashSync("mike123", 10)
  },
 "bettychau": {
    id: "bettychau",
    email: "betty@betty.com",
    password: bcrypt.hashSync("betty123", 10)
  },
  "rickwong": {
    id: "rickwong",
    email: "rick@rick.com",
    password: bcrypt.hashSync("rick123", 10)
  }
}

// New URL creation page. Only allows in newly registered or existing users (ie. those with a cookie)
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id){
    res.redirect("/login")
  }
  else {
  var templateVars = { user: users[req.session.user_id]}
  res.render("urls_new", templateVars)
  }
})

// Displays list of all URLs created by user. Only allows access to those with a cookie (Ie. newly
// registered users or those in the existing user database)
app.get("/urls", (req, res) => {
  if (!req.session.user_id){
    res.send("<p>Please <a href='/login'>login</a> or <a href='/register'> register</a> to use TinyApp!</p>")
  }
  else {
    var newlyFilteredList = urlsForUser(req.session.user_id)
    var templateVars = { urls: newlyFilteredList,
                      user: users[req.session.user_id]
                     }
    res.render("urls_index", templateVars)
  }
})

//Individual ShortURL page. Allows user to change the longURL and accordingly updates urlDatabase.
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined){
    res.send("<p>This shortURL does not exist. Return to the <a href='/urls'>main page</a></p>")
  }
  else if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.id]["id"]){
    res.send("<p><h3>Cannot access a URL that does not belong to you.</h3> <br> Please <a href='/login'>login</a> using correct credentials to view that specific account's full list of URLs. You may also create a new account by <a href='/register'> registering</a> (if you are already logged in, this will take you directly to your list of URLs.<br><br>Please note that certain features (including viewing a user's full list of URLs and editing shortURLs can <b><i>only</i></b> be accessed by each account's respective authorized user.</p>")
  }
  else {
    let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]["longURL"],
                       user: users[req.session.user_id]
                     };
  res.render("urls_show", templateVars);
  }
})

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined){
    res.send("<p>That shortURL does not exist</p>")
  }
  else {
  let longURL = urlDatabase[req.params.shortURL]["longURL"]
  res.redirect(longURL);
  }
})

// Registration page
app.get("/register", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls")
  }
  else {
  var templateVars = { user: users[req.session.user_id]}
  res.render("urls_register", templateVars)
  }
})

//Login PAge
app.get("/login", (req, res) => {
  res.render("urls_login")
})

app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls")
  }
  else {
    res.redirect("/login")
  }
})

// List of all URLs. This assigns what is typed as the longURL as a random variable (then stored as a key in the urlDatabase object), and which is saved in the
//urlDatabase. Pulls in data from entry form in urls_new.ejs
app.post("/urls", (req, res) => {
  var randomValue = generateRandomString();
  urlDatabase[randomValue] = {};
  urlDatabase[randomValue]["longURL"] = req.body["longURL"];
  urlDatabase[randomValue]["id"] = req.session.user_id
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]["id"] === req.session.user_id){
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  }
  else {
    return
  }
})

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id]["id"] === req.session.user_id){
    urlDatabase[req.params.id]["longURL"] = req.body["longURL"]
    res.redirect("/urls")
  }
  else {
    return
  }
})

// Logs an existing user into system. Searches through existing entries in user database
// to see if he/she is an existing user, then displays 403 if not an existing user.
app.post("/login", (req, res) => {
  for (var i in users) {
    if (req.body.email === users[i]["email"]){
        if (bcrypt.compareSync(req.body.password, users[i]["password"])){
          req.session.user_id = users[i]["id"]
          res.redirect('/urls');
          }
        else {
          res.status(403).send()
          }
        return
    }
  }
})

// Logs user out and clears their cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

// Registers and adds a user to users database. Prevents duplicate users from being created.
// Also prevents account creation without them having also created a password
app.post("/register", (req, res) => {
  for (var i in users){
    if (users[i]["email"] === req.body.email){
      res.status(404).send("User already exists in our database")
    }
  }
  if (!req.body.email || !req.body.password){
    res.status(400).send("Email and Password Fields cannot be blank")
  } else {
  var newlyRegisteredUserID = generateRandomString();
  users[newlyRegisteredUserID] = {}
  users[newlyRegisteredUserID]["id"] = newlyRegisteredUserID;
  users[newlyRegisteredUserID]["email"] = req.body["email"];
  var password = req.body["password"]
  users[newlyRegisteredUserID]["password"] = bcrypt.hashSync(password, 10)
  req.session.user_id = newlyRegisteredUserID;
  res.redirect("/urls")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
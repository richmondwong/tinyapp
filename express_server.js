let express = require('express');
var app = express();
const bodyParser = require("body-parser");
var PORT = 8080;
var cookieParser = require('cookie-parser');

const userIDCookie = "user_id";

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", id: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", id: "mikejones"}
};

const users = {
    "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "mikejones": {
    id: "mikejones",
    email: "mike@mike.com",
    password: "mike123"
  },
  "bettychau": {
    id: "bettychau",
    email: "betty@betty.com",
    password: "betty123"
  }
}

// New URL creation page. Only allows in newly registered or existing users (ie. those with a cookie)
app.get('/urls/new', (req, res) => {
  if (!req.cookies[userIDCookie]){
    res.redirect('/login');
  }
  else {
  res.render('urls_new');
  }
});

app.get('/urls/:id', (req, res) => {
  if (!req.cookies[userIDCookie]){
    res.render('no_login_error');
  }
  else {
  let templateVars = {
    longURL: urlDatabase[req.params.id]["longURL"],
    shortURL: req.params.id,
  };
  res.render('urls_show', templateVars);
}
})

// Displays list of all URLs created by user. Only allows access to those with a cookie (Ie. newly
// registered users or those in the existing user database)
app.get('/urls' , (req, res) => {
  if (!req.cookies[userIDCookie]){
    res.render('no_login_error');
    return;
  }
  let templateVars = {
    urls: urlDatabase,
    username: users[req.cookies[userIDCookie]]
  }
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  var shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
})

// Registration page
app.get('/register', (req, res) => {
  res.render('urls_register')
})

// Login page
app.get('/login', (req, res) => {
  res.render('urls_login');
})

// Logs user out and clears their cookie
app.post('/logout', (req, res) => {
  res.clearCookie(userIDCookie);
  res.redirect('/login');
})

// List of all URLs. This assigns what is typed as the longURL as a random variable (then stored as a key in the urlDatabase object), and which is saved in the
//urlDatabase. Pulls in data from entry form in urls_new.ejs
app.post('/urls', (req, res) => {
  var randomValue = generateRandomString();
  urlDatabase[randomValue] = {};
  urlDatabase[randomValue]["longURL"] = req.body["longURL"];
  urlDatabase[randomValue]["id"] = req.cookies["user_id"];
  res.redirect(`/urls/${randomValue}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Individual ShortURL page. Allows user to change the longURL and accordingly updates urlDatabase.
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id]["longURL"] = req.body.newLongURL;
  res.redirect('/urls');
});

// Logs an existing user into system. Searches through existing entries in user database
// to see if he/she is an existing user, then displays 403 if not an existing user.
app.post("/login", (req, res) => {
  for (var userAccount in users) {
    if (req.body.username === users[userAccount]["email"]){
        if (req.body.password === users[userAccount]["password"]){
            res.cookie(userIDCookie, users[userAccount]["id"]);
            res.redirect('/urls');
          }
        else {
          res.status(403).send();
          }
        return;
    }
  }
   res.redirect('/login');
});

// Registers and adds a user to users database. Prevents duplicate users from being created.
// Also prevents account creation without them having also created a password
app.post('/register', (req, res) => {
  for (var userID in users){
    if (req.body["email"] === users[userID]["email"]){
      res.status(400).send();
    }
  }
  if (!req.body["email"] || !req.body["password"]){
    res.status(400).send()
  }
    randomUserID = generateRandomString();
    users[randomUserID] = {};
    users[randomUserID]["ID"] = randomUserID;
    users[randomUserID]["email"] = req.body["email"];
    users[randomUserID]["password"] = req.body["password"];
    res.cookie(userIDCookie, randomUserID);
    res.redirect('/urls');
});

function generateRandomString() {
  var allValues = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var randomValue = "";
  for (var i = 6; i > 0; i--){
    var numberPicker = Math.floor(Math.random() * allValues.length);
    var selectedValue = allValues.substring(numberPicker, numberPicker + 1).toString();
    randomValue += selectedValue;
  }
  return randomValue;
}

app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
})


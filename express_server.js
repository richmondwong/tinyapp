//Need a button for making new URLS whne they have been deleted

let express = require('express');
var app = express();
const bodyParser = require("body-parser");
var PORT = 8080;
var cookieParser = require('cookie-parser')

const userIDCookie = "user_id"

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  // "b2xVn2": {longURL: "http://www.lighthouselabs.ca", id: "userRandomID"},
  // "9sm5xK": "http://www.google.com"


  // "9sm5xK": {
  //   shortURL: 9sm5xK,
  //   id: userRandomID,
  //   longURL: "http://www.google.com"
  // },

  // "abc": {
  //   id: users.id,
  //   shortURL: req.params.shortURL,
  //   longURL: req.params.longURL
  // }



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

///Make new URL
app.get('/urls/new', (req, res) => {
  if (!req.cookies[userIDCookie]){
    res.redirect('/login')
  }
  else {
  console.log("This is .REQ COOKIES URLS/NEW...: ", req.cookies)
  res.render('urls_new');
  // res.redirect('/urls')
  // res.render('/urls')
  }
});

/////Passes database information (short & long URL) to urls_show (the individual shortURL page)
app.get('/urls/:id', (req, res) => {
  if (!req.cookies[userIDCookie]){
    res.render('no_login_error')
  }
  else {

  console.log("This is urlDatabase inside urls/:id", urlDatabase)


  let templateVars = {
    // longURL: urlDatabase[req.params.id],
    longURL: urlDatabase[req.params.id]["longURL"],
    shortURL: req.params.id,
  };
  console.log("This is templateVars longURL", templateVars["longURL"])
  console.log("This is templateVars shortURL", templateVars["shortURL"])
  res.render('urls_show', templateVars)
}
})

/// Index Page. Passes database information to the main index page
app.get('/urls' , (req, res) => {

  console.log("This is REQ Cookies in /urls from /register: ", req.cookies[userIDCookie])
  console.log("REQ COOKIES in urls from /URLS POST: ", req.cookies)

  if (!req.cookies[userIDCookie]){
    // res.render('urls_index');
    res.render('no_login_error');
    return
  }

  let templateVars = {
    urls: urlDatabase,
    // username: users[req.cookies[userIDCookie]]["email"]
    // username: users[req.cookies[userIDCookie]]
    username: users[req.cookies[userIDCookie]]
  }
  console.log("This is templateVars: ", templateVars)
  console.log("This is templateVars[username]: ", templateVars["username"])
  console.log("This is urlDatabase:", urlDatabase)
  res.render('urls_index', templateVars)
});

///GET SOME JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
});

//REDIRECTS THE PAGE TO THE ACTUAL PAGE OF THE LONGURL. IS THIS NEEDED?
app.get('/u/:shortURL', (req, res) => {
  var shortURL = req.params.shortURL;
  /// ASK ABOUT THIS
  res.redirect(urlDatabase[shortURL]);
  // res.render(urlDatabase[shortURL]);
})

// BROKEN --- LOADS THE REGISTER.EJS PAGE
app.get('/register', (req, res) => {
  res.render('urls_register')
})

// LOADS THE LOGIN.EJS PAGE
app.get('/login', (req, res) => {
res.render('urls_login')
})

//LOGOUT (POST)
app.post('/logout', (req, res) => {
  // console.log("Clear Cookie: ", userIDCookie)
  res.clearCookie(userIDCookie);
  // res.redirect('/urls')
  res.redirect('/login')
})

// MAIN PAGE - CHANGES THE LONGURL TO ANOTHER WHILE KEEPING SAME SHORTURL
app.post('/urls', (req, res) => {
  console.log("This is REQ Cookies linking to urls_new.ejs /register: ", req.cookies["userIDCookie"])
  console.log("REQ COOKIES linking to urls_new.ejs /URLS: ", req.cookies)
  console.log("urlDatabase before random number", urlDatabase)
  var randomValue = generateRandomString();
  // This assigns what is typed as the longURL as a random variable (then stored as a key in the urlDatabase object), and which is saved in the
  //urlDatabase. Pulls in data from entry form in urls_new.ejs

  /// URL CREATION HERE!
  urlDatabase[randomValue] = {};
  urlDatabase[randomValue]["longURL"] = req.body["longURL"];
  urlDatabase[randomValue]["id"] = req.cookies["user_id"]
  console.log(urlDatabase);
  ////////////urlDatabase[randomValue]["id"] = users["WHAT GOES HERE"]["id"]///////////
  res.redirect(`/urls/${randomValue}`)
});

/// PAGE IS BROKEN - POST - INDEX.EJS
// FROM ACTION="/SHORTURL/DELETE" IN URLS_INDEX PAGE?
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Individual ShortURL page. Edits the URL and updates database.
app.post('/urls/:id', (req, res) => {
  // console.log("REQ BODY:", req.body )
  urlDatabase[req.params.id] = req.body.newLongURL
  res.redirect('/urls');
});

// LOGS A USER (POST) --> Searches through existing entries in user database
app.post("/login", (req, res) => {
  for (var userAccount in users) {
    if (req.body.username === users[userAccount]["email"]){
        if (req.body.password === users[userAccount]["password"]){
          // console.log("req.body.password: ", req.body.password)
          // console.log("users[userAccount][password] ", users[userAccount]["password"])
          // console.log("users[userAccount][id]: ", users[userAccount]["id"])
// Creates a cookie for this logged in user (with prior account created)
          res.cookie(userIDCookie, users[userAccount]["id"])
          res.redirect('/urls');
          }
        else {
          res.status(403).send()
          }
        return
    }
  }
   res.redirect('/login');
});

// REGISTERS A USER (POST) --> Adds to users database
app.post('/register', (req, res) => {
// Prevents duplicate users from being created
  for (var userID in users){
    if (req.body["email"] === users[userID]["email"]){
      res.status(400).send();
    }
  }
//Prevents account creation without them having also created a password
  if (!req.body["email"] || !req.body["password"]){
    res.status(400).send()
  }
//Should the above two conditions be skipped, we move here. Create a random num.
//Then, create empty Object. Then, create keys (strings) of "ID", "email" and "password"
//User email is pulled from entry form "email", password from entry form "password"
  randomUserID = generateRandomString()
  users[randomUserID] = {};
  users[randomUserID]["ID"] = randomUserID;
  users[randomUserID]["email"] = req.body["email"];
  users[randomUserID]["password"] = req.body["password"];
  console.log("This is users after account registration: ", users)
  // urlDatabase[randomUserID] = urlDatabase["id"]
//Creates a cookie called "userIDCookie", with randomUserID saved to it. For a newly
//registered user
  res.cookie(userIDCookie, randomUserID)
  ////// console.log("This is REQ Cookies /register: ", req.cookies["userIDCookie"])///////
//Go to main page after account registration
  res.redirect('/urls');
});

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

function urlsForUser(id){

}

app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
})


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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params.id],
    shortURL: req.params.id,
  };
  res.render('urls_show', templateVars)
})

app.get('/urls' , (req, res) => {

  let templateVars = {
    urls: urlDatabase,
    username: users[req.cookies[userIDCookie]]["email"]
  }

  // if (!req.cookies[userIDCookie]){
  //   res.render('urls_index');
  //   return
  // }
  res.render('urls_index', templateVars)
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
});

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.get('/u/:shortURL', (req, res) => {
  var shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
})

app.get('/register', (req, res) => {
  res.render('urls_register')
})

app.get('/login', (req, res) => {
res.render('urls_login')
})

app.post('/logout', (req, res) => {
  console.log("Clear Cookie: ", userIDCookie)
  res.clearCookie(userIDCookie);
  // res.redirect('/urls')
  res.redirect('/login')
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  var randomValue = generateRandomString();
  urlDatabase[randomValue] = req.body["longURL"]
  res.redirect(`/urls/${randomValue}`)
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  console.log("REQ BODY:", req.body )
  urlDatabase[req.params.id] = req.body.newLongURL
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  for (var userAccount in users) {
    if (req.body.username === users[userAccount]["email"]){
        if (req.body.password === users[userAccount]["password"]){
          console.log("req.body.password: ", req.body.password)
          console.log("users[userAccount][password] ", users[userAccount]["password"])
          console.log("users[userAccount][id]: ", users[userAccount]["id"])
          res.cookie(userIDCookie, users[userAccount]["id"])
          res.redirect('/urls');
          }
        else {
          res.status(403).send()
          }
        return
    }
  }
  console.log(users)
   res.redirect('/login');
});

app.post('/register', (req, res) => {

  for (var userID in users){
    if ( req.body["email"] === users[userID]["email"]){
      res.status(400).send();
    }
  }

  if (!req.body["email"] || !req.body["password"]){
    res.status(400).send()
  }

  randomUserID = generateRandomString()
  users[randomUserID] = {};
  users[randomUserID]["ID"] = randomUserID;
  users[randomUserID]["email"] = req.body["email"];
  users[randomUserID]["password"] = req.body["password"];
  console.log(users)
  res.cookie(userIDCookie, randomUserID)
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

app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
})


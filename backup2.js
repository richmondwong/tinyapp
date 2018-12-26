var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// var urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
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



// GET REQUESTS
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]){
    res.redirect("/login")
  }
  else {
  // if (req.cookies["user_id"]){}
  // var templateVars = { username: req.cookies["username"]}
  var templateVars = { user: users[req.cookies["user_id"]]}
  // res.render("urls_new", templateVars)
  res.render("urls_new", templateVars)
  }
})

app.get("/urls", (req, res) => {
  console.log("This is /urls req.cookies: ", req.cookies["username"])
  var templateVars = { urls: urlDatabase,
                      user: users[req.cookies["user_id"]]
                       // username: req.cookies["username"]
                     }
  // res.render("urls_index", templateVars)
  console.log("This is templateVars after passing in user object: ", templateVars)
  res.render("urls_index", templateVars)
})


app.get("/urls/:id", (req, res) => {
  // console.log(req.cookies("username"))
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       user: users[req.cookies["user_id"]]
                       // username: req.cookies["username"]
                     };
  // res.render("urls_show", templateVars);
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  console.log(longURL)
  //Need something to handle http://
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  var templateVars = { user: users[req.cookies["user_id"]]
                       // username: req.cookies["username"]
                      }
  // res.render("urls_register", templateVars)
  res.render("urls_register", templateVars)
})


app.get("/login", (req, res) => {
  res.render("urls_login")
})

// POST REQUESTS

app.post("/urls", (req, res) => {
  var randomValue = generateRandomString();
  urlDatabase[randomValue] = req.body["longURL"]
  console.log(urlDatabase)
  res.redirect(`/urls/${randomValue}`)
})

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params)
  console.log("This is before deletion: ", urlDatabase)
  delete urlDatabase[req.params.id]
  console.log("This is after deletion: ", urlDatabase)
  console.log(req.cookies("username"))
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  console.log(req.body["longURL"])
  urlDatabase[req.params.id] = req.body["longURL"]
  console.log(urlDatabase)
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  //Set 1:
  // console.log("This is the cookie: ", res.cookie())
  // console.log("This is username body: ", setCookie)

  //Set 2:
  // console.log("This is req body: ", req.body["username"])
  // res.cookie("username", req.body["username"]);
  // res.redirect("/urls")
  console.log("This is /login req.body[email]: ", req.body["email"])
  console.log("This is /login req.body[password]: ", req.body["password"])

  for (var i in users) {
    if (req.body.email === users[i]["email"]){
        if (req.body.password === users[i]["password"]){
          res.cookie("user_id", users[i]["id"])
          res.redirect('/urls');
          }
        else {
          res.status(403).send()
          }
        return
    }
  }


})

app.post("/logout", (req, res) => {
  // res.clearCookie("username")
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password){
    res.status(400).send()
  } else {
  var newlyRegisteredUserID = generateRandomString();
  users[newlyRegisteredUserID] = {}
  users[newlyRegisteredUserID]["id"] = newlyRegisteredUserID;
  users[newlyRegisteredUserID]["email"] = req.body["email"];
  users[newlyRegisteredUserID]["password"] = req.body["password"];
  console.log("This is the newly added urlDatabase: ", users)

  res.cookie("user_id", newlyRegisteredUserID);
  res.redirect("/urls")
  }

})

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
});



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

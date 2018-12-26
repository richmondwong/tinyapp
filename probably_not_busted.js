var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['whaddup_bro'],
  maxAge: 24 * 60 * 60 * 1000
}))

app.set("view engine", "ejs");

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



// GET REQUESTS
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id){
    res.redirect("/login")
  }
  else {
  // if (req.cookies["user_id"]){}
  // var templateVars = { username: req.cookies["username"]}
  var templateVars = { user: users[req.session.user_id]}
  // res.render("urls_new", templateVars)
  res.render("urls_new", templateVars)
  }
})

app.get("/urls", (req, res) => {
  if (!req.session.user_id){
    //Do not display index if not logged in.
      // Instead, display message/prompt that they login/register first
    res.send("<p>Please <a href='/login'>login</a> or <a href='/register'> register</a> to use TinyApp!</p>")
  }
  else {
    // Filter list of URLs according to userID of cookie
    // Filtering should happen before data sent to template
    var newlyFilteredList = urlsForUser(req.session.user_id)
    console.log("This is /urls req.cookies: ", req.cookies["username"])
    var templateVars = { urls: newlyFilteredList,
                      // urls: urlDatabase,
                      user: users[req.session.user_id]
                       // username: req.cookies["username"]
                     }
  // res.render("urls_index", templateVars)
    console.log("This is templateVars after passing in user object: ", templateVars)
    res.render("urls_index", templateVars)
  }
  // This also. means /urls/:id should have message/prompt if (1.) user not logged in;
  // or (2.) /:id does not belong to them
})


app.get("/urls/:id", (req, res) => {

  if (urlDatabase[req.params.id] === undefined){
    res.send("<p>This shortURL does not exist. Return to the <a href='/urls'>main page</a></p>")
  }
  else if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.id]["id"]){
    res.send("<p><h3>Cannot access a URL that does not belong to you.</h3> <br> Please <a href='/login'>login</a> using correct credentials to view that account's full list of URLs. You may also create a new account by <a href='/register'> registering</a>.<br><br>Please note that certain features (including viewing a user's full list of URLs and editing shortURLs can <b><i>only</i></b> be accessed by each account's respective authorized user.</p>")
  }
  else {
    // console.log(req.cookies("username"))
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]["longURL"],
                       user: users[req.session.user_id]
                       // username: req.cookies["username"]
                     };
  // res.render("urls_show", templateVars);
  res.render("urls_show", templateVars);
  }
})

app.get("/u/:shortURL", (req, res) => {
  // let longURL = urlDatabase[req.params.shortURL]

  if (urlDatabase[req.params.shortURL] === undefined){
    res.send("<p>That shortURL does not exist</p>")
  }
  else {
  let longURL = urlDatabase[req.params.shortURL]["longURL"]

  // if (longUrl.substring(0,7) !== "http://"){
  //   var prefix = "http://";
  //   var properURL = prefix.concat(longURL)
  //   res.redirect(properURL)
  // }
  // else { }
  console.log(longURL)
  //Need something to handle http://
  res.redirect(longURL);
  }
})

app.get("/register", (req, res) => {

  if (req.session.user_id){
    res.redirect("/urls")
  }
  else {
  var templateVars = { user: users[req.session.user_id]
                       // username: req.cookies["username"]
                      }
  // res.render("urls_register", templateVars)
  res.render("urls_register", templateVars)
  }
})


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

// POST REQUESTS

app.post("/urls", (req, res) => {
  var randomValue = generateRandomString();
  urlDatabase[randomValue] = {};
  urlDatabase[randomValue]["longURL"] = req.body["longURL"];
  urlDatabase[randomValue]["id"] = req.session.user_id
  // urlDatabase[randomValue] = req.body["longURL"]
  console.log(urlDatabase)
  // res.redirect(`/urls/${randomValue}`)
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {

  console.log("This is /delete req.cookies: ", req.cookies["user_id"])

  // for (var i in urlDatabase){
  //   if (urlDatabase[i]["id"] === req.cookies["user_id"]){
  //     delete urlDatabase[req.params.id]
  //     res.redirect("/urls")
  //   }
  // }

  if (urlDatabase[req.params.id]["id"] === req.session.user_id){
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  }
  else {
    return
  }


  // console.log(req.params)
  // console.log("This is before deletion: ", urlDatabase)

  // delete urlDatabase[req.params.id]

  // delete urlDatabase[req.params.id]
  // console.log("This is after deletion: ", urlDatabase)
  // res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  console.log("This is a test of the editing system")
  console.log(req.body["longURL"])

  if (urlDatabase[req.params.id]["id"] === req.session.user_id){
    urlDatabase[req.params.id]["longURL"] = req.body["longURL"]
    res.redirect("/urls")
  }
  else {
    return
  }



  // urlDatabase[req.params.id]["longURL"] = req.body["longURL"]

  // urlDatabase[req.params.id] = req.body["longURL"]

  // console.log(urlDatabase)
  // res.redirect("/urls")
})

app.post("/login", (req, res) => {
  console.log("This is /login req.body[email]: ", req.body["email"])
  console.log("This is /login req.body[password]: ", req.body["password"])

  for (var i in users) {
    if (req.body.email === users[i]["email"]){
        // if (req.body.password === users[i]["password"]){
        if (bcrypt.compareSync(req.body.password, users[i]["password"])){
          // res.cookie("user_id", users[i]["id"])
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

app.post("/logout", (req, res) => {
  // res.clearCookie("username")
  // res.clearCookie("user_id")
  req.session = null;
  res.redirect("/urls")
})

// app.post("/register", (req, res) => {

//   for (var i in users){
//     console.log("This is inside the post register loop: ", i)
//     // console.log(users[i])
//     console.log("This is the email address ", users[i]["email"])
//     // if (users[i]["email"] === req.body.password){
//     //   res.send("User already exists in our database")
//     }

//   if (!req.body.email || !req.body.password){
//     res.status(400).send("Email and Password Fields cannot be blank")
//   } else {
//   var newlyRegisteredUserID = generateRandomString();
//   users[newlyRegisteredUserID] = {}
//   users[newlyRegisteredUserID]["id"] = newlyRegisteredUserID;
//   users[newlyRegisteredUserID]["email"] = req.body["email"];
//   // users[newlyRegisteredUserID]["password"] = req.body["password"];
//   var password = req.body["password"]
//   users[newlyRegisteredUserID]["password"] = bcrypt.hashSync(password, 10)
//   console.log("This is the newly added urlDatabase: ", users)

//   // res.cookie("user_id", newlyRegisteredUserID);
//   req.session.user_id = newlyRegisteredUserID;
//   res.redirect("/urls")
//   }

// });


app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password){
    res.status(400).send("Email and Password Fields cannot be blank")
  } else {
  var newlyRegisteredUserID = generateRandomString();
  users[newlyRegisteredUserID] = {}
  users[newlyRegisteredUserID]["id"] = newlyRegisteredUserID;
  users[newlyRegisteredUserID]["email"] = req.body["email"];
  // users[newlyRegisteredUserID]["password"] = req.body["password"];
  var password = req.body["password"]
  users[newlyRegisteredUserID]["password"] = bcrypt.hashSync(password, 10)
  console.log("This is the newly added urlDatabase: ", users)

  // res.cookie("user_id", newlyRegisteredUserID);
  req.session.user_id = newlyRegisteredUserID;
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


function urlsForUser(id){

  var urlDatabaseFiltered = {};

  for (var i in urlDatabase){
    if (id === urlDatabase[i]["id"]){
      urlDatabaseFiltered[i] = urlDatabase[i]
    }
  }
  return urlDatabaseFiltered
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
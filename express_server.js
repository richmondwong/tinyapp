var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};





// GET REQUESTS
app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})

app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]
                     };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  console.log(longURL)
  //Need something to handle http://
  res.redirect(longURL);
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
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  console.log(req.body["longURL"])
  urlDatabase[req.params.id] = req.body["longURL"]
  console.log(urlDatabase)
  res.redirect("/urls")
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

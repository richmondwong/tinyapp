let express = require('express');
var app = express();
const bodyParser = require("body-parser");
var PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params.id],
    shortURL: req.params.id
  };
  res.render('urls_show', templateVars)
})

app.get('/urls' , (req, res) => {
  let templateVars = { urls: urlDatabase}
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
  // console.log("REQ PARAMS:", req.params.shortURL)
  // console.log(urlDatabase)
  var shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  var randomValue = generateRandomString();
  urlDatabase[randomValue] = req.body["longURL"]
  res.redirect(`/urls/${randomValue}`)
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

generateRandomString()

app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
})




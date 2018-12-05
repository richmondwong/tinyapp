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

app.get(`/${generateRandomString()}`,(req, res) => {
    return res.redirect(301, 'http://www.google.com' + req.originalURL)
  })

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

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

function randomString() {
  var allValues = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var randomValue = ""
  console.log(allValues.length)

  for (var i = 6; i > 0; i--){
    var numberPicker = Math.floor(Math.random() * allValues.length)
    var selectedValue = allValues.substring(numberPicker, numberPicker + 1).toString()
    console.log(selectedValue)
    randomValue += selectedValue
    // console.log(selectedValue)
  }
  urlDatabase[randomValue] = "http://www.test.com"
  return randomValue
}

randomString()


app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
})




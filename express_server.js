const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).slice(6);
};

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase);
  const editedURL = req.body.newURL;
  const editedShortURL = req.params.shortURL;
  urlDatabase[editedShortURL] = editedURL;
  res.redirect("/urls")
}) 


app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//Using Cookie, make a userID
//not sure It's workign properly
app.post("/login", (req, res) => {
  const userID = req.body.username;
  res.cookie('name', userID);
  res.redirect(`/urls`);
})

//making login as : username
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["name"],
    urls: urlDatabase 
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// app.get("/urls", (req, res) => {
//   const templateVars = {
//     username: req.cookies["name"],
//     // ... any other vars
//   };
//   console.log(templateVars.username);
//   res.render("urls_index", templateVars);
// });

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL:  urlDatabase[req.params.shortURL]
  }
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });
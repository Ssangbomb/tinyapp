const express = require("express");
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(morgan('dev'));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  adc: {
    id: "abc",
    email: "a@a.com",
    password: "1234",
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: "5678",
  },
};

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).substring(6);
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

app.post("/logout", (req, res) => {
  const userID = req.body.username;
  res.clearCookie('name', userID)
  res.redirect(`/urls`);
})

//registration userID, email and password
app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  //check if email and password were NOT provided
  if(!newUserEmail || !newUserPassword) {
    return res.status(400).send('Please provide an email AND a password');
  }

  // check if a user with this email already exists
  let foundUser = null;
  for(const userId in users) {
    const user = users[userId];
    if(user.email === newUserEmail) {
      // Found user
      foundUser = user;
    }
  }
  if(foundUser) {
    return res.status(400).send('a user with that email already exists');
  }
  const uniqueId = Math.random().toString(36).substring(2, 5);
  res.cookie('user_id', uniqueId);
  // const newUser = res.cookie('name', userID);
  const newUser = {
    id: uniqueId,
    email: newUserEmail,
    password: newUserPassword
  }
  users[uniqueId] = newUser;
  console.log(users);
  res.redirect("/urls")
})


//user email and password
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["name"]
  }
  res.render("register", templateVars);
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

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["name"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL:  urlDatabase[req.params.shortURL],
    username: req.cookies["name"]
  }
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
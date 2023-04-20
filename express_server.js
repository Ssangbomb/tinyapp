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
  abc: {
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

// Do I need a function?
function getUserByEmail(email) {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      // Found user
      return user;
    }
  }
  return null;
}

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
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
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }

  let foundUser = null;

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      // we found our user!!!
      foundUser = user;
    }
  }

  if (!foundUser) {
    return res.status(400).send('no user with that email found');
  }

  if (foundUser.password !== password) {
    return res.status(400).send('passwards do not match');
  }


  res.cookie('user_id', foundUser.id);


  res.redirect(`/urls`);
})

app.post("/logout", (req, res) => {
  const userId = req.body.user;
  res.clearCookie('user_id', userId)
  res.redirect(`/login`);
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

  if(getUserByEmail(newUserEmail)) {
    return res.status(400).send('a user with that email already exists');
  }
  const uniqueId = Math.random().toString(36).substring(2, 5);
  res.cookie('user_id', uniqueId);
  const newUser = {
    id: uniqueId,
    email: newUserEmail,
    password: newUserPassword
  }
  users[uniqueId] = newUser;
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId];
  const templateVars = {
    user : user
  }
  res.render("login", templateVars);
})

//user email and password
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId];
  const templateVars = {
    user : user
  }
  res.render("register", templateVars);
})

//update it show email and url
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId];
  console.log("userId", userId);
  console.log("users[userId]", users[userId]);
  const templateVars = { 
    user : user,
    urls : urlDatabase 
  };
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
  const userId = req.cookies["user_id"]
  const user = users[userId];
  const templateVars = {
    user : user,
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId];
  const templateVars = { 
    user : user,
    shortURL: req.params.shortURL,
    longURL:  urlDatabase[req.params.shortURL],
  }
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
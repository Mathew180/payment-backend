const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Your signup and login routes will go here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const users = []; // In-memory storage for simplicity

// Signup route
app.post('/signup', (req, res) => {
  const { fname,lname,email,username, password, country } = req.body;

  // Check if user already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create a new user and store in memory
  users.push({ fname,lname,email,username, password,country });
  res.status(201).json({ message: 'Signup successful' });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the users array
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Logged successful' });
  
});

//never unveil used

//garden globe balance

//estate harvest afford

//leisure crystal mask
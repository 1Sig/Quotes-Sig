const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/user');
const { v4: uuidv4 } = require('uuid'); // Import UUID library

// Create an instance of the Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Quotes')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Set up session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Set up view engine for EJS
app.set('view engine', 'ejs');

// Set up JSON parsing for request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Homepage route
app.get('/', (req, res) => {
  res.render('index');
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Register route
app.get('/register', (req, res) => {
  res.render('register');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user });
});

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password, password2 } = req.body;
    if (!username || !password || !password2) {
      return res.status(400).send('All fields are required');
    }
    if (password !== password2) {
      return res.status(400).send('Passwords do not match.');
    }

    // Generate a unique user ID
    const userId = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document in MongoDB
    const newUser = new User({ userId, username, password: hashedPassword });
    await newUser.save();

    res.redirect('/dashboard'); // Redirect to dashboard after registration
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('An error occurred while registering user.');
  }
});

// Login post route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid username or password');
    }

    // Store the user data in session
    req.session.user = user;
    res.redirect('/dashboard'); // Redirect to dashboard after login
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('An error occurred while logging in user.');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
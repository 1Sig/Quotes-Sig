const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/user');
const { v4: uuidv4 } = require('uuid');

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

app.use(express.urlencoded({ extended: true }));

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
    const errors = []; // Define an empty array of errors
    res.render('register', { errors });
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
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Confirm Password:', password2);

    // Check if username, password, and password2 are empty strings
    if (!username || !password || !password2 || !username.trim() || !password.trim() || !password2.trim()) {
      const errors = ['All fields need to be filled'];
      return res.render('register', { errors });
    }

    // Check if password and confirm password match
    if (password !== password2) {
      const errors = ['Passwords do not match'];
      return res.render('register', { errors });
    }

    // Generate a unique user ID
    const userId = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document in MongoDB
    const newUser = new User({ userId, username, password: hashedPassword });
    await newUser.save();

    req.session.user = newUser;
    res.redirect('/dashboard'); // Redirect to dashboard after registration
  } catch (error) {
    console.error('Error registering user:', error);
    const errors = ['An error occurred while registering user'];
    res.render('register', { errors });
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
  res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

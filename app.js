const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/user');

// Create an instance of the Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Qoutes')
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

// Sett opp visningsmotoren til EJS
app.set('view engine', 'ejs');

// Set up JSON parsing for request bodies
app.use(express.json());

// Parse URL-encoded bodies for form submissions
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Sett opp rute for hjemmesiden
app.get('/', (req, res) => {
  res.render('index');
});

// Sett opp rute for login-siden
app.get('/login', (req, res) => {
  res.render('login');
});

// Sett opp rute for register-siden
app.get('/register', (req, res) => {
  res.render('register');
});

// Rute for user
app.get('/user', (req, res) => {
  res.render('user');
});

app.get('/dashboard', async (req, res) => {
    try {
      // Assuming you have stored the user ID in the session after login
      const userId = req.session.userId;
      
      // Retrieve the user data from MongoDB based on the user ID
      const user = await User.findById(userId);
  
      // Pass the user data to the dashboard view
      res.render('dashboard', { user });
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).send('An error occurred while retrieving user data.');
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if username and password are provided
      if (!username || !password) {
        return res.status(400).send('Username and password are required');
      }
  
      // Retrieve user from MongoDB based on the provided username
      const user = await User.findOne({ username });
  
      // Check if user exists
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Check if the provided password matches the user's password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send('Invalid password');
      }
  
      // Store user ID in session
      req.session.userId = user._id;
  
      // Redirect to the user's dashboard
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).send('An error occurred while logging in.');
    }
  });

// Registration Route
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
    const userId = generateUserId();

    // Create a new user document in MongoDB
    const newUser = new User({ userId, username, password });
    await newUser.save();

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('An error occurred while registering user.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
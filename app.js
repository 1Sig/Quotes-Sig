const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/user');
const Quote = require('./models/quote');
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
app.get('/', async (req, res) => {
  try {
    // Fetch a random quote from the database
    const randomQuote = await Quote.aggregate([{ $sample: { size: 1 } }]);
    const quoteText = randomQuote.length > 0 ? randomQuote[0].quote : "No quotes available";

    // Get user information from session
    const user = req.session.user;

    // Render the homepage template with the random quote and user information
    res.render('index', { quote: quoteText, user: user });
  } catch (error) {
    console.error('Error fetching random quote:', error);
    // If an error occurs, render the homepage template without a quote
    res.render('index', { quote: "Failed to fetch quote", user: null });
  }
});
// Login route
app.get('/login', (req, res) => {
  const errors = [];  // Define an empty array of errors
  const user = req.session.user;
  res.render('login', { errors, user});
});

// Register route
app.get('/register', (req, res) => {
    const errors = []; // Define an empty array of errors
    const user = req.session.user;
    res.render('register', { errors, user});
  });

// Dashboard route
app.get('/dashboard', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.redirect('/login');
    }

    // Fetch quotes from the database
    const quotes = await Quote.find({ userId: user.userId });

    res.render('dashboard', { user, quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).render('error', { message: 'An error occurred while fetching quotes.' });
  }
});

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password, password2 } = req.body;

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

    // Create a new user document in MongoDB without hashing the password
    const newUser = new User({ userId, username, password });
    await newUser.save();

    req.session.user = { userId, username }; // Corrected assignment of user object
    console.log('User registered:', newUser); // Corrected console log statement
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

    // Check if username and password are provided
    if (!username || !password) {
      const errors = ['Username and password are required'];
      return res.render('login', { errors });
    }

    // Find the user by username
    const user = await User.findOne({ username });

    // Ensure the user object exists
    if (!user) {
      console.log('User not found.');
      const errors = ['Invalid username'];
      return res.render('login', { errors });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const errors = ['Invalid username or password'];
      return res.render('login', { errors });
    }

    // Store the user data in session
    req.session.user = { userId: user.userId, username: user.username }; // Set userId and username in session
    console.log('User logged in:', user.username); // Corrected console log statement
    res.redirect('/dashboard'); // Redirect to dashboard after login
  } catch (error) {
    console.error('Error logging in user:', error);
    const errors = ['An error occurred while logging in user.']; // Define an array of errors
    res.render('login', { errors });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Quote posting route
app.post('/post-quote', async (req, res) => {
  try {
    const { quote } = req.body;

    // Check if the quote text is provided
    if (!quote) {
      return res.status(400).json({ error: 'Quote text is required.' });
    }

    // Retrieve user information from the session
    const user = req.session.user;

    // Check if user information is available in the session
    if (!user || !user.userId || !user.username) {
      return res.status(400).json({ error: 'User information not found in session.' });
    }

    // Create a new quote document
    const newQuote = new Quote({ userId: user.userId, username: user.username, quote });
    await newQuote.save();

    res.status(201).json({ message: 'Quote posted successfully.', quote: newQuote });
  } catch (error) {
    console.error('Error posting quote:', error);
    res.status(500).json({ error: 'An error occurred while posting the quote.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
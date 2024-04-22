// Import necessary modules
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); 
const path = require('path');
const User = require('./models/user');
const routes = require('./routes');

// Create an instance of the Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Qoutes', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
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

// Set up routes
app.use('/', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

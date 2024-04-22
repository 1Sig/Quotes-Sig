const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// Registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Save user to database
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;

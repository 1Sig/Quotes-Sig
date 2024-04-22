const express = require('express');
const router = express.Router();

module.exports = function(app) {
  // Angi katalogen for statiske filer (CSS, JS, bilder)
app.use(express.static(path.join(__dirname, 'public')));

// Sett opp ruter for autentisering
app.use('/', authRoutes);

// Sett opp rute for hjemmesiden
app.get('/', (req, res) => {
  res.render('index');
});

app.get('css', (req, res) => {
    res.render('styles.css')
})

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


  return router;
};

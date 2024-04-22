// Importer Express og andre nødvendige moduler
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');

// Importer rutefilen for autentisering
const authRoutes = require('./routes/auth');

// Opprett en instans av Express-appen
const app = express();

// Konfigurer session-middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware for å gjøre brukeren tilgjengelig i malene
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Sett opp visningsmotoren til EJS
app.set('view engine', 'ejs');

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

// Start serveren
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

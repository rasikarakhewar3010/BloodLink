require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// Load config
const connectDB = require('./config/db');
require('./config/passport')(passport); // Pass passport object to config

// Connect to database
connectDB();

const app = express();

// EJS setup
app.set('view engine', 'ejs');
app.set('views', './views'); // Specify views directory

// Static assets
app.use(express.static('public'));

// Body parser middleware to handle form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // For handling JSON payloads if needed

// Express session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day in milliseconds
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash middleware (for flash messages)
app.use(flash());

// Global variables for flash messages and user
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // Passport authentication errors
  res.locals.user = req.user || null; // Add user to res.locals for EJS templates
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/doctor', require('./routes/doctor'));

// 404 Not Found Page
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
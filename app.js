require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware (Configured to allow Bootstrap CDN and inline scripts)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://dojxkzzppthldswzdllv.supabase.co", "https://cdn.jsdelivr.net"]
    }
  }
}));

// Rate Limiting for Login Routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 5 to 100 for testing purposes
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

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
    secret: process.env.SESSION_SECRET || 'fallback-secret-here', // Should exist in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
      httpOnly: true, // Prevent XSS access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict' // CSRF protection layer
    }
  })
);

// Connect Flash middleware (for flash messages)
app.use(flash());

const supabase = require('./config/supabase');

// Global variables for flash messages and user
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); 
  
  // Custom user auth injection for templates based on session access_token
  if (req.session?.access_token) {
    req.user = req.session.user_cache; // Use cached data initially
    
    if (!req.user) {
        // Fallback to fetch if not cached
        const { data: { user } } = await supabase.auth.getUser(req.session.access_token);
        if (user) {
            const { data: doctor } = await supabase.from('doctors').select('*').eq('auth_user_id', user.id).single();
            req.user = doctor;
            req.session.user_cache = doctor; 
        }
    }
  } else {
    req.user = null;
  }
  res.locals.user = req.user;
  res.locals.isAdmin = req.session?.isAdmin || false;
  next();
});

// Apply rate limiter to login routes
app.use('/doctor/login', loginLimiter);
app.use('/admin/login', loginLimiter);

// Routes
app.use('/', require('./routes/index'));
app.use('/doctor', require('./routes/doctor'));
app.use('/admin', require('./routes/admin'));

// 404 Not Found Page
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
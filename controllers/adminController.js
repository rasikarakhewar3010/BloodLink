const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');

// Show Admin Login Page
exports.getAdminLoginPage = (req, res) => {
  res.render('admin/login', { title: 'Admin Login' });
};

// Handle Admin Login (simple password check)
exports.postAdminLogin = (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true; // Set a session flag for admin access
    req.flash('success_msg', 'Admin logged in.');
    res.redirect('/admin/create-doctor');
  } else {
    req.flash('error_msg', 'Incorrect Admin Password.');
    res.redirect('/admin/login');
  }
};

// Show Create Doctor Page
exports.getCreateDoctorPage = (req, res) => {
  res.render('admin/create_doctor', { title: 'Create Doctor Account', errors: [] });
};

// Handle Doctor Creation
exports.createDoctor = async (req, res) => {
  const { username, password, password2, city } = req.body;
  let errors = [];

  if (!username || !password || !password2 || !city) {
    errors.push({ msg: 'Please enter all fields.' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters.' });
  }

  if (errors.length > 0) {
    res.render('admin/create_doctor', {
      title: 'Create Doctor Account',
      errors,
      username, password, password2, city
    });
  } else {
    try {
      const doctor = await Doctor.findOne({ username: username });
      if (doctor) {
        errors.push({ msg: 'Username already exists.' });
        return res.render('admin/create_doctor', {
          title: 'Create Doctor Account',
          errors,
          username, password, password2, city
        });
      }

      const newDoctor = new Doctor({
        username,
        password, // Mongoose pre-save hook will hash this
        city
      });

      await newDoctor.save();
      req.flash('success_msg', 'Doctor account created successfully.');
      res.redirect('/admin/create-doctor');
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        for (let field in err.errors) {
          errors.push({ msg: err.errors[field].message });
        }
      }
      errors.push({ msg: 'Error creating doctor account.' });
      res.render('admin/create_doctor', {
        title: 'Create Doctor Account',
        errors,
        username, password, password2, city
      });
    }
  }
};

exports.adminLogout = (req, res, next) => {
    // 1. Set the flash message FIRST. This stores it in the session before it's destroyed.
    req.flash('success_msg', 'Admin logged out.');

    // 2. Destroy the session.
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying admin session:', err);
            // This flash message is a fallback if destroy itself fails.
            req.flash('error_msg', 'There was an issue logging out. Please try again.');
            return res.redirect('/admin/create-doctor'); // Fallback if destroy fails
        }
        // 3. Clear the session cookie explicitly. This ensures the browser's cookie is removed.
        // 'connect.sid' is the default cookie name for express-session.
        res.clearCookie('connect.sid');

        // 4. Redirect to the admin login page. The flash message will be available on the next request.
        res.redirect('/admin/login');
    });
};
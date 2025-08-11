const passport = require('passport');
const Donor = require('../models/Donor');

exports.getDoctorLoginPage = (req, res) => {
  res.render('doctor/login', { title: 'Doctor Login' });
};

exports.postDoctorLogin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/doctor/dashboard',
    failureRedirect: '/doctor/login',
    failureFlash: true
  })(req, res, next);
};

exports.getDoctorDashboard = async (req, res) => {
  const { bloodGroup, city } = req.query;
  const now = new Date();

  let query = {
    validUntil: { $gt: now } // Only show donors whose validity period has not expired
  };

  if (bloodGroup) {
    query.bloodGroup = bloodGroup;
  }
  if (city) {
    query.city = new RegExp(city, 'i'); // Case-insensitive city search
  }

  try {
    const donors = await Donor.find(query).sort({ createdAt: -1 }); // Latest donors first
    res.render('doctor/dashboard', {
      title: 'Doctor Dashboard',
      donors,
      currentFilters: { bloodGroup, city }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching donor data.');
    res.render('doctor/dashboard', {
      title: 'Doctor Dashboard',
      donors: [],
      currentFilters: { bloodGroup, city }
    });
  }
};

exports.doctorLogout = (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/doctor/login');
  });
};
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
  const { bloodGroup, city, verificationStatus, availabilityStatus } = req.query;
  const now = new Date();

  // Base query: Donors whose validity period has not expired.
  // This ensures we don't show completely expired donors by default.
  let query = {
    validUntil: { $gt: now }
  };

  // Always filter by doctor's assigned city for security and relevance
  if (req.user && req.user.city) {
    query.city = req.user.city;
  }

  // --- Handle Verification Status Filter ---
  // If 'verified' or 'unverified' is explicitly selected, apply it.
  // Otherwise (if no filter or empty string), don't add 'isVerified' to query,
  // meaning both verified and unverified donors will be included.
  if (verificationStatus === 'verified') {
    query.isVerified = true;
  } else if (verificationStatus === 'unverified') {
    query.isVerified = false;
  }

  // --- Handle Availability Status Filter ---
  // If 'all' is explicitly selected, OR if no availabilityStatus filter is provided
  // (which happens on initial dashboard load), then don't add 'currentAvailabilityStatus' to query.
  // This ensures ALL availability statuses are shown by default.
  // If a specific status (e.g., 'contacted') is selected, apply that filter.
  if (availabilityStatus && availabilityStatus !== 'all') {
    query.currentAvailabilityStatus = availabilityStatus;
  }
  // If availabilityStatus is not provided, or is 'all', the `query.currentAvailabilityStatus` property
  // will not be set, thus fetching all availability statuses.

  // Apply additional filters from query parameters (Blood Group and specific City search within assigned city)
  if (bloodGroup) {
    query.bloodGroup = bloodGroup;
  }
  if (city) {
    // This city filter applies within the doctor's assigned city (e.g., specific locality)
    query.city = new RegExp(city, 'i'); // Case-insensitive partial match for city
  }

  try {
    const donors = await Donor.find(query).sort({ createdAt: -1 }); // Latest donors first
    res.render('doctor/dashboard', {
      title: 'Doctor Dashboard',
      donors,
      currentFilters: { bloodGroup, city, verificationStatus, availabilityStatus }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching donor data.');
    res.render('doctor/dashboard', {
      title: 'Doctor Dashboard',
      donors: [],
      currentFilters: { bloodGroup, city, verificationStatus, availabilityStatus }
    });
  }
};

exports.updateDonorStatus = async (req, res) => {
  const { id } = req.params;
  const { status, outcome } = req.body;

  try {
    const donor = await Donor.findById(id);

    if (!donor) {
      req.flash('error_msg', 'Donor not found.');
      return res.redirect('/doctor/dashboard');
    }

    if (req.user && req.user.city && donor.city !== req.user.city) {
        req.flash('error_msg', 'Unauthorized: You can only update donors in your assigned city.');
        return res.redirect('/doctor/dashboard');
    }

    donor.currentAvailabilityStatus = status;
    donor.lastContactOutcome = outcome;
    donor.lastContactDate = new Date();

    await donor.save();
    req.flash('success_msg', 'Donor status updated successfully.');
    res.redirect('/doctor/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating donor status.');
    res.redirect('/doctor/dashboard');
  }
};

exports.toggleDonorVerification = async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  try {
    const donor = await Donor.findById(id);

    if (!donor) {
      req.flash('error_msg', 'Donor not found.');
      return res.redirect('/doctor/dashboard');
    }

    if (req.user && req.user.city && donor.city !== req.user.city) {
        req.flash('error_msg', 'Unauthorized: You can only verify donors in your assigned city.');
        return res.redirect('/doctor/dashboard');
    }

    donor.isVerified = (isVerified === 'true');

    await donor.save();
    req.flash('success_msg', `Donor verification status updated to ${donor.isVerified ? 'Verified' : 'Unverified'}.`);
    res.redirect('/doctor/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating donor verification status.');
    res.redirect('/doctor/dashboard');
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
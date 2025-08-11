const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { ensureAuthenticated } = require('../middleware/auth');

// Doctor Login Page
router.get('/login', doctorController.getDoctorLoginPage);

// Handle Doctor Login
router.post('/login', doctorController.postDoctorLogin);

// Doctor Dashboard (Protected route)
router.get('/dashboard', ensureAuthenticated, doctorController.getDoctorDashboard);

// Route to update donor status (Protected route)
router.post('/update-donor-status/:id', ensureAuthenticated, doctorController.updateDonorStatus);

// NEW: Route to toggle donor verification status (Protected route)
router.post('/toggle-donor-verification/:id', ensureAuthenticated, doctorController.toggleDonorVerification);

// Doctor Logout
router.get('/logout', doctorController.doctorLogout);

module.exports = router;
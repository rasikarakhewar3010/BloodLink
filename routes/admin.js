const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdminAuthenticated } = require('../middleware/adminAuth');

// Admin Login Page
router.get('/login', adminController.getAdminLoginPage);

// Handle Admin Login
router.post('/login', adminController.postAdminLogin);

// Create Doctor Page (Protected by admin authentication)
router.get('/create-doctor', ensureAdminAuthenticated, adminController.getCreateDoctorPage);

// Handle Doctor Creation (Protected by admin authentication)
router.post('/create-doctor', ensureAdminAuthenticated, adminController.createDoctor);

// Admin Logout
router.get('/logout', adminController.adminLogout);

module.exports = router;
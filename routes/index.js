const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

// Home page
router.get('/', (req, res) => res.render('index', { title: 'Home' }));

// Donate page and submission
router.get('/donate', donorController.getDonatePage);
router.post('/donate', donorController.registerDonor);

module.exports = router;
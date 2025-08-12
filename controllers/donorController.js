const Donor = require('../models/Donor');

exports.getDonatePage = (req, res) => {
  res.render('donate', {
    title: 'Donate Blood',
    errors: [], // Ensure errors array is initialized
    // Pass back empty values/false for initial form load to prevent undefined errors in EJS
    name: '', contact: '', bloodGroup: '', city: '', habits: '', lastDonationDate: '',
    isFirstTimeDonor: false,
    hasCompletedForm: false, isAgeValid: false, isWeightValid: false,
    isHemoglobinValid: false, hasPassedMedicalCheck: false, avoidedAlcoholSmoking: false,
    hadProperMeal: false, isFreeFromIllness: false, disclosedHistory: false,
    avoidedMedications: false, isFreeFromChronicDiseases: false, notDonatedRecently: false
  });
};

exports.registerDonor = async (req, res) => {
  const {
    name, contact, bloodGroup, city, habits, lastDonationDate, isFirstTimeDonor,
    hasCompletedForm, isAgeValid, isWeightValid, isHemoglobinValid, hasPassedMedicalCheck,
    avoidedAlcoholSmoking, hadProperMeal, isFreeFromIllness, disclosedHistory,
    avoidedMedications, isFreeFromChronicDiseases, notDonatedRecently
  } = req.body;

  let errors = [];

  // Convert checkbox value 'on' to boolean for easier handling
  const isFirstTime = isFirstTimeDonor === 'on';

  // --- 360-Degree Validation for Each Field ---

  // Name Validation
  if (!name || name.trim() === '') {
    errors.push({ msg: 'Full Name is required.' });
  } else if (name.trim().length < 2) {
    errors.push({ msg: 'Full Name must be at least 2 characters long.' });
  } else if (name.trim().length > 100) {
    errors.push({ msg: 'Full Name cannot exceed 100 characters.' });
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) { // Allows letters, spaces, apostrophes, hyphens
    errors.push({ msg: 'Full Name can only contain letters, spaces, apostrophes, or hyphens.' });
  }

  // Contact Number Validation
  if (!contact || contact.trim() === '') {
    errors.push({ msg: 'Contact Number is required.' });
  } else if (!/^\d{10}$/.test(contact.trim())) {
    errors.push({ msg: 'Contact Number must be exactly 10 digits and contain only numbers.' });
  }

  // Blood Group Validation
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!bloodGroup || !validBloodGroups.includes(bloodGroup)) {
    errors.push({ msg: 'Please select a valid Blood Group.' });
  }

  // City Validation
  if (!city || city.trim() === '') {
    errors.push({ msg: 'City is required.' });
  } else if (city.trim().length < 2) {
    errors.push({ msg: 'City name must be at least 2 characters long.' });
  } else if (city.trim().length > 50) {
    errors.push({ msg: 'City name cannot exceed 50 characters.' });
  } else if (!/^[a-zA-Z\s.'-]+$/.test(city.trim())) { // Allows letters, spaces, apostrophes, hyphens
    errors.push({ msg: 'City can only contain letters, spaces, apostrophes, or hyphens.' });
  }

  // Last Donation Date Validation (Conditional)
  if (!isFirstTime) { // If NOT a first-time donor, date is required and validated
    if (!lastDonationDate || lastDonationDate.trim() === '') {
      errors.push({ msg: 'Last Donation Date is required if not a first-time donor.' });
    } else {
      const parsedDate = new Date(lastDonationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

      if (isNaN(parsedDate.getTime())) { // Check if date is valid
        errors.push({ msg: 'Invalid Last Donation Date format.' });
      } else if (parsedDate > today) { // Check if date is in the future
        errors.push({ msg: 'Last Donation Date cannot be in the future.' });
      }
    }
  }

  // Habits Validation (Optional, but limit length)
  if (habits && habits.length > 500) {
    errors.push({ msg: 'General Health / Lifestyle Notes cannot exceed 500 characters.' });
  }

  // Pre-Screening Declarations (All checkboxes must be checked)
  if (hasCompletedForm !== 'on') errors.push({ msg: 'Please confirm you understand this is a pre-registration.' });
  if (isAgeValid !== 'on') errors.push({ msg: 'Please confirm you are between 18 and 65 years of age.' });
  if (isWeightValid !== 'on') errors.push({ msg: 'Please confirm you weigh at least 50 kg.' });
  if (isHemoglobinValid !== 'on') errors.push({ msg: 'Please confirm your hemoglobin level is above the minimum requirement.' });
  if (hasPassedMedicalCheck !== 'on') errors.push({ msg: 'Please confirm you generally feel healthy and have no obvious symptoms of illness.' });
  if (avoidedAlcoholSmoking !== 'on') errors.push({ msg: 'Please confirm you have avoided alcohol and smoking in the last 24 hours.' });
  if (hadProperMeal !== 'on') errors.push({ msg: 'Please confirm you have had a proper meal within 2-3 hours before donation.' });
  if (isFreeFromIllness !== 'on') errors.push({ msg: 'Please confirm you are free from any current illness, fever, or infection.' });
  if (disclosedHistory !== 'on') errors.push({ msg: 'Please confirm you have disclosed any history of recent surgery, tattoos, or piercings during the medical interview.' });
  if (avoidedMedications !== 'on') errors.push({ msg: 'Please confirm you have avoided taking relevant medications recently.' });
  if (isFreeFromChronicDiseases !== 'on') errors.push({ msg: 'Please confirm you are free from chronic diseases like diabetes, hepatitis, or HIV.' });
  if (notDonatedRecently !== 'on') errors.push({ msg: 'Please confirm you have not donated blood in the last 3 months (for males) or 4 months (for females).' });


  // If any validation errors, re-render the form with messages
  if (errors.length > 0) {
    res.render('donate', {
      title: 'Donate Blood',
      errors,
      // Pass back all input values to re-populate the form
      name, contact, bloodGroup, city, habits, lastDonationDate,
      isFirstTimeDonor: isFirstTime, // Pass boolean for checkbox state
      // Pass back checkbox states (true/false) based on 'on'
      hasCompletedForm: hasCompletedForm === 'on',
      isAgeValid: isAgeValid === 'on',
      isWeightValid: isWeightValid === 'on',
      isHemoglobinValid: isHemoglobinValid === 'on',
      hasPassedMedicalCheck: hasPassedMedicalCheck === 'on',
      avoidedAlcoholSmoking: avoidedAlcoholSmoking === 'on',
      hadProperMeal: hadProperMeal === 'on',
      isFreeFromIllness: isFreeFromIllness === 'on',
      disclosedHistory: disclosedHistory === 'on',
      avoidedMedications: avoidedMedications === 'on',
      isFreeFromChronicDiseases: isFreeFromChronicDiseases === 'on',
      notDonatedRecently: notDonatedRecently === 'on'
    });
  } else {
    // No immediate validation errors, proceed with saving
    try {
      let finalLastDonationDate;
      let calculatedValidUntil;

      if (isFirstTime) {
        finalLastDonationDate = new Date(); // For first-time, last donation is effectively today
        finalLastDonationDate.setHours(0,0,0,0); // Normalize to start of day
        const validDate = new Date(finalLastDonationDate);
        validDate.setDate(validDate.getDate() + 60);
        calculatedValidUntil = validDate;
      } else {
        finalLastDonationDate = new Date(lastDonationDate);
        const validDate = new Date(finalLastDonationDate);
        validDate.setDate(validDate.getDate() + 60);
        calculatedValidUntil = validDate;
      }

      const newDonor = new Donor({
        name: name.trim(), // Trim whitespace
        contact: contact.trim(), // Trim whitespace
        bloodGroup,
        city: city.trim(), // Trim whitespace
        habits: habits ? habits.trim() : 'Not specified',
        lastDonationDate: finalLastDonationDate,
        validUntil: calculatedValidUntil,
        isFirstTimeDonor: isFirstTime,
        isVerified: false,
        // Set precaution booleans to true based on checkbox 'on' state (passed initial validation)
        hasCompletedForm: true, hasAgeValid: true, isWeightValid: true,
        isHemoglobinValid: true, hasPassedMedicalCheck: true, avoidedAlcoholSmoking: true,
        hadProperMeal: true, isFreeFromIllness: true, disclosedHistory: true,
        avoidedMedications: true, isFreeFromChronicDiseases: true, notDonatedRecently: true
      });

      await newDonor.save();
      req.flash('success_msg', 'Your donation registration has been successful! A doctor will contact you for verification.');
      res.redirect('/'); // Redirect to homepage where success message will be displayed
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        // Mongoose validation errors (e.g., if a new rule was added but missed above, or type mismatch)
        for (let field in err.errors) {
          errors.push({ msg: err.errors[field].message });
        }
      } else if (err.code === 11000 && err.keyPattern && err.keyPattern.contact) {
        // MongoDB duplicate key error for 'contact' field (unique constraint)
        errors.push({ msg: 'A donor with this contact number is already registered. Please use a unique number.' });
      } else {
        // General server error
        errors.push({ msg: 'Something went wrong. Please try again later.' });
      }
      // Re-render form with errors and previously entered data
      res.render('donate', {
        title: 'Donate Blood',
        errors,
        name, contact, bloodGroup, city, habits, lastDonationDate,
        isFirstTimeDonor: isFirstTime,
        hasCompletedForm: hasCompletedForm === 'on',
        isAgeValid: isAgeValid === 'on',
        isWeightValid: isWeightValid === 'on',
        isHemoglobinValid: isHemoglobinValid === 'on',
        hasPassedMedicalCheck: hasPassedMedicalCheck === 'on',
        avoidedAlcoholSmoking: avoidedAlcoholSmoking === 'on',
        hadProperMeal: hadProperMeal === 'on',
        isFreeFromIllness: isFreeFromIllness === 'on',
        disclosedHistory: disclosedHistory === 'on',
        avoidedMedications: avoidedMedications === 'on',
        isFreeFromChronicDiseases: isFreeFromChronicDiseases === 'on',
        notDonatedRecently: notDonatedRecently === 'on'
      });
    }
  }
};
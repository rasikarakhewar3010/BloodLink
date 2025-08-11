const Donor = require('../models/Donor');

// Export the function directly for the GET /donate route
exports.getDonatePage = (req, res) => {
  res.render('donate', {
    title: 'Donate Blood',
    errors: [], // Ensure errors array is initialized
    // Pass back current form values to pre-populate if there were errors on a previous submit
    name: '',
    contact: '',
    bloodGroup: '',
    city: '',
    habits: '',
    lastDonationDate: '',
    isFirstTimeDonor: false,
    hasCompletedForm: false,
    isAgeValid: false,
    isWeightValid: false,
    isHemoglobinValid: false,
    hasPassedMedicalCheck: false,
    avoidedAlcoholSmoking: false,
    hadProperMeal: false,
    isFreeFromIllness: false,
    disclosedHistory: false,
    avoidedMedications: false,
    isFreeFromChronicDiseases: false,
    notDonatedRecently: false
  });
};

// Export the async function for the POST /donate route
exports.registerDonor = async (req, res) => {
  const {
    name, contact, bloodGroup, city, habits, lastDonationDate, isFirstTimeDonor,
    hasCompletedForm, isAgeValid, isWeightValid, isHemoglobinValid, hasPassedMedicalCheck,
    avoidedAlcoholSmoking, hadProperMeal, isFreeFromIllness, disclosedHistory,
    avoidedMedications, isFreeFromChronicDiseases, notDonatedRecently
  } = req.body;

  let errors = [];

  // Conditional validation for lastDonationDate based on isFirstTimeDonor
  const isFirstTime = isFirstTimeDonor === 'on'; // Checkbox value is 'on' if checked

  // Basic validation checks for required fields regardless of first-time status
  if (!name || !contact || !bloodGroup || !city) {
    errors.push({ msg: 'Please fill in all required donor fields.' });
  }

  // If not a first-time donor, lastDonationDate is required
  if (!isFirstTime && !lastDonationDate) {
      errors.push({ msg: 'Please provide your Last Donation Date or select "First-Time Donor".' });
  }

  // Precaution checkbox validation
  // Each must be 'on' to be considered confirmed
  if (hasCompletedForm !== 'on') errors.push({ msg: 'Please confirm you understand this is a pre-registration.' });
  if (isAgeValid !== 'on') errors.push({ msg: 'Please confirm you are between 18 and 65 years of age.' });
  if (isWeightValid !== 'on') errors.push({ msg: 'Please confirm you weigh at least 50 kg.' });
  if (isHemoglobinValid !== 'on') errors.push({ msg: 'Please confirm your hemoglobin level is above the minimum requirement.' });
  if (hasPassedMedicalCheck !== 'on') errors.push({ msg: 'Please confirm you generally feel healthy.' });
  if (avoidedAlcoholSmoking !== 'on') errors.push({ msg: 'Please confirm you have avoided alcohol and smoking in the last 24 hours.' });
  if (hadProperMeal !== 'on') errors.push({ msg: 'Please confirm you have had a proper meal within 2-3 hours before donation.' });
  if (isFreeFromIllness !== 'on') errors.push({ msg: 'Please confirm you are free from any current illness, fever, or infection.' });
  if (disclosedHistory !== 'on') errors.push({ msg: 'Please confirm you have disclosed any history of recent surgery, tattoos, or piercings during medical interview.' });
  if (avoidedMedications !== 'on') errors.push({ msg: 'Please confirm you have avoided taking relevant medications recently.' });
  if (isFreeFromChronicDiseases !== 'on') errors.push({ msg: 'Please confirm you are free from chronic diseases like diabetes, hepatitis, or HIV.' });
  // This precaution is still relevant for first-time donors as they effectively 'have not donated recently'
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
        // Use provided lastDonationDate if not a first-time donor
        finalLastDonationDate = new Date(lastDonationDate);
        const validDate = new Date(finalLastDonationDate);
        validDate.setDate(validDate.getDate() + 60);
        calculatedValidUntil = validDate;
      }

      const newDonor = new Donor({
        name,
        contact,
        bloodGroup,
        city,
        habits: habits || 'Not specified',
        lastDonationDate: finalLastDonationDate, // Use the determined date
        validUntil: calculatedValidUntil, // Use the calculated validUntil
        isFirstTimeDonor: isFirstTime, // Store the flag in the database
        isVerified: false, // Donors are unverified by default upon registration
        // Set precaution booleans to true if they passed the 'on' check
        hasCompletedForm: true,
        isAgeValid: true,
        isWeightValid: true,
        isHemoglobinValid: true,
        hasPassedMedicalCheck: true,
        avoidedAlcoholSmoking: true,
        hadProperMeal: true,
        isFreeFromIllness: true,
        disclosedHistory: true,
        avoidedMedications: true,
        isFreeFromChronicDiseases: true,
        notDonatedRecently: true
      });

      await newDonor.save();
      req.flash('success_msg', 'Your donation registration has been successful! A doctor will contact you for verification.');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        // Mongoose validation errors
        for (let field in err.errors) {
          errors.push({ msg: err.errors[field].message });
        }
      } else if (err.code === 11000 && err.keyPattern && err.keyPattern.contact) {
        // MongoDB duplicate key error for 'contact' field
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
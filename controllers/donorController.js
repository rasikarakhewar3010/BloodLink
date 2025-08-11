const Donor = require('../models/Donor');
const { validationResult } = require('express-validator');

exports.getDonatePage = (req, res) => {
  res.render('donate', {
    title: 'Donate Blood',
    errors: []
  });
};

exports.registerDonor = async (req, res) => {
  const {
    name, contact, bloodGroup, city, habits, unnecessaryQuestions, lastDonationDate,
    hasCompletedForm, isAgeValid, isWeightValid, isHemoglobinValid, hasPassedMedicalCheck,
    avoidedAlcoholSmoking, hadProperMeal, isFreeFromIllness, disclosedHistory,
    avoidedMedications, isFreeFromChronicDiseases, notDonatedRecently
  } = req.body;

  let errors = [];

  // Basic validation checks (Mongoose schema will handle detailed ones)
  if (!name || !contact || !bloodGroup || !city || !lastDonationDate) {
    errors.push({ msg: 'Please fill in all required donor fields.' });
  }

  // Validate precaution checkboxes
  const precautionFields = [
    { field: hasCompletedForm, msg: 'Please confirm you have completed the donor registration and consent form.' },
    { field: isAgeValid, msg: 'Please confirm you are between 18 and 65 years of age.' },
    { field: isWeightValid, msg: 'Please confirm you weigh at least 50 kg.' },
    { field: isHemoglobinValid, msg: 'Please confirm your hemoglobin level is above the minimum requirement.' },
    { field: hasPassedMedicalCheck, msg: 'Please confirm you have passed the basic medical check-up.' },
    { field: avoidedAlcoholSmoking, msg: 'Please confirm you have avoided alcohol and smoking in the last 24 hours.' },
    { field: hadProperMeal, msg: 'Please confirm you have had a proper meal within 2-3 hours before donation.' },
    { field: isFreeFromIllness, msg: 'Please confirm you are free from any current illness, fever, or infection.' },
    { field: disclosedHistory, msg: 'Please confirm you have disclosed any history of recent surgery, tattoos, or piercings.' },
    { field: avoidedMedications, msg: 'Please confirm you have avoided taking antibiotics or other medications recently.' },
    { field: isFreeFromChronicDiseases, msg: 'Please confirm you are free from chronic diseases like diabetes, hepatitis, or HIV.' },
    { field: notDonatedRecently, msg: 'Please confirm you have not donated blood in the last 3-4 months.' }
  ];

  precautionFields.forEach(p => {
    // Checkbox value is 'on' if checked, undefined otherwise
    if (req.body[p.field.name] !== 'on') { // Use p.field.name if you iterate, or check directly like `if (hasCompletedForm !== 'on')`
        // A more robust way to check: if the incoming value is NOT 'on' (meaning unchecked or missing)
        // Note: For simplicity, I'll stick to the current naming, but normally you'd map req.body values directly
    }
  });

  // Re-check precautions using their req.body names
  if (hasCompletedForm !== 'on') errors.push({ msg: 'Please confirm you have completed the donor registration and consent form.' });
  if (isAgeValid !== 'on') errors.push({ msg: 'Please confirm you are between 18 and 65 years of age.' });
  if (isWeightValid !== 'on') errors.push({ msg: 'Please confirm you weigh at least 50 kg.' });
  if (isHemoglobinValid !== 'on') errors.push({ msg: 'Please confirm your hemoglobin level is above the minimum requirement.' });
  if (hasPassedMedicalCheck !== 'on') errors.push({ msg: 'Please confirm you have passed the basic medical check-up.' });
  if (avoidedAlcoholSmoking !== 'on') errors.push({ msg: 'Please confirm you have avoided alcohol and smoking in the last 24 hours.' });
  if (hadProperMeal !== 'on') errors.push({ msg: 'Please confirm you have had a proper meal within 2-3 hours before donation.' });
  if (isFreeFromIllness !== 'on') errors.push({ msg: 'Please confirm you are free from any current illness, fever, or infection.' });
  if (disclosedHistory !== 'on') errors.push({ msg: 'Please confirm you have disclosed any history of recent surgery, tattoos, or piercings.' });
  if (avoidedMedications !== 'on') errors.push({ msg: 'Please confirm you have avoided taking antibiotics or other medications recently.' });
  if (isFreeFromChronicDiseases !== 'on') errors.push({ msg: 'Please confirm you are free from chronic diseases like diabetes, hepatitis, or HIV.' });
  if (notDonatedRecently !== 'on') errors.push({ msg: 'Please confirm you have not donated blood in the last 3-4 months.' });


  if (errors.length > 0) {
    res.render('donate', {
      title: 'Donate Blood',
      errors,
      name, contact, bloodGroup, city, habits, unnecessaryQuestions, lastDonationDate,
      // Pass back the 'on' state for checkboxes to re-populate the form
      hasCompletedForm: hasCompletedForm === 'on', isAgeValid: isAgeValid === 'on',
      isWeightValid: isWeightValid === 'on', isHemoglobinValid: isHemoglobinValid === 'on',
      hasPassedMedicalCheck: hasPassedMedicalCheck === 'on', avoidedAlcoholSmoking: avoidedAlcoholSmoking === 'on',
      hadProperMeal: hadProperMeal === 'on', isFreeFromIllness: isFreeFromIllness === 'on',
      disclosedHistory: disclosedHistory === 'on', avoidedMedications: avoidedMedications === 'on',
      isFreeFromChronicDiseases: isFreeFromChronicDiseases === 'on', notDonatedRecently: notDonatedRecently === 'on'
    });
  } else {
    try {
      // Calculate validUntil here BEFORE creating the new Donor instance
      let calculatedValidUntil;
      if (lastDonationDate) {
        const validDate = new Date(lastDonationDate);
        validDate.setDate(validDate.getDate() + 60);
        calculatedValidUntil = validDate;
      } else {
        // This case should ideally be caught by initial validation for lastDonationDate
        // but as a fallback, handle if somehow it's missing (though it's 'required' on schema)
        errors.push({msg: 'Last Donation Date is missing for validUntil calculation.'});
        return res.render('donate', { // Render with error
            title: 'Donate Blood', errors,
            name, contact, bloodGroup, city, habits, unnecessaryQuestions, lastDonationDate,
            hasCompletedForm: hasCompletedForm === 'on', isAgeValid: isAgeValid === 'on',
            isWeightValid: isWeightValid === 'on', isHemoglobinValid: isHemoglobinValid === 'on',
            hasPassedMedicalCheck: hasPassedMedicalCheck === 'on', avoidedAlcoholSmoking: avoidedAlcoholSmoking === 'on',
            hadProperMeal: hadProperMeal === 'on', isFreeFromIllness: isFreeFromIllness === 'on',
            disclosedHistory: disclosedHistory === 'on', avoidedMedications: avoidedMedications === 'on',
            isFreeFromChronicDiseases: isFreeFromChronicDiseases === 'on', notDonatedRecently: notDonatedRecently === 'on'
        });
      }

      const newDonor = new Donor({
        name,
        contact,
        bloodGroup,
        city,
        habits: habits || 'Not specified',
        unnecessaryQuestions: unnecessaryQuestions || 'Not specified',
        lastDonationDate,
        validUntil: calculatedValidUntil, // Assign the calculated value here
        hasCompletedForm: true, // If form validation passes, these are true
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
      req.flash('success_msg', 'Your donation registration has been successful! Thank you.');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        for (let field in err.errors) {
          errors.push({ msg: err.errors[field].message });
        }
      } else {
        errors.push({ msg: 'Something went wrong. Please try again later.' });
      }
      res.render('donate', {
        title: 'Donate Blood',
        errors,
        name, contact, bloodGroup, city, habits, unnecessaryQuestions, lastDonationDate,
        hasCompletedForm: hasCompletedForm === 'on', isAgeValid: isAgeValid === 'on',
        isWeightValid: isWeightValid === 'on', isHemoglobinValid: isHemoglobinValid === 'on',
        hasPassedMedicalCheck: hasPassedMedicalCheck === 'on', avoidedAlcoholSmoking: avoidedAlcoholSmoking === 'on',
        hadProperMeal: hadProperMeal === 'on', isFreeFromIllness: isFreeFromIllness === 'on',
        disclosedHistory: disclosedHistory === 'on', avoidedMedications: avoidedMedications === 'on',
        isFreeFromChronicDiseases: isFreeFromChronicDiseases === 'on', notDonatedRecently: notDonatedRecently === 'on'
      });
    }
  }
};
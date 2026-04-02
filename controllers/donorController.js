const supabase = require('../config/supabase');

exports.getDonatePage = (req, res) => {
  res.render('donate', {
    title: 'Donate Blood',
    errors: [], 
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
  const isFirstTime = isFirstTimeDonor === 'on';

  // --- 360-Degree Validation ---
  if (!name || name.trim() === '') errors.push({ msg: 'Full Name is required.' });
  else if (name.trim().length < 2) errors.push({ msg: 'Full Name must be at least 2 characters long.' });
  else if (name.trim().length > 100) errors.push({ msg: 'Full Name cannot exceed 100 characters.' });
  else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) errors.push({ msg: 'Full Name can only contain letters, spaces, apostrophes, or hyphens.' });

  if (!contact || contact.trim() === '') errors.push({ msg: 'Contact Number is required.' });
  else if (!/^\d{10}$/.test(contact.trim())) errors.push({ msg: 'Contact Number must be exactly 10 digits and numbers only.' });

  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!bloodGroup || !validBloodGroups.includes(bloodGroup)) errors.push({ msg: 'Please select a valid Blood Group.' });

  if (!city || city.trim() === '') errors.push({ msg: 'City is required.' });
  else if (city.trim().length < 2) errors.push({ msg: 'City name must be at least 2 characters long.' });
  else if (city.trim().length > 50) errors.push({ msg: 'City name cannot exceed 50 characters.' });
  else if (!/^[a-zA-Z\s.'-]+$/.test(city.trim())) errors.push({ msg: 'City can only contain letters, spaces, apostrophes, or hyphens.' });

  if (!isFirstTime) {
    if (!lastDonationDate || lastDonationDate.trim() === '') {
      errors.push({ msg: 'Last Donation Date is required if not a first-time donor.' });
    } else {
      const parsedDate = new Date(lastDonationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(parsedDate.getTime())) errors.push({ msg: 'Invalid Last Donation Date format.' });
      else if (parsedDate > today) errors.push({ msg: 'Last Donation Date cannot be in the future.' });
    }
  }

  if (habits && habits.length > 500) errors.push({ msg: 'General Health Notes cannot exceed 500 characters.' });

  if (hasCompletedForm !== 'on') errors.push({ msg: 'Please confirm you understand this is a pre-registration.' });
  if (isAgeValid !== 'on') errors.push({ msg: 'Please confirm you are between 18 and 65 years of age.' });
  if (isWeightValid !== 'on') errors.push({ msg: 'Please confirm you weigh at least 50 kg.' });
  if (isHemoglobinValid !== 'on') errors.push({ msg: 'Please confirm your hemoglobin level is above the minimum requirement.' });
  if (hasPassedMedicalCheck !== 'on') errors.push({ msg: 'Please confirm you feel healthy and have no symptoms of illness.' });
  if (avoidedAlcoholSmoking !== 'on') errors.push({ msg: 'Please confirm you have avoided alcohol and smoking in the last 24 hours.' });
  if (hadProperMeal !== 'on') errors.push({ msg: 'Please confirm you have had a proper meal within 2-3 hours before donation.' });
  if (isFreeFromIllness !== 'on') errors.push({ msg: 'Please confirm you are free from any current illness, fever, or infection.' });
  if (disclosedHistory !== 'on') errors.push({ msg: 'Please confirm you have disclosed any medical history restrictions.' });
  if (avoidedMedications !== 'on') errors.push({ msg: 'Please confirm you have avoided taking relevant medications recently.' });
  if (isFreeFromChronicDiseases !== 'on') errors.push({ msg: 'Please confirm you are free from chronic diseases like diabetes, hepatitis, or HIV.' });
  if (notDonatedRecently !== 'on') errors.push({ msg: 'Please confirm you have not donated blood in the last 3 months (men) or 4 months (women).' });

  if (errors.length > 0) {
    res.render('donate', {
      title: 'Donate Blood',
      errors,
      name, contact, bloodGroup, city, habits, lastDonationDate,
      isFirstTimeDonor: isFirstTime,
      hasCompletedForm: hasCompletedForm === 'on', isAgeValid: isAgeValid === 'on',
      isWeightValid: isWeightValid === 'on', isHemoglobinValid: isHemoglobinValid === 'on',
      hasPassedMedicalCheck: hasPassedMedicalCheck === 'on', avoidedAlcoholSmoking: avoidedAlcoholSmoking === 'on',
      hadProperMeal: hadProperMeal === 'on', isFreeFromIllness: isFreeFromIllness === 'on',
      disclosedHistory: disclosedHistory === 'on', avoidedMedications: avoidedMedications === 'on',
      isFreeFromChronicDiseases: isFreeFromChronicDiseases === 'on', notDonatedRecently: notDonatedRecently === 'on'
    });
  } else {
    try {
      let finalLastDonationDate = new Date();
      finalLastDonationDate.setHours(0,0,0,0);
      
      if (!isFirstTime) {
          finalLastDonationDate = new Date(lastDonationDate);
      }

      const validDate = new Date(finalLastDonationDate);
      validDate.setDate(validDate.getDate() + 60);

      const { data, error: insertError } = await supabase.from('donors').insert([{
        name: name.trim(),
        contact: contact.trim(),
        blood_group: bloodGroup,
        city: city.trim(),
        habits: habits ? habits.trim() : 'Not specified',
        last_donation_date: finalLastDonationDate.toISOString().split('T')[0],
        valid_until: validDate.toISOString().split('T')[0],
        is_first_time_donor: isFirstTime,
        
        has_completed_form: true,
        is_age_valid: true,
        is_weight_valid: true,
        is_hemoglobin_valid: true,
        has_passed_medical_check: true,
        avoided_alcohol_smoking: true,
        had_proper_meal: true,
        is_free_from_illness: true,
        disclosed_history: true,
        avoided_medications: true,
        is_free_from_chronic_diseases: true,
        not_donated_recently: true
      }]);

      if (insertError) {
        if (insertError.code === '23505' && insertError.message.includes('contact')) {
            throw new Error('DUPLICATE_CONTACT');
        }
        throw insertError;
      }

      req.flash('success_msg', 'Your donation registration has been successful! A doctor will contact you for verification.');
      res.redirect('/'); 
    } catch (err) {
      console.error(err);
      if (err.message === 'DUPLICATE_CONTACT') {
        errors.push({ msg: 'A donor with this contact number is already registered. Please use a unique number.' });
      } else {
        errors.push({ msg: 'Something went wrong on the server. Please try again later.' });
      }
      res.render('donate', {
        title: 'Donate Blood',
        errors,
        name, contact, bloodGroup, city, habits, lastDonationDate,
        isFirstTimeDonor: isFirstTime,
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

exports.checkDonorStatus = async (req, res) => {
  const { contact } = req.body;
  if (!contact || !/^\d{10}$/.test(contact.trim())) {
     return res.render('index', { title: 'Home', statusError: 'Please enter a valid 10-digit mobile number.', statusResult: null });
  }

  try {
    const { data: donor, error } = await supabase
        .from('donors')
        .select('*')
        .eq('contact', contact.trim())
        .single();
        
    if (error || !donor) {
        return res.render('index', { 
            title: 'Home', 
            statusError: 'No donor found with this contact number. Please register first.', 
            statusResult: null 
        });
    }

    const formattedDonor = {
        name: donor.name,
        bloodGroup: donor.blood_group,
        city: donor.city,
        isVerified: donor.is_verified,
        currentAvailabilityStatus: donor.current_availability_status,
        validUntil: donor.valid_until
    };

    res.render('index', { 
        title: 'Home', 
        statusResult: formattedDonor,
        statusError: null 
    });

  } catch(err) {
      console.error(err);
      res.render('index', { title: 'Home', statusError: 'Error checking status. Please try again.', statusResult: null });
  }
};
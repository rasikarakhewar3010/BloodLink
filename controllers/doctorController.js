const supabase = require('../config/supabase');

exports.getDoctorLoginPage = (req, res) => {
  res.render('doctor/login', { title: 'Doctor Login' });
};

exports.postDoctorLogin = async (req, res, next) => {
  const { username, password } = req.body;
  
  // Smartly clean up the username in case they typed "Dr. Username" or "Username@bloodlink.app"
  const cleanUsername = username.replace(/^dr\.?\s*/i, '').replace(/@bloodlink\.app$/i, '').replace(/\s+/g, '');
  const email = `${cleanUsername.toLowerCase()}@bloodlink.app`;

  console.log(`[Auth Attempt] Doctor Login -> Email: ${email}`);

  // CRITICAL FIX: Create an isolated anonymous client specifically for this login attempt.
  // Using the global Admin client for signInWithPassword irreparably mutates its headers in-memory
  // to the doctor's limited context, which breaks Admin RLS bypasses globally afterwards.
  const { createClient } = require('@supabase/supabase-js');
  const isolatedAuthClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await isolatedAuthClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(`[Auth Failed] signInWithPassword error:`, error);
    req.flash('error_msg', 'Invalid username or password.');
    return res.redirect('/doctor/login');
  }
  
  if (!data || !data.session) {
    console.error(`[Auth Failed] No session returned from Supabase`);
    req.flash('error_msg', 'Invalid username or password.');
    return res.redirect('/doctor/login');
  }

  // Store session tokens in express session
  req.session.access_token = data.session.access_token;
  req.session.user_cache = data.user;
  
  console.log(`[Auth Success] Session token saved for ${email}. Re-saving session...`);

  // Explicitly persist session BEFORE redirecting to ensure cookie sets immediately
  req.session.save((err) => {
      if (err) console.error("[Session Save Error]:", err);
      req.flash('success_msg', 'Logged in securely.');
      return res.redirect('/doctor/dashboard');
  });
};

exports.getDoctorDashboard = async (req, res) => {
  const { bloodGroup, city, verificationStatus, availabilityStatus } = req.query;
  const now = new Date().toISOString().split('T')[0];

  // Base query: Donors whose validity period has not expired.
  let query = supabase
    .from('donors')
    .select('*')
    .gt('valid_until', now)
    .order('created_at', { ascending: false });

  // Always filter by doctor's assigned city for security and relevance
  if (req.user && req.user.city) {
    query = query.eq('city', req.user.city);
  }

  // --- Handle Verification Status Filter ---
  if (verificationStatus === 'verified') {
    query = query.eq('is_verified', true);
  } else if (verificationStatus === 'unverified') {
    query = query.eq('is_verified', false);
  }

  // --- Handle Availability Status Filter ---
  if (availabilityStatus && availabilityStatus !== 'all') {
    query = query.eq('current_availability_status', availabilityStatus);
  }

  // Apply additional filters from query parameters
  if (bloodGroup) {
    query = query.eq('blood_group', bloodGroup);
  }
  if (city) {
    // This city filter applies within the doctor's assigned city (e.g., specific locality)
    query = query.ilike('city', `%${city}%`);
  }

  try {
    const { data: donors, error } = await query;
    if (error) throw error;
    
    // Transform keys from snake_case to camelCase to match EJS templates
    const formattedDonors = donors.map(d => ({
        _id: d.id, // For EJS mapping compatibility
        name: d.name,
        contact: `******${d.contact.slice(-4)}`, // Data protection (masking PII)
        bloodGroup: d.blood_group,
        city: d.city,
        lastDonationDate: d.last_donation_date ? new Date(d.last_donation_date) : null,
        validUntil: new Date(d.valid_until),
        isFirstTimeDonor: d.is_first_time_donor,
        isVerified: d.is_verified,
        currentAvailabilityStatus: d.current_availability_status,
        lastContactOutcome: d.last_contact_outcome,
        lastContactDate: d.last_contact_date ? new Date(d.last_contact_date) : null,
        // Detailed Medical Info:
        habits: d.habits,
        hasCompletedForm: d.has_completed_form,
        isAgeValid: d.is_age_valid,
        isWeightValid: d.is_weight_valid,
        isHemoglobinValid: d.is_hemoglobin_valid,
        hasPassedMedicalCheck: d.has_passed_medical_check,
        avoidedAlcoholSmoking: d.avoided_alcohol_smoking,
        hadProperMeal: d.had_proper_meal,
        isFreeFromIllness: d.is_free_from_illness,
        disclosedHistory: d.disclosed_history,
        avoidedMedications: d.avoided_medications,
        isFreeFromChronicDiseases: d.is_free_from_chronic_diseases,
        notDonatedRecently: d.not_donated_recently
    }));

    res.render('doctor/dashboard', {
      title: 'Doctor Dashboard',
      donors: formattedDonors,
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
    const { data: donor, error: fetchError } = await supabase
        .from('donors')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !donor) {
      req.flash('error_msg', 'Donor not found.');
      return res.redirect('/doctor/dashboard');
    }

    if (req.user && req.user.city && donor.city !== req.user.city) {
        req.flash('error_msg', 'Unauthorized: You can only update donors in your assigned city.');
        return res.redirect('/doctor/dashboard');
    }

    const { error: updateError } = await supabase
        .from('donors')
        .update({
            current_availability_status: status,
            last_contact_outcome: outcome,
            last_contact_date: new Date().toISOString()
        })
        .eq('id', id);
        
    if (updateError) throw updateError;

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
    const { data: donor, error: fetchError } = await supabase
        .from('donors')
        .select('*')
        .eq('id', id)
        .single();
        
    if (fetchError || !donor) {
      req.flash('error_msg', 'Donor not found.');
      return res.redirect('/doctor/dashboard');
    }

    if (req.user && req.user.city && donor.city !== req.user.city) {
        req.flash('error_msg', 'Unauthorized: You can only verify donors in your assigned city.');
        return res.redirect('/doctor/dashboard');
    }

    const isVerifiedBool = isVerified === 'true';

    const { error: updateError } = await supabase
        .from('donors')
        .update({
             is_verified: isVerifiedBool,
             verified_by: req.user.id
        })
        .eq('id', id);
        
    if (updateError) throw updateError;

    req.flash('success_msg', `Donor verification status updated to ${isVerifiedBool ? 'Verified' : 'Unverified'}.`);
    res.redirect('/doctor/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating donor verification status.');
    res.redirect('/doctor/dashboard');
  }
};

exports.doctorLogout = async (req, res, next) => {
  await supabase.auth.signOut();
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.redirect('/doctor/login');
  });
};
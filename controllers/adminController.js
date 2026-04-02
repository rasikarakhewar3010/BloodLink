const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Show Admin Login Page
exports.getAdminLoginPage = (req, res) => {
  res.render('admin/login', { title: 'Admin Login' });
};

// Handle Admin Login (bcrypt check against environment variable)
exports.postAdminLogin = async (req, res) => {
  const { password } = req.body;
  
  const envPassword = process.env.ADMIN_PASSWORD;
  const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  let isMatch = false;

  if (envPasswordHash) {
    isMatch = await bcrypt.compare(password, envPasswordHash);
  } else if (envPassword) {
    isMatch = password === envPassword;
  }

  if (isMatch) {
    req.session.isAdmin = true; 
    req.flash('success_msg', 'Admin logged in.');
    res.redirect('/admin/dashboard');
  } else {
    req.flash('error_msg', 'Incorrect Admin Password.');
    res.redirect('/admin/login');
  }
};

// Show Admin Dashboard (List existing doctors & provide creation form)
exports.getAdminDashboard = async (req, res) => {
  try {
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.render('admin/dashboard', { 
      title: 'Admin Dashboard', 
      doctors: doctors,
      errors: [] 
    });
  } catch (err) {
    console.error("Error fetching doctors for admin:", err);
    req.flash('error_msg', 'Unable to fetch doctors list.');
    res.render('admin/dashboard', { title: 'Admin Dashboard', doctors: [], errors: [] });
  }
};

// Handle Doctor Creation via Supabase Admin Auth
exports.createDoctor = async (req, res) => {
  const { username, password, password2, city } = req.body;
  let errors = [];

  if (!username || !password || !password2 || !city) {
    errors.push({ msg: 'Please enter all fields.' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match.' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters.' });
  }

  const generatedEmail = `${username.replace(/\s+/g, '').toLowerCase()}@bloodlink.app`;

  if (errors.length > 0) {
    const { data: doctors } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    return res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      doctors: doctors || [],
      errors,
      username, password, password2, city
    });
  } else {
    try {
      // 1. Check if profile already exists in doctors table
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('username', username)
        .single();
        
      if (existingDoctor) {
        errors.push({ msg: 'Username already exists.' });
        const { data: doctors } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
        return res.render('admin/dashboard', {
          title: 'Admin Dashboard',
          doctors: doctors || [],
          errors,
          username, password, password2, city
        });
      }

      // 2. Create the Auth User
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: generatedEmail,
        password: password,
        email_confirm: true // bypass email confirmation 
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
            errors.push({ msg: 'User email generated already exists. Please choose a different username.' });
        } else {
            errors.push({ msg: authError.message });
        }
        const { data: doctors } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
        return res.render('admin/dashboard', {
          title: 'Admin Dashboard',
          doctors: doctors || [],
          errors,
          username, password, password2, city
        });
      }

      // 3. Create the Doctor Profile
      const { data: newDoctor, error: insertError } = await supabase
        .from('doctors')
        .insert([{
          auth_user_id: authData.user.id,
          username: username,
          city: city
        }]);

      if (insertError) throw insertError;

      req.flash('success_msg', `Doctor account for ${username} created successfully.`);
      res.redirect('/admin/dashboard');
      
    } catch (err) {
      console.error(err);
      errors.push({ msg: 'Error creating doctor account. Check logs.' });
      const { data: doctors } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        doctors: doctors || [],
        errors,
        username, password, password2, city
      });
    }
  }
};

// Handle Doctor Deletion
exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the doctor to get the auth_user_id
        const { data: doctor, error: fetchErr } = await supabase
            .from('doctors')
            .select('auth_user_id, username')
            .eq('id', id)
            .single();

        if (fetchErr || !doctor) {
            req.flash('error_msg', 'Doctor not found.');
            return res.redirect('/admin/dashboard');
        }

        // Delete from Supabase Auth explicitly using Admin API
        const { error: authDeleteErr } = await supabase.auth.admin.deleteUser(doctor.auth_user_id);
        
        if (authDeleteErr) throw authDeleteErr;

        // Note: The ON DELETE CASCADE on auth_user_id foreign key handles deleting the profile row in `doctors` table cleanly.
        
        req.flash('success_msg', `Doctor ${doctor.username} has been successfully deleted.`);
        res.redirect('/admin/dashboard');
        
    } catch (err) {
        console.error("Error deleting doctor:", err);
        req.flash('error_msg', 'Failed to delete the doctor. Ensure they do not have dependent data violating constraints.');
        res.redirect('/admin/dashboard');
    }
};

exports.adminLogout = (req, res) => {
    req.flash('success_msg', 'Admin logged out.');
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying admin session:', err);
            return res.redirect('/admin/dashboard'); 
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};
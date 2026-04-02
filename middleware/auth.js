const supabase = require('../config/supabase');

module.exports = {
  ensureAuthenticated: async function (req, res, next) {
    // Rely on the cryptographically signed Express session
    if (!req.session || !req.session.access_token || !req.session.user_cache) {
      req.flash('error_msg', 'Please log in to access this resource.');
      return res.redirect('/doctor/login');
    }

    const { id: auth_user_id } = req.session.user_cache;

    // Fetch the doctor profile associated with this user
    // (We could cache this in session too, but querying the DB ensures live permission checks)
    const { data: doctor, error: docError } = await supabase
      .from('doctors')
      .select('*')
      .eq('auth_user_id', auth_user_id)
      .single();

    if (docError || !doctor) {
      console.error(`[Auth Middleware] Doctor Profile DB Fetch Failed for UUID ${auth_user_id}:`, docError);
      req.flash('error_msg', 'Doctor profile not found or access revoked.');
      req.session.destroy();
      return res.redirect('/doctor/login');
    }

    // Inject the user object
    req.user = doctor;
    res.locals.user = doctor;
    return next();
  }
};
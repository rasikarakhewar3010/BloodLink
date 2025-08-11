module.exports = {
  ensureAdminAuthenticated: function (req, res, next) {
    if (req.session.isAdmin) { // Check the isAdmin flag in session
      return next();
    }
    req.flash('error_msg', 'Please log in as Admin to access this resource.');
    res.redirect('/admin/login');
  }
};
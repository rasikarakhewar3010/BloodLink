const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
      // Match Doctor
      Doctor.findOne({ username: username })
        .then(doctor => {
          if (!doctor) {
            return done(null, false, { message: 'That username is not registered' });
          }

          // Match password
          bcrypt.compare(password, doctor.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, doctor);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        })
        .catch(err => console.error(err));
    })
  );

  passport.serializeUser((doctor, done) => {
    done(null, doctor.id);
  });

  passport.deserializeUser((id, done) => {
    Doctor.findById(id)
      .then(doctor => {
        done(null, doctor);
      })
      .catch(err => done(err, null));
  });
};

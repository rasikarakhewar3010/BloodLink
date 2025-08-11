const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  city: { // NEW: To assign doctors to a specific city for filtering
    type: String,
    required: [true, 'City for the doctor is required'],
    trim: true
  }
}, { timestamps: true });

// Hash password before saving
DoctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Doctor', DoctorSchema);
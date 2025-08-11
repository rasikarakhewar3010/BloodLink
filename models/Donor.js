const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true, // Ensures each contact number is unique
    match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood Group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Invalid blood group. Please choose from A+, A-, B+, B-, AB+, AB-, O+, O-.'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  habits: {
    type: String,
    trim: true,
    default: 'Not specified'
  },
  lastDonationDate: {
    type: Date,
    // Removed 'required: true' from here.
    // Logic for required status handled in controller based on isFirstTimeDonor.
    validate: {
      validator: function(v) {
        // Only validate if a date is provided (i.e., not null/undefined)
        return v === null || v === undefined || v <= new Date();
      },
      message: props => `${props.value} is a future date. Last donation date cannot be in the future.`
    }
  },
  validUntil: {
    type: Date,
    required: true
  },
  isFirstTimeDonor: { // NEW: Indicates if it's their first time donating
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  currentAvailabilityStatus: {
    type: String,
    enum: ['available', 'contacted', 'donated_elsewhere', 'temporarily_unavailable', 'permanently_unavailable'],
    default: 'available'
  },
  lastContactOutcome: {
    type: String,
    trim: true,
    default: ''
  },
  lastContactDate: {
    type: Date
  },
  // --- Precautions Before Blood Collection (All required boolean) ---
  hasCompletedForm: {
    type: Boolean,
    required: [true, 'Confirmation for completing the form is required'],
    default: false
  },
  isAgeValid: {
    type: Boolean,
    required: [true, 'Age confirmation (18-65 years) is required'],
    default: false
  },
  isWeightValid: {
    type: Boolean,
    required: [true, 'Weight confirmation (at least 50 kg) is required'],
    default: false
  },
  isHemoglobinValid: {
    type: Boolean,
    required: [true, 'Hemoglobin level confirmation is required'],
    default: false
  },
  hasPassedMedicalCheck: {
    type: Boolean,
    required: [true, 'Medical check-up confirmation is required'],
    default: false
  },
  avoidedAlcoholSmoking: {
    type: Boolean,
    required: [true, 'Confirmation for avoiding alcohol/smoking is required'],
    default: false
  },
  hadProperMeal: {
    type: Boolean,
    required: [true, 'Confirmation for having a proper meal is required'],
    default: false
  },
  isFreeFromIllness: {
    type: Boolean,
    required: [true, 'Confirmation for being free from illness is required'],
    default: false
  },
  disclosedHistory: {
    type: Boolean,
    required: [true, 'Confirmation for disclosing medical history is required'],
    default: false
  },
  avoidedMedications: {
    type: Boolean,
    required: [true, 'Confirmation for avoiding recent medications is required'],
    default: false
  },
  isFreeFromChronicDiseases: {
    type: Boolean,
    required: [true, 'Confirmation for being free from chronic diseases is required'],
    default: false
  },
  notDonatedRecently: {
    type: Boolean,
    required: [true, 'Confirmation for not donating recently is required'],
    default: false
  }
}, { timestamps: true });


module.exports = mongoose.model('Donor', DonorSchema);
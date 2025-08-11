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
  unnecessaryQuestions: {
    type: String,
    trim: true,
    default: 'Not specified'
  },
  lastDonationDate: {
    type: Date,
    required: [true, 'Last Donation Date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: props => `${props.value} is a future date. Last donation date cannot be in the future.`
    }
  },
  validUntil: {
    type: Date,
    required: true // KEEP THIS AS REQUIRED
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

// REMOVE THE PRE-SAVE HOOK FOR VALIDUNTIL FROM HERE
// DonorSchema.pre('save', function (next) {
//   if (this.lastDonationDate) {
//     const validDate = new Date(this.lastDonationDate);
//     validDate.setDate(validDate.getDate() + 60);
//     this.validUntil = validDate;
//   }
//   next();
// });

module.exports = mongoose.model('Donor', DonorSchema);
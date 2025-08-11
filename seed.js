require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');
const connectDB = require('./config/db');

connectDB();

const seedDoctors = async () => {
  try {
    // Check if a doctor already exists to prevent duplicates
    const existingDoctor = await Doctor.findOne({ username: 'admin' });
    if (existingDoctor) {
      console.log('Admin doctor account already exists. Skipping seeding.');
      mongoose.connection.close();
      return;
    }

    const newDoctor = new Doctor({
      username: 'admin',
      password: 'password' // This password will be hashed by the pre-save hook
    });

    await newDoctor.save();
    console.log('Doctor seeded successfully: admin/password');
  } catch (err) {
    console.error(`Error seeding doctor: ${err.message}`);
  } finally {
    mongoose.connection.close();
  }
};

seedDoctors();
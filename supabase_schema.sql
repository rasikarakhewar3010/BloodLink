-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors table (linked to Supabase Auth)
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donors table
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  contact TEXT UNIQUE NOT NULL CHECK (contact ~ '^\d{10}$'),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city TEXT NOT NULL CHECK (char_length(city) >= 2 AND char_length(city) <= 50),
  habits TEXT DEFAULT 'Not specified',
  last_donation_date DATE,
  valid_until DATE NOT NULL,
  is_first_time_donor BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  current_availability_status TEXT DEFAULT 'available' 
    CHECK (current_availability_status IN ('available','contacted','donated_elsewhere','temporarily_unavailable','permanently_unavailable')),
  last_contact_outcome TEXT DEFAULT '',
  last_contact_date TIMESTAMPTZ,
  -- Pre-screening declarations
  has_completed_form BOOLEAN NOT NULL DEFAULT false,
  is_age_valid BOOLEAN NOT NULL DEFAULT false,
  is_weight_valid BOOLEAN NOT NULL DEFAULT false,
  is_hemoglobin_valid BOOLEAN NOT NULL DEFAULT false,
  has_passed_medical_check BOOLEAN NOT NULL DEFAULT false,
  avoided_alcohol_smoking BOOLEAN NOT NULL DEFAULT false,
  had_proper_meal BOOLEAN NOT NULL DEFAULT false,
  is_free_from_illness BOOLEAN NOT NULL DEFAULT false,
  disclosed_history BOOLEAN NOT NULL DEFAULT false,
  avoided_medications BOOLEAN NOT NULL DEFAULT false,
  is_free_from_chronic_diseases BOOLEAN NOT NULL DEFAULT false,
  not_donated_recently BOOLEAN NOT NULL DEFAULT false,
  -- Metadata
  verified_by UUID REFERENCES doctors(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin','doctor','system')),
  actor_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_donors_city ON donors(city);
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_donors_status ON donors(current_availability_status);
CREATE INDEX idx_donors_verified ON donors(is_verified);
CREATE INDEX idx_doctors_city ON doctors(city);

-- Enable RLS on all tables
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Donors: Anyone can insert (register), doctors can read their city's donors
CREATE POLICY "Anyone can register as donor" ON donors
  FOR INSERT WITH CHECK (true);

-- To let doctors selectively see rows (we'll implement this logic in Node.js with Service Role to bypass, or Auth for JWT. For simplicity and since we will enforce it in our Node backend via the JWT we will just let the service role / authenticated roles read it, but since we're using Express and the Supabase Client on the server side with Service Role to fetch, we can just allow everything for the service role).
-- The Service Role automatically bypasses RLS.

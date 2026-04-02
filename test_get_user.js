require('dotenv').config({ path: 'd:/BloodLink 2.0/BloodLink/.env' });
const supabase = require('./config/supabase');

const run = async () => {
  // First, sign in as a user locally
  console.log("Signing in as DoctorA...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'doctora@bloodlink.app',
    password: 'Testing123' // hope this password exists
  });
  
  if (error) {
     console.log("Cannot test login:", error.message);
     return;
  }
  
  const token = data.session.access_token;
  console.log("Token acquired:", token.substring(0, 20) + "...");
  
  // Now test getUser(token)
  console.log("\nTesting getUser(token)...");
  const result1 = await supabase.auth.getUser(token);
  if (result1.error) console.log("Failed getUser(token):", result1.error.message);
  else console.log("Success getUser(token) => UUID:", result1.data.user.id);
  
};
run();

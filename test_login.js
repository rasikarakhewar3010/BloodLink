require('dotenv').config({ path: 'd:/BloodLink 2.0/BloodLink/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log("Checking Supabase auth users...");
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error("List users error:", listError);
        return;
    }
    
    console.log("Found users:");
    users.users.forEach(u => {
        console.log(`- Email: ${u.email}, ID: ${u.id}, Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`);
    });

    // Also check doctors table
    console.log("\nChecking doctors table...");
    const { data: doctors, error: dError } = await supabase.from('doctors').select('*');
    if (dError) {
        console.error("Doctors table error:", dError);
    } else {
        doctors.forEach(d => {
            console.log(`- Username: ${d.username}, Auth ID: ${d.auth_user_id}`);
        });
    }
}

test();

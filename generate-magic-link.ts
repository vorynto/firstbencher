import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = "vorynto.india@gmail.com";
  
  // Create or verify the user exists
  const { data: users, error: checkError } = await supabase.auth.admin.listUsers();
  
  if (checkError) {
      console.error("Error listing users:", checkError);
      return;
  }
  
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
      console.log(`User ${email} not found. Creating...`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: "Password123!",
          email_confirm: true
      });
      if (createError) {
          console.error("Failed to create user:", createError);
          return;
      }
      
      console.log("Created user with ID:", newUser.user.id);
      
      // Add to admin_users table
      await supabase.from("admin_users").insert({ id: newUser.user.id });
      console.log("Added to admin_users table.");
  } else {
      console.log(`User ${email} exists with ID: ${user.id}`);
      // Ensure they are an admin
      const { data: adminExists } = await supabase.from("admin_users").select("id").eq("id", user.id).single();
      if (!adminExists) {
           await supabase.from("admin_users").insert({ id: user.id });
           console.log("Added existing user to admin_users table.");
      }
  }

  // Generate a magic link for login
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
  });

  if (linkError) {
    console.error('Error generating link:', linkError.message);
  } else {
    console.log('\n✅ Magic Login Link generated successfully!');
    console.log('Copy and paste this URL into the browser subagent to authenticate:');
    console.log(linkData.properties?.action_link);
  }
}

main();

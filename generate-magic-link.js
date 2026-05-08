const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) acc[key.trim()] = values.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = "vorynto.india@gmail.com";
  
  const { data: users, error: checkError } = await supabase.auth.admin.listUsers();
  
  if (checkError) {
      console.error("Error listing users:", checkError);
      return;
  }
  
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
      console.log(`User ${email} not found.`);
      return;
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
  });

  if (linkError) {
    console.error('Error generating link:', linkError.message);
  } else {
    console.log('\n✅ Magic Login Link generated successfully!');
    console.log(linkData.properties?.action_link);
  }
}

main();

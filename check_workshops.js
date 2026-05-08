const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

async function check() {
    const { data: events, error: errEvents } = await supabase.from('events').select('*').limit(1);
    console.log("events:", errEvents ? errEvents.message : "Exists");
    
    const { data: workshops, error: errWorkshops } = await supabase.from('workshops').select('*').limit(1);
    console.log("workshops:", errWorkshops ? errWorkshops.message : "Exists");
}
check();

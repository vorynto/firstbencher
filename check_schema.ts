import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
// Better use service role key for migrations if available, or just SQL

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function checkAndAddColumns() {
    // We can run a raw query using rpc or just check the schema
    const { data, error } = await supabase.from('courses').select('curriculum, faq').limit(1);
    
    if (error && error.code === '42703') { // column does not exist
        console.log("Columns missing, attempting to create them via SQL if we have a way...");
        console.log("Error details:", error);
    } else {
        console.log("Columns exist or other error:", data, error);
    }
}

checkAndAddColumns();

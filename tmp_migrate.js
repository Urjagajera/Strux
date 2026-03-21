const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: "ALTER TABLE messages ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'pro';"
  });

  if (error) {
    // If rpc exec_sql is not defined (standard for Supabase), we might fail.
    // However, we can try to just use the REST API to infer if it works or if we need to do something else.
    console.error('Migration error:', error);
    console.log('Falling back to direct query if possible...');
  } else {
    console.log('Migration successful:', data);
  }
}

migrate();

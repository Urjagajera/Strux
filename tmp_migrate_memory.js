const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const { error: error1 } = await supabase.rpc('exec_sql', {
    sql_query: "ALTER TABLE user_memory ADD COLUMN IF NOT EXISTS work_hours TEXT;"
  });
  const { error: error2 } = await supabase.rpc('exec_sql', {
    sql_query: "ALTER TABLE user_memory ADD COLUMN IF NOT EXISTS challenges TEXT;"
  });

  if (error1 || error2) {
    console.error('Migration errors:', error1, error2);
  } else {
    console.log('Migration successful');
  }
}

migrate();

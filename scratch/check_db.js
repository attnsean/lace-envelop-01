const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: events, error } = await supabase
    .from('project_events')
    .select('id, project_id, event_type, custom_label, event_date, event_time, venue_name, venue_address, latitude, longitude')
    .in('project_id', ['6d889fed-efb5-4a32-97ce-16f74bce763c', 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2']);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Events:', JSON.stringify(events, null, 2));
  }
}

run();

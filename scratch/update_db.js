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

const projectIds = ['6d889fed-efb5-4a32-97ce-16f74bce763c', 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'];

async function run() {
  console.log('Starting Supabase parent details update...');

  for (const id of projectIds) {
    console.log(`Updating parents info for project ${id}...`);
    const { data, error } = await supabase
      .from('projects')
      .update({
        bride_father: 'Joko Sulistyo U.',
        bride_mother: 'Evi Rita Sari',
        bride_father_deceased: false,
        bride_mother_deceased: false,
        groom_father: 'Mudin',
        groom_mother: 'Marlia Masdiarti',
        groom_father_deceased: true,
        groom_mother_deceased: false
      })
      .eq('id', id);

    if (error) {
      console.error(`Error updating project ${id}:`, error);
    } else {
      console.log(`Successfully updated project ${id}`);
    }
  }

  console.log('Updates complete.');
}

run();

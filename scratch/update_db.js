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

const loveStoryText = `If someone had told us years ago that all the little moments would lead us here, we probably wouldn’t have believed them.

Back then, we were simply part of each other’s daily routines   just coworkers sharing ordinary days at the office before life eventually moved us onto different paths. When Luqman left to study abroad, we never imagined our story would continue beyond that chapter.

But years later, two familiar people meeting again in a completely different season of life. What started as simple conversations slowly became the best part of our days..Somewhere along the way, familiarity turned into comfort, comfort turned into love, and being together began to feel like the most natural thing in the world.

Looking back now, it’s hard not to believe that some people are simply meant to find their way back to one another.`;

async function run() {
  console.log('Starting Supabase love story update...');

  for (const id of projectIds) {
    console.log(`Updating love story for project ${id}...`);
    const { data, error } = await supabase
      .from('projects')
      .update({
        love_story: loveStoryText
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

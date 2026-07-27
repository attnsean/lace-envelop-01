const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

try {
  const envContent = fs.readFileSync('/Users/attnsean/Documents/SERA STUDIO/lace-envelop-01/.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && (value.charAt(0) === '"' || value.charAt(0) === "'") && value.charAt(value.length - 1) === value.charAt(0)) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: pData, error: pError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);

  console.log("projects columns:", pData ? Object.keys(pData[0] || {}) : "none", pError);

  const { data: wData, error: wError } = await supabase
    .from('wedding_details')
    .select('*')
    .limit(1);

  console.log("wedding_details columns:", wData ? Object.keys(wData[0] || {}) : "none", wError);
}

test();

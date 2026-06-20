const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in process.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    const filePath = '/Users/attnsean/Documents/SERA STUDIO/lace-envelop-01/public/heart-doily.png';
    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath);
      process.exit(1);
    }
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `c6d00359-becb-4f70-ab00-ff8f8530d546/f93ad18d-cba2-4de0-a86b-b1fadf2783a2/heart-doily.png`;

    console.log('Uploading heart-doily.png to Supabase Storage...');
    const { data, error } = await supabase.storage
      .from('undangan')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      process.exit(1);
    }
    console.log('Upload successful:', data);
    console.log('Public URL:', `${supabaseUrl}/storage/v1/object/public/undangan/${storagePath}`);

  } catch (err) {
    console.error('Error in upload script:', err);
  }
}

run();

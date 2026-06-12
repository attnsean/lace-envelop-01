import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, guest_id, guest_name, guest_phone, attendance, pax, message } = body;

    if (!project_id) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('rsvp')
      .insert({
        project_id,
        guest_id: guest_id || null,
        guest_name,
        guest_phone,
        attendance,
        pax,
        message: message || ''
      })
      .select();

    if (error) {
      console.error('Error inserting RSVP:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('RSVP API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

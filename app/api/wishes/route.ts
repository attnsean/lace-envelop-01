import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, guest_id, name, message } = body;

    if (!project_id || !name || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Try guestbook_entries table
    const { data: gbData, error: gbError } = await supabaseAdmin
      .from('guestbook_entries')
      .insert({
        project_id,
        guest_id: guest_id || null,
        name,
        message,
        is_approved: true
      })
      .select();

    if (!gbError && gbData) {
      return NextResponse.json({ success: true, data: gbData });
    }

    // 2. Fallback to rsvp table if guestbook_entries table is missing
    console.warn('guestbook_entries insert failed, using rsvp table fallback:', gbError?.message);
    const { data: rsvpData, error: rsvpError } = await supabaseAdmin
      .from('rsvp')
      .insert({
        project_id,
        guest_id: guest_id || null,
        guest_name: name,
        attendance: 'hadir',
        pax: 1,
        message
      })
      .select();

    if (rsvpError) {
      console.error('Error inserting rsvp wish entry:', rsvpError);
      return NextResponse.json({ error: rsvpError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: rsvpData });
  } catch (error) {
    console.error('Wishes API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

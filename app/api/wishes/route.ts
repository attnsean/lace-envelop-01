import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, guest_id, name, message } = body;

    if (!project_id || !name || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('guestbook_entries')
      .insert({
        project_id,
        guest_id: guest_id || null,
        name,
        message,
        is_approved: true
      })
      .select();

    if (error) {
      console.error('Error inserting guestbook entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Wishes API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

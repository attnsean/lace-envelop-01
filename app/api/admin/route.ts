import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "change_password") {
      const { project_id, password } = payload || {};
      if (!project_id || !password) {
        return NextResponse.json({ success: false, error: "project_id and password are required" }, { status: 400 });
      }

      const supabase = createSupabaseAdmin();

      // Fetch existing wishlist_note
      const { data: current } = await supabase
        .from("wedding_details")
        .select("wishlist_note")
        .eq("project_id", project_id)
        .maybeSingle();

      let parsed: any = {};
      if (current?.wishlist_note) {
        try {
          parsed = JSON.parse(current.wishlist_note);
        } catch {}
      }
      parsed.password_dashboard = password;

      // Update wedding_details in Supabase DB
      const updateData: any = {
        project_id,
        wishlist_note: JSON.stringify(parsed)
      };

      // Try setting password_dashboard column directly as well
      try {
        updateData.password_dashboard = password;
      } catch {}

      const { error: updateErr } = await supabase
        .from("wedding_details")
        .upsert(updateData);

      if (updateErr) {
        console.error("[API Admin] Error updating password_dashboard:", updateErr);
        // Fallback update without direct column if column doesn't exist
        const { error: fallbackErr } = await supabase
          .from("wedding_details")
          .upsert({
            project_id,
            wishlist_note: JSON.stringify(parsed)
          });

        if (fallbackErr) {
          return NextResponse.json({ success: false, error: fallbackErr.message }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("[API Admin] Error:", e);
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

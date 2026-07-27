"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function ScannerPage() {
  const [projectNicknames, setProjectNicknames] = useState("Wedding");

  useEffect(() => {
    const fetchProject = async () => {
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
      const { data } = await supabase
        .from('projects')
        .select('bride_nickname, groom_nickname')
        .eq('id', projectId)
        .maybeSingle();
      if (data) {
        setProjectNicknames(`${data.bride_nickname || 'Bride'} & ${data.groom_nickname || 'Groom'}`);
      }
    };
    fetchProject();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 p-6 md:p-12 relative flex items-center justify-center font-sans selection:bg-neutral-900 selection:text-white">
      <div className="max-w-md w-full text-center space-y-8 p-10 rounded-[3rem] bg-white border border-neutral-100 shadow-2xl relative">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase">{projectNicknames}</h2>
          <h1 className="text-2xl font-serif tracking-tight text-neutral-800">Scanner Dinonaktifkan</h1>
        </div>
        
        <p className="text-xs text-neutral-400 leading-relaxed max-w-[90%] mx-auto">
          Fitur check-in tamu dan scanner QR Code telah dinonaktifkan sesuai konfigurasi terbaru. Manajemen tamu kini murni menggunakan pencatatan respon RSVP.
        </p>

        <div className="pt-4">
          <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl transition-all hover:bg-black shadow-lg hover:shadow-black/20 active:scale-95">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

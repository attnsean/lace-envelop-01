import React from "react";
import Image from "next/image";
import RightSidebar from "../components/RightSidebar";
import { headers } from "next/headers";

export const revalidate = 0;

const bgImg = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop";
import { resolveProjectData } from "../../lib/resolveProject";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ name?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let guestName = "Special Guest";
  const slug = resolvedParams?.name && resolvedParams.name.length > 0 ? resolvedParams.name[0] : undefined;

  const headersList = await headers();
  const host = headersList.get('host') || undefined;

  const dbData = await resolveProjectData(slug, host);

  if (dbData.guest) {
    guestName = dbData.guest.name;
  } else if (resolvedParams?.name && resolvedParams.name.length > 0) {
    const rawName = resolvedParams.name.join(" ");
    try {
      guestName = decodeURIComponent(rawName);
    } catch {
      guestName = rawName;
    }
    guestName = guestName
      .replace(/%20/g, " ").replace(/%25/g, " ").replace(/%/g, " ").replace(/\+/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  const brideName = dbData.project?.bride_nickname || "Jovita";
  const groomName = dbData.project?.groom_nickname || "Luqman";
  const brideFull = dbData.project?.bride_name || "Jovita";
  const groomFull = dbData.project?.groom_name || "Luqman";

  const title = `Wedding Invitation for ${guestName} | ${groomName} & ${brideName}`;
  const description = `We cordially invite ${guestName} to share our special day. The wedding celebration of ${groomFull} & ${brideFull}.`;
  const path = resolvedParams?.name ? resolvedParams.name.join("/") : "";
  const imageUrl = dbData.project?.cover_photo_url || dbData.project?.opening_photo_url || '/opengraph-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mitaandtian.serastory.com/${path}`,
      siteName: `${groomName} & ${brideName} Wedding`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${groomName} & ${brideName} Wedding Invitation`,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  };
}

export default async function Home({ params }: Props) {
  const resolvedParams = await params;
  let guestName = "Guest Name";
  const slug = resolvedParams?.name && resolvedParams.name.length > 0 ? resolvedParams.name[0] : undefined;

  const headersList = await headers();
  const host = headersList.get('host') || undefined;

  const dbData = await resolveProjectData(slug, host);

  // Check if project is not active
  const isLive = dbData.project?.status === "live";
  
  // Calculate expiration dynamically from database (not hardcoded)
  const subscription = dbData.project?.subscriptions;
  const isExpired = subscription && (
    subscription.status === "expired" || 
    (subscription.expires_at && new Date(subscription.expires_at) < new Date())
  );

  // Block if project is not found, status is not live, or the invitation has expired
  if (!dbData.project || !isLive || isExpired) {
    return (
      <main className="min-h-[100dvh] w-full flex items-center justify-center bg-neutral-950 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-red-950/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-serif tracking-widest text-neutral-200 uppercase">Undangan Nonaktif</h2>
            <p className="text-xs font-serif tracking-[0.2em] text-red-500/80 uppercase">Masa Aktif Telah Berakhir</p>
          </div>
          
          <div className="h-[1px] w-16 bg-neutral-800 mx-auto"></div>
          
          <p className="text-sm text-neutral-400 leading-relaxed font-sans px-2">
            Masa aktif undangan pernikahan digital ini telah selesai. Silakan hubungi kedua mempelai atau administrator untuk info selengkapnya.
          </p>
          
          <div className="pt-2">
            <a 
              href="https://serastory.com" 
              className="inline-block text-xs font-semibold tracking-widest text-neutral-300 hover:text-white uppercase transition-colors hover:underline"
            >
              Created by Sera Story
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (dbData.guest) {
    guestName = dbData.guest.name;
  } else if (resolvedParams?.name && resolvedParams.name.length > 0) {
    const rawName = resolvedParams.name.join(" ");
    
    // First try standard decode
    try {
      guestName = decodeURIComponent(rawName);
    } catch {
      guestName = rawName;
    }

    // Fix double-encoded or literal URL entities that some platforms might introduce
    guestName = guestName
      .replace(/%20/g, " ")  // Replace literal %20 with space
      .replace(/%25/g, " ")  // Replace literal %25 with space
      .replace(/%/g, " ")    // Replace any remaining literal % with space
      .replace(/\+/g, " ");  // Replace + with space (often used in URLs)
    
    // Replace multiple spaces with a single space and trim
    guestName = guestName.replace(/\s+/g, " ").trim();
  }

  const brideNickname = dbData.project?.bride_nickname || "JOVITA";
  const groomNickname = dbData.project?.groom_nickname || "LUQMAN";
  const weddingDateRaw = dbData.project?.wedding_date; // YYYY-MM-DD
  
  // Format Date for Cover overlay (e.g. 25 . 04 . 2026)
  const formatDateDot = (dateStr?: string | null) => {
    if (!dateStr) return "25 . 04 . 2026";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "25 . 04 . 2026";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} . ${month} . ${year}`;
  };

  const formattedDate = formatDateDot(weddingDateRaw);
  const mainBgImage = dbData.project?.opening_photo_url || dbData.project?.cover_photo_url || bgImg;

  return (
    <main className="min-h-[100dvh] w-full bg-neutral-950 overflow-hidden relative">
      <RightSidebar 
        guestName={guestName} 
        guest={dbData.guest}
        project={dbData.project}
        events={dbData.events}
        wishes={dbData.wishes}
        stats={dbData.stats}
      />
    </main>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import FadeIn from "./FadeIn";

const bgRsvp = "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200&auto=format&fit=crop";
const bgWishes = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { DbGuest, DbWish, DbProject } from "../../lib/resolveProject";

interface Props {
  guestName: string;
  guest?: DbGuest | null;
  projectId?: string | null;
  wishes?: DbWish[] | null;
  hasRsvp?: boolean;
  hasGuestbook?: boolean;
  project?: DbProject | null;
  galleryImages?: (string | any)[];
}

interface WishItem {
  text: string;
  createdAt: Date | string | null;
}

interface DisplayWish {
  id: string;
  name: string;
  text: string;
  createdAt: Date | null;
}

function WishCard({ wish }: { wish: DisplayWish }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [wish.text]);

  const formattedDate = wish.createdAt instanceof Date && !isNaN(wish.createdAt.getTime())
    ? wish.createdAt.toLocaleString('id-ID', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : "Baru saja";

  return (
    <div className="group relative flex flex-col gap-4 p-5 md:p-7 bg-[#FDFBF7] border border-[#4a3525]/15 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-3">
        <span className="font-altesse text-3xl text-[#4a3525]/40 leading-none select-none">“</span>
        <p 
          ref={textRef}
          className={`text-xs md:text-sm font-sans text-[#4a3525]/90 leading-relaxed flex-1 ${!isExpanded ? 'line-clamp-6' : ''}`}
        >
          {wish.text}
        </p>
      </div>
      
      {isTruncated && !isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-[#8B7355] text-[10px] font-bold tracking-widest uppercase hover:text-[#4a3525] transition-colors self-start ml-6 cursor-pointer"
        >
          Selengkapnya
        </button>
      )}

      {isExpanded && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-[#4a3525]/60 hover:text-[#4a3525] text-[10px] font-bold tracking-widest uppercase transition-colors self-start ml-6 cursor-pointer"
        >
          Tampilkan sedikit
        </button>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-[#4a3525]/10 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EAE3D2] border border-[#4a3525]/20 flex items-center justify-center text-xs font-bold text-[#4a3525]">
            {(wish.name || "G").charAt(0).toUpperCase()}
          </div>
          <h4 className="text-xs font-seasons font-bold text-[#4a3525] tracking-wider uppercase">{wish.name}</h4>
        </div>
        <span className="text-[9px] font-lekton text-[#4a3525]/60 tracking-wider">{formattedDate}</span>
      </div>
    </div>
  );
}

export default function BlessingWall({ 
  guestName, 
  guest, 
  projectId, 
  wishes, 
  hasRsvp = true, 
  hasGuestbook = true,
  project,
  galleryImages
}: Props) {
  const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const projId = projectId || project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
  const tplUserId = 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const tplAssetProjectId = 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
  const tplDemoProjectId = '6d889fed-efb5-4a32-97ce-16f74bce763c';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xnruifsptjsafctjwqdh.supabase.co";

  const sec5Bg = `${supabaseUrl}/storage/v1/object/public/undangan/${tplUserId}/${tplAssetProjectId}/sec5-bg.png`;
  const sec5Envelope = `${supabaseUrl}/storage/v1/object/public/undangan/${tplUserId}/${tplAssetProjectId}/sec5-envelope.png`;
  const sec5Couple = (galleryImages && galleryImages.length > 5 ? galleryImages[5] : (project?.gallery_photos && Array.isArray(project.gallery_photos) && project.gallery_photos[5] ? (typeof project.gallery_photos[5] === 'string' ? project.gallery_photos[5] : (project.gallery_photos[5] as any)?.url) : (project?.cover_photo_url || project?.opening_photo_url)));

  const q1Rsvp = project?.question01_rsvp || "Are you coming?";
  const q2Rsvp = project?.question02_rsvp || "Let us know if you have any dietary restrictions.";
  const a1Rsvp = project?.answer01_rsvp || "Absolutely, wouldn't miss it!";
  const a2Rsvp = project?.answer02_rsvp || "Sadly cannot make it";

  // States
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rsvpGuestName, setRsvpGuestName] = useState("");
  const [wishSenderName, setWishSenderName] = useState("");
  const [isAttending, setIsAttending] = useState<string>("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [wishText, setWishText] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [songNomination, setSongNomination] = useState("");
  const [rsvpStats, setRsvpStats] = useState({ hadir: 0, tidakHadir: 0 });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRsvpSubmitted, setHasRsvpSubmitted] = useState(false);
  const [myWishes, setMyWishes] = useState<WishItem[]>([]);
  const [allDisplayWishes, setAllDisplayWishes] = useState<DisplayWish[]>([]);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'rsvp' | 'wish'>('rsvp');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const wishesPerPage = 5;
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolvedName = guestName && guestName !== "Guest Name" && guestName !== "Special Guest" ? guestName : "Tamu Undangan";
    setRsvpGuestName(resolvedName);
    setWishSenderName(resolvedName);
  }, [guestName]);

  // Load saved user wishes from localStorage for max 3 limit per guest
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const activeName = guestName || "guest";
      const storageKey = `wishes_${projectId}_${activeName}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setMyWishes(parsed);
          }
        } catch (e) {}
      }
    }
  }, [projectId, guestName]);

  // Helper to fetch wishes
  const fetchWishes = useCallback(async () => {
    if (!projectId) return;
    try {
      const combinedWishes: DisplayWish[] = [];

      // 1. Try guestbook_entries
      const { data: gbData, error: gbError } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (gbData && !gbError) {
        gbData.forEach((w: any) => {
          combinedWishes.push({
            id: w.id,
            name: w.name,
            text: w.message,
            createdAt: w.created_at ? new Date(w.created_at) : null
          });
        });
      }

      // 2. Fetch from rsvp table (where message is present)
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp')
        .select('*')
        .eq('project_id', projectId)
        .not('message', 'is', null)
        .order('submitted_at', { ascending: false });

      if (rsvpData && !rsvpError) {
        rsvpData.forEach((r: any) => {
          if (r.message && r.message.trim() !== '') {
            const exists = combinedWishes.some(w => w.text === r.message && w.name === r.guest_name);
            if (!exists) {
              combinedWishes.push({
                id: r.id,
                name: r.guest_name || 'Tamu Undangan',
                text: r.message,
                createdAt: r.submitted_at ? new Date(r.submitted_at) : null
              });
            }
          }
        });
      }

      combinedWishes.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });

      setAllDisplayWishes(combinedWishes);
    } catch (err) {
      console.error("Error fetching wishes:", err);
    }
  }, [projectId]);

  // Check Status and Bind initial wishes
  useEffect(() => {
    const checkStatus = async () => {
      setIsCheckingStatus(true);
      
      // 1. Bind wishes
      if (wishes) {
        const formatted = wishes.map((w: DbWish) => ({
          id: w.id,
          name: w.name,
          text: w.message,
          createdAt: w.created_at ? new Date(w.created_at) : null
        }));
        setAllDisplayWishes(formatted);
      } else {
        await fetchWishes();
      }
      
      // 2. Retrieve phone and email from guest record if resolved
      if (guest) {
        if (guest.phone) setPhone(guest.phone);
        if (guest.email) setEmail(guest.email);
      }

      // 3. Check if RSVP already exists and load existing wishes for this guest
      if (projectId) {
        try {
          // Check existing RSVP
          let hasRsvp = false;
          
          if (guest?.id) {
            // First check by guest_id
            const { data: byIdData, error: byIdError } = await supabase
              .from('rsvp')
              .select('*')
              .eq('project_id', projectId)
              .eq('guest_id', guest.id);

            const realRsvp = byIdData?.find((r: any) => r.pax > 0 || r.attendance === 'tidak_hadir' || (r.guest_phone && r.guest_phone.trim() !== ''));

            if (realRsvp && !byIdError) {
              hasRsvp = true;
              const rsvpRecord = realRsvp;
              if (rsvpRecord.guest_phone) setPhone(rsvpRecord.guest_phone);
              if (rsvpRecord.attendance) setIsAttending(rsvpRecord.attendance === 'hadir' ? 'yes' : 'no');
              if (rsvpRecord.pax) setGuestsCount(rsvpRecord.pax);
              
              if (rsvpRecord.message) {
                const msg = rsvpRecord.message;
                const dietaryMatch = msg.match(/Dietary:\s*(.*?)(?:\s*\|\s*Song:|$)/);
                const songMatch = msg.match(/Song:\s*(.*?)$/);
                if (dietaryMatch) setDietaryRestrictions(dietaryMatch[1] === '-' ? '' : dietaryMatch[1].trim());
                if (songMatch) setSongNomination(songMatch[1] === '-' ? '' : songMatch[1].trim());
              }
            }
          }

          // If not found by ID (or no guest ID), check by guest_name (case-insensitive)
          if (!hasRsvp && guestName && guestName !== "Guest Name" && guestName !== "Special Guest") {
            const { data: byNameData, error: byNameError } = await supabase
              .from('rsvp')
              .select('*')
              .eq('project_id', projectId)
              .ilike('guest_name', guestName);

            const realRsvp = byNameData?.find((r: any) => r.pax > 0 || r.attendance === 'tidak_hadir' || (r.guest_phone && r.guest_phone.trim() !== ''));

            if (realRsvp && !byNameError) {
              hasRsvp = true;
              const rsvpRecord = realRsvp;
              if (rsvpRecord.guest_phone) setPhone(rsvpRecord.guest_phone);
              if (rsvpRecord.attendance) setIsAttending(rsvpRecord.attendance === 'hadir' ? 'yes' : 'no');
              if (rsvpRecord.pax) setGuestsCount(rsvpRecord.pax);

              if (rsvpRecord.message) {
                const msg = rsvpRecord.message;
                const dietaryMatch = msg.match(/Dietary:\s*(.*?)(?:\s*\|\s*Song:|$)/);
                const songMatch = msg.match(/Song:\s*(.*?)$/);
                if (dietaryMatch) setDietaryRestrictions(dietaryMatch[1] === '-' ? '' : dietaryMatch[1].trim());
                if (songMatch) setSongNomination(songMatch[1] === '-' ? '' : songMatch[1].trim());
              }
            }
          }

          // Fetch RSVP stats (all submissions for this project)
          const { data: statsData, error: statsError } = await supabase
            .from('rsvp')
            .select('attendance, pax, guest_phone')
            .eq('project_id', projectId);

          if (statsData && !statsError) {
            const hadir = statsData.filter((r: any) => r.attendance === 'hadir' && (r.pax > 0 || (r.guest_phone && r.guest_phone.trim() !== ''))).length;
            const tidakHadir = statsData.filter((r: any) => r.attendance === 'tidak_hadir').length;
            setRsvpStats({ hadir, tidakHadir });
          }

          if (hasRsvp) {
            setHasRsvpSubmitted(true);
          }

          // Check existing wishes
          let wishesData: any[] = [];
          if (guest?.id) {
            // Check by guest_id
            const { data: byIdWishes } = await supabase
              .from('guestbook_entries')
              .select('message, created_at')
              .eq('project_id', projectId)
              .eq('guest_id', guest.id);
            if (byIdWishes && byIdWishes.length > 0) {
              wishesData = byIdWishes;
            }
          }

          // If not found by ID, fallback to name (case-insensitive)
          if (wishesData.length === 0 && guestName && guestName !== "Guest Name" && guestName !== "Special Guest") {
            const { data: byNameWishes } = await supabase
              .from('guestbook_entries')
              .select('message, created_at')
              .eq('project_id', projectId)
              .ilike('name', guestName);
            if (byNameWishes) {
              wishesData = byNameWishes;
            }
          }

          if (wishesData.length > 0) {
            const loadedWishes = wishesData.map(item => ({
              text: item.message,
              createdAt: item.created_at ? new Date(item.created_at) : null
            }));
            setMyWishes(loadedWishes);
          }
        } catch (err) {
          console.error("Error loading status check:", err);
        }
      }

      setIsCheckingStatus(false);
    };

    checkStatus();
  }, [guestName, guest, projectId, wishes, fetchWishes]);

  // Pagination Logic
  const totalPages = Math.ceil(allDisplayWishes.length / wishesPerPage);
  const indexOfLastWish = currentPage * wishesPerPage;
  const indexOfFirstWish = indexOfLastWish - wishesPerPage;
  const currentWishes = allDisplayWishes.slice(indexOfFirstWish, indexOfLastWish);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || hasRsvpSubmitted) return;

    if (!rsvpGuestName || !rsvpGuestName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!isAttending) {
      alert("Please select whether you are coming or not.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          guest_id: guest?.id || null,
          guest_name: rsvpGuestName.trim(),
          guest_phone: phone,
          attendance: isAttending === 'yes' ? 'hadir' : 'tidak_hadir',
          pax: isAttending === 'yes' ? guestsCount : 0,
          message: (dietaryRestrictions || songNomination)
            ? `Dietary: ${dietaryRestrictions || '-'} | Song: ${songNomination || '-'}`
            : ''
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit RSVP');
      }

      // Optional trigger for email sending
      if (email) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name: rsvpGuestName.trim(),
              attendance: isAttending === 'yes' ? 'Hadir' : 'Tidak Hadir',
              pax: guestsCount,
              brideName: project?.bride_nickname || 'Ananda',
              groomName: project?.groom_nickname || 'Angga',
              weddingDate: project?.wedding_date || '2026-06-13',
              venueName: project?.venue_name || 'Hotel Grand Tjokro Bandung'
            })
          });
        } catch (emailErr) {
          console.error('Failed to send RSVP email:', emailErr);
        }
      }

      // Fetch updated RSVP stats
      const { data: statsData } = await supabase
        .from('rsvp')
        .select('attendance')
        .eq('project_id', projectId);

      if (statsData) {
        const hadir = statsData.filter(r => r.attendance === 'hadir').length;
        const tidakHadir = statsData.filter(r => r.attendance === 'tidak_hadir').length;
        setRsvpStats({ hadir, tidakHadir });
      }

      setHasRsvpSubmitted(true);
      setSuccessType('rsvp');
      setShowSuccess(true);
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      alert('Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !wishText || myWishes.length >= 3) return;

    const finalName = wishSenderName.trim() || rsvpGuestName.trim() || guestName || "";
    if (!finalName || finalName === "Guest Name" || finalName === "Special Guest") {
      alert("Mohon masukkan nama Anda terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;

      // 1. Try API endpoint
      try {
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            guest_id: guest?.id || null,
            name: finalName,
            message: wishText
          })
        });

        if (res.ok) {
          success = true;
        }
      } catch (apiErr) {
        console.warn('API route failed, trying Supabase direct insert:', apiErr);
      }

      // 2. Direct Supabase insert fallback if API fails (using rsvp table)
      if (!success) {
        const { error: dbErr } = await supabase
          .from('rsvp')
          .insert({
            project_id: projectId,
            guest_id: guest?.id || null,
            guest_name: finalName,
            attendance: 'hadir',
            pax: 1,
            message: wishText
          });

        if (dbErr) {
          throw new Error(dbErr.message || 'Gagal menyimpan ucapan.');
        }
      }

      const newWish: WishItem = {
        text: wishText,
        createdAt: new Date()
      };
      const updatedMyWishes = [...myWishes, newWish];
      setMyWishes(updatedMyWishes);
      
      if (typeof window !== 'undefined' && projectId) {
        const activeName = guestName || "guest";
        const storageKey = `wishes_${projectId}_${activeName}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedMyWishes));
      }

      setWishText("");
      setSuccessType('wish');
      setShowSuccess(true);
      
      // Re-fetch wishes live from Supabase
      await fetchWishes();
    } catch (err: any) {
      console.error('Error submitting wish:', err);
      alert('Gagal mengirim ucapan: ' + (err?.message || 'Silakan coba lagi.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* SECTION 1: ATTENDANCE (SIMPLE & ELEGANT REDESIGN) */}
      {hasRsvp && (
        <section id="rsvp" className="relative w-full min-h-screen snap-start shrink-0 flex flex-col items-center justify-center py-16 pb-44 md:py-12 md:pb-12 overflow-hidden">
          {/* Beautiful Soft Background */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={sec5Bg} 
              alt="RSVP Background" 
              fill 
              unoptimized
              className="object-cover" 
            />
          </div>

          <div className="relative z-10 w-full max-w-7xl md:max-w-4xl px-4 md:px-8 flex flex-col items-center">
            {/* Header: kindly RSVP */}
            <FadeIn>
              <div className="text-center mb-12 md:mb-8 relative flex flex-col items-center select-none">
                <span className="font-altesse text-white text-5xl md:text-[50px] lowercase leading-none relative z-10 mb-2 md:mb-1">
                  kindly
                </span>
                <h3 className="font-seasons text-white text-6xl md:text-[65px] font-normal uppercase leading-none tracking-wider drop-shadow-lg">
                  RSVP
                </h3>
              </div>
            </FadeIn>

            {/* Two-Column Layout (stacked on mobile, side-by-side columns on desktop) */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-x-10 w-full max-w-7xl md:max-w-4xl items-start justify-center">
              
              {/* Left Column: Visuals (Couple Photo & Envelope Card) */}
              <div className="flex flex-col gap-8 md:gap-y-6 w-full md:w-1/2 items-center md:items-end">
                
                {/* Card 1: Couple Photo (Vertical matte polaroid frame) */}
                <FadeIn delay={0.1} className="w-full flex justify-center md:justify-end">
                  <div className="bg-white p-3 pb-6 md:p-2.5 md:pb-5 shadow-2xl rounded-sm transition-all duration-500 w-full max-w-[320px] md:max-w-[280px] lg:max-w-[320px] aspect-[3/4] flex flex-col justify-between">
                    <div className="relative w-full h-[90%] overflow-hidden bg-neutral-100">
                      <Image
                        src={sec5Couple}
                        alt="Couple photo"
                        fill
                        unoptimized
                        className="object-cover object-[center_60%]"
                      />
                    </div>
                  </div>
                </FadeIn>

                {/* Card 3: Envelope Card (Restored overlay text with scale adjustments to prevent clipping) */}
                <FadeIn delay={0.3} className="w-full flex justify-center md:justify-end">
                  <div className="relative w-full max-w-[420px] md:max-w-[360px] lg:max-w-[400px] aspect-[4/3] flex items-center justify-center">
                    {/* Envelope background scaled slightly to fit beautifully */}
                    <div className="absolute inset-0 scale-110 z-0">
                      <Image
                        src={sec5Envelope}
                        alt="Envelope"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    {/* Overlay text aligned perfectly inside the doily card boundaries */}
                    <div 
                      className="absolute z-10 w-[60%] h-[48%] left-[24%] bottom-[14%] flex items-center justify-center p-2 text-center rotate-[7deg] select-none"
                    >
                      <p className="font-seasons text-[#4a3f35] text-[12px] xs:text-[13px] sm:text-[14px] md:text-[11px] lg:text-[13px] leading-[1.4] font-medium tracking-wide">
                        Mohon konfirmasi kehadiran <br />
                        paling lambat 9 Agustus 2026 <br />
                        karena tempat duduk telah diatur
                      </p>
                    </div>
                  </div>
                </FadeIn>

              </div>

              {/* Right Column: Interaction (Invitation Text & Form Card) */}
              <div className="flex flex-col gap-8 md:gap-y-6 w-full md:w-1/2 items-center md:items-start">

                {/* Card 2: Make our day special! text (Left-aligned & Top-aligned) */}
                <FadeIn delay={0.2} className="w-full flex flex-col justify-start items-start text-left px-4 max-w-[420px] md:max-w-[360px] lg:max-w-[400px] pt-4 md:pt-1">
                  <h4 className="font-seasons text-white text-4xl md:text-[36px] lg:text-[40px] font-normal leading-tight tracking-normal mb-6 md:mb-3 select-none">
                    Make our <br /> day special!
                  </h4>
                  <p className="font-lekton text-white/95 text-xs md:text-xs lg:text-sm font-light italic leading-relaxed max-w-md md:max-w-xs select-none">
                    Let us know if you can celebrate this unforgettable moment with us.
                  </p>
                </FadeIn>

                {/* Card 4: RSVP Form Card (Notepad card - less rounded, scaled on desktop) */}
                <FadeIn delay={0.4} className="w-full flex justify-center md:justify-start">
                  <div className="relative bg-[#f6f3eb] rounded-xl p-6 md:p-5 w-full max-w-[420px] md:max-w-[360px] lg:max-w-[400px] min-h-[380px] md:min-h-[400px] shadow-2xl text-[#3d332a] flex flex-col justify-between overflow-visible">
                    {/* SVG Paperclip in Top Right */}
                    <div className="absolute top-[-16px] md:top-[-14px] right-[24px] md:right-[20px] z-20 w-8 h-12 md:w-7 md:h-10 text-[#5c554e] drop-shadow-md rotate-[12deg] select-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </div>

                    {isCheckingStatus ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-3 py-12 md:py-8">
                        <div className="w-6 h-6 md:w-4 md:h-4 border-t-2 border-[#5c554e] rounded-full animate-spin"></div>
                        <span className="font-sans text-[10px] md:text-[8px] font-bold text-gray-500 tracking-wider uppercase">Loading Form...</span>
                      </div>
                    ) : (
                      <form onSubmit={handleRsvpSubmit} className="flex-1 flex flex-col justify-between gap-4 md:gap-2.5">
                        
                        {/* Name input */}
                        <div className="space-y-1 md:space-y-0.5">
                          <label className="block font-sans text-xs md:text-[11px] font-medium text-[#3d332a] select-none">
                            Your name
                          </label>
                          <input
                            type="text"
                            value={rsvpGuestName}
                            onChange={(e) => setRsvpGuestName(e.target.value)}
                            placeholder="Guest Name"
                            disabled={hasRsvpSubmitted}
                            className="w-full bg-[#ebe7db]/40 border border-[#b8b3a9] py-2.5 px-4 md:py-1.5 md:px-3 rounded-md text-xs md:text-[11px] text-[#3d332a]/85 font-sans focus:outline-none focus:border-[#6c6355] focus:ring-1 focus:ring-[#6c6355] transition-all"
                          />
                        </div>

                        {/* Attendance Options */}
                        <div className="space-y-2 md:space-y-1">
                          <label className="block font-sans text-xs md:text-[11px] font-medium text-[#3d332a] select-none">
                            {q1Rsvp}
                          </label>
                          
                          {hasRsvpSubmitted ? (
                            // Submitted state: show percentage in each button
                            <div className="space-y-2 md:space-y-1">
                              {(() => {
                                const total = rsvpStats.hadir + rsvpStats.tidakHadir;
                                const yesPercent = total > 0 ? Math.round((rsvpStats.hadir / total) * 100) : 100;
                                const noPercent = total > 0 ? Math.round((rsvpStats.tidakHadir / total) * 100) : 0;
                                
                                return (
                                  <>
                                    <div 
                                      className={`w-full text-left py-3 px-5 md:py-2 md:px-3 rounded-md text-xs md:text-[11px] font-sans select-none ${
                                        isAttending === "yes" 
                                          ? "bg-[#6c6355] text-white" 
                                          : "bg-[#e4ded5] text-[#3d332a]"
                                      }`}
                                    >
                                      {a1Rsvp}
                                    </div>
                                    
                                    <div 
                                      className={`w-full text-left py-3 px-5 md:py-2 md:px-3 rounded-md text-xs md:text-[11px] font-sans select-none ${
                                        isAttending === "no" 
                                          ? "bg-[#6c6355] text-white" 
                                          : "bg-[#e4ded5] text-[#3d332a]"
                                      }`}
                                    >
                                      {a2Rsvp}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            // Unsubmitted state: clickable buttons
                            <div className="space-y-2 md:space-y-1">
                              <button
                                type="button"
                                onClick={() => setIsAttending("yes")}
                                className={`w-full text-left py-3 px-5 md:py-2 md:px-3.5 rounded-md text-xs md:text-[11px] transition-all duration-300 font-sans border border-transparent ${
                                  isAttending === "yes"
                                    ? "bg-[#6c6355] text-white"
                                    : "bg-[#e4ded5] text-[#3d332a] hover:bg-[#dcd7cb]"
                                }`}
                              >
                                {a1Rsvp}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAttending("no")}
                                className={`w-full text-left py-3 px-5 md:py-2 md:px-3.5 rounded-md text-xs md:text-[11px] transition-all duration-300 font-sans border border-transparent ${
                                  isAttending === "no"
                                    ? "bg-[#6c6355] text-white"
                                    : "bg-[#e4ded5] text-[#3d332a] hover:bg-[#dcd7cb]"
                                }`}
                              >
                                {a2Rsvp}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Pax Count Selection */}
                        <div className="space-y-1 md:space-y-0.5">
                          <label className="block font-sans text-xs md:text-[11px] font-medium text-[#3d332a] select-none">
                            Jumlah Tamu / Pax Yang Hadir
                          </label>
                          <select
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(Number(e.target.value))}
                            disabled={hasRsvpSubmitted}
                            className="w-full bg-[#ebe7db]/40 border border-[#b8b3a9] py-2.5 px-4 md:py-1.5 md:px-3 rounded-md text-xs md:text-[11px] text-[#3d332a] font-sans focus:outline-none focus:border-[#6c6355] focus:ring-1 focus:ring-[#6c6355] transition-all cursor-pointer"
                          >
                            <option value={1}>1 Orang</option>
                            <option value={2}>2 Orang</option>
                          </select>
                        </div>

                        {/* Submit button / Submitted text */}
                        <div className="pt-3 md:pt-1">
                          {hasRsvpSubmitted ? (
                            <div className="text-[#3d332a] font-sans text-sm md:text-[10px] font-bold text-center py-2 md:py-1 select-none uppercase tracking-wide">
                              RSVP Submitted
                            </div>
                          ) : (
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-4 md:py-2 bg-[#6c6355] hover:bg-[#574f44] text-white font-sans text-xs md:text-xs font-bold tracking-wider rounded-md shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {isSubmitting ? "Submitting..." : "RSVP now"}
                            </button>
                          )}
                        </div>

                      </form>
                    )}
                  </div>
                </FadeIn>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: BLESSING WALL (LIGHT CREAM THEME FOR DEVI & DHIKA) */}
      {hasGuestbook && (
        <section id="blessings" className="relative w-full min-h-screen snap-start shrink-0 flex flex-col items-center bg-[#e2ddc7] py-16 md:py-24 text-[#4a3525]">
          <div className="relative z-10 w-full max-w-5xl px-4 md:px-8 flex flex-col items-center select-none">
            <FadeIn>
              <div className="text-center mb-10 md:mb-14">
                <span className="font-seasons text-[#4a3525]/70 text-xs font-semibold tracking-[0.25em] uppercase mb-2 block">
                  DOA RESTU
                </span>
                <h2 className="font-altesse text-[#4a3525] text-[clamp(40px,9vw,64px)] font-light leading-none mb-3">
                  Blessings & Wishes
                </h2>
                <p className="font-lekton text-[#4a3525]/80 text-xs md:text-sm tracking-wide max-w-sm mx-auto leading-relaxed">
                  Tuliskan pesan & doa terbaik Anda untuk kedua mempelai di awal lembaran baru kami.
                </p>
              </div>
            </FadeIn>

            {/* Input Form Card */}
            <div className="w-full max-w-xl mb-16 md:mb-24">
              <FadeIn delay={0.2}>
                <div className="bg-[#FDFBF7]/90 backdrop-blur-xl border border-[#4a3525]/15 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl w-full">
                  {myWishes.length >= 3 ? (
                    <div className="text-center space-y-4 py-4">
                       <span className="text-4xl block mb-2 opacity-60">✨</span>
                       <h4 className="font-altesse text-2xl md:text-3xl text-[#4a3525] italic">Doa Restu Terkirim</h4>
                       <p className="font-lekton text-xs text-[#4a3525]/70 leading-relaxed max-w-xs mx-auto">
                         Anda telah mengirimkan 3 ucapan doa. Terima kasih atas doa dan restu hangat Anda!
                       </p>
                    </div>
                  ) : (
                    <form onSubmit={handleWishSubmit} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2 text-left">
                        <label className="font-seasons text-xs font-semibold text-[#4a3525] tracking-wider uppercase">
                          Nama Anda
                        </label>
                        <input 
                          type="text"
                          value={wishSenderName || (guestName && guestName !== "Guest Name" && guestName !== "Special Guest" ? guestName : "Tamu Undangan")}
                          disabled
                          readOnly
                          className="w-full bg-[#EAE3D2]/50 border border-[#4a3525]/20 rounded-2xl px-4 py-3 text-xs md:text-sm text-[#4a3525] font-sans font-bold cursor-not-allowed select-none opacity-80"
                        />
                      </div>

                      <div className="flex flex-col gap-2 text-left">
                        <label className="font-seasons text-xs font-semibold text-[#4a3525] tracking-wider uppercase">
                          Ucapan & Doa ({myWishes.length}/3)
                        </label>
                        <textarea 
                          value={wishText} 
                          onChange={(e) => setWishText(e.target.value)} 
                          className="w-full bg-white border border-[#4a3525]/20 focus:border-[#4a3525] rounded-2xl p-4 text-xs md:text-sm text-[#4a3525] focus:outline-none min-h-[100px] resize-none font-sans shadow-inner placeholder-[#4a3525]/40" 
                          placeholder="Tuliskan ucapan dan doa restu Anda di sini..." 
                          required 
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full py-3.5 px-8 rounded-full bg-[#4a3525] text-white hover:bg-[#36261a] transition-all duration-300 font-seasons text-xs tracking-[0.2em] uppercase shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer font-bold mt-1"
                      >
                        <span className="truncate">
                          {isSubmitting && successType === 'wish' ? "MENGIRIM..." : "KIRIM UCAPAN & DOA"}
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              </FadeIn>
            </div>

            {/* GALLERY WITH PAGINATION */}
            <div ref={galleryRef} className="w-full flex flex-col items-center">
              <div className="flex flex-col items-center mb-12 text-center">
                 <div className="h-[1px] w-16 bg-[#4a3525]/20 mb-6"></div>
                 <h3 className="font-altesse text-[#4a3525] text-[clamp(32px,7vw,52px)] font-light leading-none mb-2">
                   Gallery of Love
                 </h3>
                 <span className="font-lekton text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#4a3525]/70 uppercase">
                   {allDisplayWishes.length} Pesan & Doa Terkirim
                 </span>
              </div>

              {/* Single Column List (Paginated) */}
              <div className="w-full max-w-lg flex flex-col gap-6 md:gap-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentPage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-5 md:gap-6"
                  >
                    {currentWishes.map((wish) => (
                      <WishCard key={wish.id} wish={wish} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 md:mt-16 flex items-center justify-center gap-4 w-full flex-wrap">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 border border-[#4a3525]/30 rounded-full text-[#4a3525] disabled:opacity-20 hover:bg-[#4a3525]/10 transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <div className="flex items-center gap-2">
                     <span className="font-lekton text-xs font-bold text-[#4a3525]/80 uppercase">Halaman</span>
                     <div className="px-3 py-1 bg-[#4a3525] rounded-lg text-white text-xs font-mono font-bold">{currentPage}</div>
                     <span className="font-lekton text-xs font-bold text-[#4a3525]/60 uppercase">dari {totalPages}</span>
                  </div>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 border border-[#4a3525]/30 rounded-full text-[#4a3525] disabled:opacity-20 hover:bg-[#4a3525]/10 transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </div>
              )}

              {allDisplayWishes.length === 0 && (
                <p className="font-lekton text-[#4a3525]/50 text-xs tracking-widest uppercase italic py-16">
                  Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#FDFBF7] border border-[#4a3525]/20 p-8 md:p-12 flex flex-col items-center gap-6 text-center max-w-sm rounded-3xl relative shadow-2xl text-[#4a3525]">
              <div className="w-16 h-16 bg-[#EAE3D2] rounded-full flex items-center justify-center text-3xl border border-[#4a3525]/20"><span className="relative z-10">{successType === 'rsvp' ? '🥂' : '✨'}</span></div>
              <div className="space-y-2">
                <h4 className="font-altesse text-3xl md:text-4xl text-[#4a3525] italic">{successType === 'rsvp' ? 'Terima Kasih' : 'Terkirim'}</h4>
                <p className="font-lekton text-[#4a3525]/70 text-xs tracking-wider leading-relaxed">{successType === 'rsvp' ? "Konfirmasi kehadiran Anda telah kami terima." : "Doa dan ucapan restu Anda telah disampaikan."}</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="w-full py-3.5 bg-[#4a3525] text-white text-xs font-seasons font-bold tracking-[0.2em] uppercase rounded-full hover:bg-[#36261a] transition-all cursor-pointer">Tutup</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

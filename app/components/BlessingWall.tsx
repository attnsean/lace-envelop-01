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
    ? wish.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : "Recently Shared";

  return (
    <div className="group relative flex flex-col gap-5 p-6 md:p-8 bg-white/[0.015] hover:bg-white/[0.03] border border-white/5 hover:border-[#979e6c]/20 rounded-[2rem] transition-all duration-700 shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#979e6c]/5 transition-all duration-700"></div>
      
      <p 
        ref={textRef}
        className={`text-[14px] md:text-base font-sans font-light text-gray-300 leading-relaxed relative z-10 group-hover:text-white transition-colors text-center ${!isExpanded ? 'line-clamp-8' : ''}`}
      >
        &ldquo;{wish.text}&rdquo;
      </p>
      
      {isTruncated && !isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-[#979e6c] text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors relative z-10 mt-2 mx-auto"
        >
          See more
        </button>
      )}

      {isExpanded && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-[#979e6c] text-[10px] font-bold tracking-widest uppercase transition-colors relative z-10 mt-2 mx-auto"
        >
          Show less
        </button>
      )}
      
      <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/5 relative z-10 mt-auto">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#979e6c] group-hover:border-[#979e6c]/40 transition-all duration-500">{(wish.name || "G").charAt(0)}</div>
        <div className="flex flex-col items-center gap-2">
          <h4 className="text-[10px] font-bold text-white tracking-[0.3em] uppercase leading-none group-hover:text-[#979e6c] transition-colors">{wish.name}</h4>
          <span className="text-[8px] text-gray-600 uppercase tracking-[0.2em]">{formattedDate}</span>
        </div>
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xnruifsptjsafctjwqdh.supabase.co";

  const sec5Bg = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projId}/sec5-bg.png`;
  const sec5Envelope = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projId}/sec5-envelope.png`;
  const sec5Couple = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projId}/sec5-couple.jpg`;

  const q1Rsvp = project?.question01_rsvp || "Are you coming?";
  const q2Rsvp = project?.question02_rsvp || "Let us know if you have any dietary restrictions.";
  const a1Rsvp = project?.answer01_rsvp || "Absolutely, wouldn't miss it!";
  const a2Rsvp = project?.answer02_rsvp || "Sadly cannot make it";

  // States
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rsvpGuestName, setRsvpGuestName] = useState("");
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
    if (guestName && guestName !== "Guest Name" && guestName !== "Special Guest") {
      setRsvpGuestName(guestName);
    } else {
      setRsvpGuestName("");
    }
  }, [guestName]);

  // Helper to fetch wishes
  const fetchWishes = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const formatted = (data as DbWish[]).map((w: DbWish) => ({
          id: w.id,
          name: w.name,
          text: w.message,
          createdAt: w.created_at ? new Date(w.created_at) : null
        }));
        setAllDisplayWishes(formatted);
      }
    } catch (err) {
      console.error("Error fetching guestbook entries:", err);
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
              .eq('guest_id', guest.id)
              .limit(1);

            if (byIdData && byIdData.length > 0 && !byIdError) {
              hasRsvp = true;
              const rsvpRecord = byIdData[0];
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
              .ilike('guest_name', guestName)
              .limit(1);

            if (byNameData && byNameData.length > 0 && !byNameError) {
              hasRsvp = true;
              const rsvpRecord = byNameData[0];
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
            .select('attendance')
            .eq('project_id', projectId);

          if (statsData && !statsError) {
            const hadir = statsData.filter(r => r.attendance === 'hadir').length;
            const tidakHadir = statsData.filter(r => r.attendance === 'tidak_hadir').length;
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

    const submitName = rsvpGuestName.trim() || guestName || "Guest Name";
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          guest_id: guest?.id || null,
          name: submitName,
          message: wishText
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit wish');
      }

      const newWish: WishItem = {
        text: wishText,
        createdAt: new Date()
      };
      setMyWishes([...myWishes, newWish]);
      setWishText("");
      setSuccessType('wish');
      setShowSuccess(true);
      
      // Re-fetch wishes live from Supabase
      await fetchWishes();
    } catch (err) {
      console.error('Error submitting wish:', err);
      alert('Failed to submit blessing. Please try again.');
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
                
                {/* Card 1: Couple Photo (Landscape matte frame) */}
                <FadeIn delay={0.1} className="w-full flex justify-center md:justify-end">
                  <div className="bg-white p-4 pb-6 md:p-2.5 md:pb-5 shadow-2xl rounded-sm transition-all duration-500 w-full max-w-[420px] md:max-w-[360px] lg:max-w-[400px] aspect-[4/3] flex flex-col justify-between">
                    <div className="relative w-full h-[90%] overflow-hidden bg-neutral-100">
                      <Image
                        src={sec5Couple}
                        alt="Couple photo"
                        fill
                        unoptimized
                        className="object-cover"
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
                      <p className="font-seasons text-[#4a3f35] text-[13px] xs:text-[14px] sm:text-[15px] md:text-[12px] lg:text-[14px] leading-[1.4] font-medium tracking-wide">
                        Kindly RSVP by July 30, 2026 <br />
                        as seating has been specially <br />
                        arranged for each guest
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

                        {/* Dietary restrictions */}
                        <div className="space-y-1 md:space-y-0.5">
                          <label className="block font-sans text-xs md:text-[11px] font-medium text-[#3d332a] select-none">
                            {q2Rsvp}
                          </label>
                          <input
                            type="text"
                            value={dietaryRestrictions}
                            onChange={(e) => setDietaryRestrictions(e.target.value)}
                            disabled={hasRsvpSubmitted}
                            placeholder="e.g. Vegetarian, Gluten-free, etc."
                            className="w-full bg-[#ebe7db]/40 border border-[#b8b3a9] py-2.5 px-4 md:py-1.5 md:px-3 rounded-md text-xs md:text-[11px] text-[#3d332a] font-sans focus:outline-none focus:border-[#6c6355] focus:ring-1 focus:ring-[#6c6355] transition-all placeholder-[#5c554e]/40"
                          />
                        </div>

                        {/* Song Nomination */}
                        <div className="space-y-1 md:space-y-0.5">
                          <label className="block font-sans text-xs md:text-[11px] font-medium text-[#3d332a] select-none">
                            Nominate a song for our playlist!
                          </label>
                          <input
                            type="text"
                            value={songNomination}
                            onChange={(e) => setSongNomination(e.target.value)}
                            disabled={hasRsvpSubmitted}
                            placeholder="Song title & Artist"
                            className="w-full bg-[#ebe7db]/40 border border-[#b8b3a9] py-2.5 px-4 md:py-1.5 md:px-3 rounded-md text-xs md:text-[11px] text-[#3d332a] font-sans focus:outline-none focus:border-[#6c6355] focus:ring-1 focus:ring-[#6c6355] transition-all placeholder-[#5c554e]/40"
                          />
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

      {/* SECTION 2: BLESSING WALL */}
      {hasGuestbook && (
        <section id="blessings" className="relative w-full min-h-screen snap-start shrink-0 flex flex-col items-center bg-neutral-900 py-16 md:py-24">
        <div className="absolute inset-0 z-0">
          <Image 
            src={galleryImages && galleryImages.length > 0 
              ? (galleryImages[4 % galleryImages.length] || project?.opening_photo_url || bgWishes) 
              : (project?.opening_photo_url || bgWishes)
            } 
            alt="Wishes BG" 
            fill 
            unoptimized={
              galleryImages && galleryImages.length > 0 
                ? typeof (galleryImages[4 % galleryImages.length] || project?.opening_photo_url) === 'string'
                : typeof (project?.opening_photo_url) === 'string'
            }
            className="object-cover opacity-20 grayscale" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>
        <div className="relative z-10 w-full max-w-5xl px-6 md:px-10 flex flex-col items-center">
          <FadeIn>
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[7px] md:text-[10px] font-bold tracking-[0.6em] text-[#979e6c] uppercase mb-4 block">Part II</span>
              <h2 className="text-3xl md:text-5xl font-serif text-white font-light tracking-tight leading-none">Blessings</h2>
              <p className="text-[7px] sm:text-[8px] md:text-[10px] text-gray-600 tracking-[0.2em] md:tracking-[0.3em] uppercase mt-4 md:mt-6 max-w-[250px] md:max-w-xs mx-auto leading-relaxed">Leave your warmest words for the beginning of our new chapter.</p>
            </div>
          </FadeIn>
          <div className="w-full max-w-2xl mb-20 md:mb-32">
            <FadeIn delay={0.2}>
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-2xl w-full">
                {myWishes.length >= 3 ? (
                  <div className="text-center space-y-6 py-4">
                     <span className="text-5xl block mb-6 opacity-30">✨</span>
                     <h4 className="text-3xl font-serif text-white italic">Blessings Sent</h4>
                     <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase leading-relaxed max-w-xs mx-auto">You have shared 3 beautiful blessings. They are now part of our wall forever.</p>
                  </div>
                ) : (
                  <form onSubmit={handleWishSubmit} className="space-y-10">
                    <div className="relative">
                      <textarea value={wishText} onChange={(e) => setWishText(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 text-xs md:text-sm text-white focus:outline-none focus:border-[#979e6c] transition-all duration-500 peer placeholder-transparent min-h-[80px] md:min-h-[100px] resize-none font-sans" placeholder="Wishes" required />
                      <label className="absolute left-0 -top-6 md:-top-7 text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.4em] peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-[#979e6c] whitespace-nowrap">Share your blessings ({myWishes.length}/3)</label>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 md:py-5 border border-white/10 text-white text-[9px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase rounded-full hover:bg-white hover:text-black transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="truncate">{isSubmitting && successType === 'wish' ? "SHARING..." : "SUBMIT BLESSING"}</span>
                    </button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>

          {/* GALLERY WITH PAGINATION */}
          <div ref={galleryRef} className="w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-16 text-center">
               <div className="h-[1px] w-16 bg-white/10 mb-8"></div>
               <h3 className="text-2xl md:text-4xl font-serif text-white font-light tracking-tight leading-none mb-4">Gallery of Love</h3>
               <span className="text-[7px] md:text-[9px] font-bold tracking-[0.3em] md:tracking-[0.5em] text-[#979e6c] uppercase">{allDisplayWishes.length} Shared Messages</span>
            </div>

            {/* Single Column List (Paginated) */}
            <div className="w-full max-w-lg flex flex-col gap-6 md:gap-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-6 md:gap-8"
                >
                  {currentWishes.map((wish) => (
                    <WishCard key={wish.id} wish={wish} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 md:mt-24 flex items-center justify-center gap-4 md:gap-8 w-full flex-wrap">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 md:p-4 border border-white/10 rounded-full text-[#979e6c] disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <div className="flex items-center gap-2 md:gap-4">
                   <span className="text-[9px] md:text-[10px] font-bold text-white tracking-[0.2em] md:tracking-[0.4em] uppercase">Page</span>
                   <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-lg text-[#979e6c] text-[10px] md:text-xs font-bold">{currentPage}</div>
                   <span className="text-[9px] md:text-[10px] font-bold text-gray-600 tracking-[0.2em] md:tracking-[0.4em] uppercase">of {totalPages}</span>
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 md:p-4 border border-white/10 rounded-full text-[#979e6c] disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            )}

            {allDisplayWishes.length === 0 && <p className="text-gray-700 text-[10px] tracking-[0.5em] uppercase italic py-20">The gallery is waiting for your light.</p>}
          </div>
        </div>
      </section>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-neutral-950 border border-white/5 p-12 md:p-20 flex flex-col items-center gap-12 text-center max-w-sm rounded-[5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#979e6c] to-transparent"></div>
              <div className="w-24 h-24 bg-[#979e6c]/5 rounded-full flex items-center justify-center text-5xl border border-[#979e6c]/10"><span className="relative z-10">{successType === 'rsvp' ? '🥂' : '✨'}</span></div>
              <div className="space-y-5">
                <h4 className="text-white font-serif text-4xl tracking-widest italic leading-none">{successType === 'rsvp' ? 'Confirmed' : 'Sent'}</h4>
                <p className="text-gray-500 text-[10px] font-sans tracking-[0.25em] leading-relaxed uppercase">{successType === 'rsvp' ? "Your presence is our joy." : "Your beautiful words are shared."}</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="w-full py-6 bg-white text-black text-[11px] font-bold tracking-[0.6em] uppercase rounded-full hover:bg-[#979e6c]">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { DbProject, DbEvent } from "../../../lib/resolveProject";
import { supabase } from "../../../lib/supabase";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  events?: DbEvent[] | null;
  setShowRundownOverlay: (val: boolean) => void;
}

export default function DetailsSection({ project, events, setShowRundownOverlay }: Props) {
  const [displayEvents, setDisplayEvents] = useState<DbEvent[]>(events || []);

  useEffect(() => {
    if (events && events.length > 0) {
      setDisplayEvents(events);
    } else if (project?.id) {
      supabase
        .from("project_events")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true })
        .then(({ data, error }) => {
          if (data && data.length > 0) {
            setDisplayEvents(data);
          }
        });
    }
  }, [events, project?.id]);

  const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';
  const gallery = (project as any)?.gallery_photos || [];
  const tplUserId = 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const tplDemoProjectId = '6d889fed-efb5-4a32-97ce-16f74bce763c';
  const detailsImgUrl = (typeof gallery[4] === 'string' ? gallery[4] : gallery[4]?.url) || project?.cover_photo_url || `${supabaseUrl}/storage/v1/object/public/undangan/${tplUserId}/${tplDemoProjectId}/sec6-details.jpg`;

  const formatEnglishDate = (dateStr?: string | null) => {
    const date = dateStr ? new Date(dateStr) : null;
    if (!date || isNaN(date.getTime())) return "Saturday, 8 August 2026";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatIndonesianDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`;
    }
    return timeStr;
  };

  const getWeddingTimeRange = () => {
    if (displayEvents && displayEvents.length > 0) {
      const sortedEvents = [...displayEvents].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined) {
          return a.sort_order - b.sort_order;
        }
        return (a.event_time || "").localeCompare(b.event_time || "");
      });
      const firstEvent = sortedEvents[0];
      const lastEvent = sortedEvents[sortedEvents.length - 1];
      const startTime = formatTime(firstEvent.event_time);
      const endTime = formatTime(lastEvent.end_time || lastEvent.event_time);
      if (startTime && endTime && startTime !== endTime) {
        return `${startTime}-${endTime}`;
      } else if (startTime) {
        return startTime;
      }
    }
    if (project?.wedding_time) {
      return formatTime(project.wedding_time);
    }
    return "13.15-18.00";
  };

  const weddingTimeRange = getWeddingTimeRange();
  const eventDateRaw = project?.wedding_date || displayEvents?.[0]?.event_date || "2026-08-08";
  const formattedDate = formatEnglishDate(eventDateRaw);

  return (
    <section id="details" className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col md:flex-row bg-[#E1D8CC]">
      {/* Left Column (Foot-in-grass photo) */}
      <div className="w-full md:w-1/2 h-[38%] md:h-full relative overflow-hidden shrink-0">
        <Image
          src={detailsImgUrl}
          alt="Wedding Details Photo"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Right Column (Beige detail card) */}
      <div className="w-full md:w-1/2 h-[62%] md:h-full bg-[#E1D8CC] flex flex-col items-center justify-center p-6 md:p-12 text-center relative select-none overflow-y-auto no-scrollbar">
        {/* "The Details" title matching template */}
        <FadeIn delay={0.4}>
          <div className="flex flex-col items-center mb-3 sm:mb-5 md:mb-4">
            <span className="font-parfumerie text-[#4A3E3D] text-[clamp(28px,7vw,48px)] md:text-[clamp(32px,2.8vw,48px)] leading-none italic font-light z-10 block -mb-2 sm:-mb-3 md:-mb-2">
              The
            </span>
            <h3 className="font-seasons text-[#4A3E3D] text-[clamp(20px,6.2vw,38px)] md:text-[clamp(24px,2.2vw,36px)] font-normal uppercase leading-none tracking-[0.15em] md:tracking-[0.2em]">
              DETAILS
            </h3>
          </div>
        </FadeIn>
 
        {/* Date & Location */}
        <FadeIn delay={0.5}>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 md:mb-5">
            <h4 className="font-seasons text-[#4A3E3D] text-[clamp(11px,3.2vw,15px)] md:text-[clamp(13px,1.2vw,16px)] font-medium uppercase tracking-[0.2em] md:tracking-[0.25em] mb-1 sm:mb-2">
              DATE & LOCATION
            </h4>
            <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(10px,2.8vw,14px)] md:text-[clamp(12px,0.9vw,14px)] leading-tight sm:leading-relaxed tracking-wider">
              {formattedDate}
            </p>
            <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(10px,2.8vw,14px)] md:text-[clamp(12px,0.9vw,14px)] leading-tight sm:leading-relaxed tracking-wider notranslate">
              {displayEvents?.[0]?.venue_name || project?.venue_name || "Derich Garden Restaurant"}
            </p>
          </div>
        </FadeIn>
 
        {/* Thin Divider */}
        <FadeIn delay={0.6} className="w-full flex justify-center">
          <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-3.5 sm:my-5 md:my-4"></div>
        </FadeIn>
 
        {/* Akad & Reception */}
        <FadeIn delay={0.7}>
          <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6 md:mb-5">
            {displayEvents.map((evt, idx) => {
              const label = evt.custom_label || (evt.event_type === "akad" ? "AKAD NIKAH" : evt.event_type === "resepsi" ? "RESEPSI PERNIKAHAN" : evt.event_type?.toUpperCase() || "ACARA");
              const startTime = evt.event_time ? evt.event_time.substring(0, 5).replace(":", ".") : "";
              const endTime = evt.end_time ? evt.end_time.substring(0, 5).replace(":", ".") : "";
              let timeStr = "";
              if (startTime && endTime) {
                timeStr = `${startTime} - ${endTime} WIB`;
              } else if (startTime) {
                timeStr = `${startTime} WIB - Selesai`;
              } else {
                timeStr = "WIB";
              }

              // Check if event date exists and is different from primary date
              const primaryDate = displayEvents[0]?.event_date || (project as any)?.wedding_date;
              const isDifferentDate = evt.event_date && primaryDate && evt.event_date !== primaryDate;
              const evtFormattedDate = isDifferentDate ? formatIndonesianDate(evt.event_date) : null;

              return (
                <React.Fragment key={evt.id || idx}>
                  {idx > 0 && <div className="w-16 h-[1px] bg-[#4A3E3D]/20 my-1"></div>}
                  <div className="flex flex-col items-center gap-1">
                    <h4 className="font-seasons text-[#4A3E3D] text-[clamp(11px,3.2vw,15px)] md:text-[clamp(13px,1.2vw,16px)] font-medium uppercase tracking-[0.2em] md:tracking-[0.25em]">
                      {label}
                    </h4>
                    {evtFormattedDate && (
                      <p className="font-lekton text-[#4A3E3D] font-bold text-[clamp(10px,2.8vw,13px)] md:text-[clamp(11px,0.8vw,13px)] leading-tight tracking-wider">
                        {evtFormattedDate}
                      </p>
                    )}
                    <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(10px,2.8vw,14px)] md:text-[clamp(12px,0.9vw,14px)] leading-tight sm:leading-relaxed tracking-wider">
                      {timeStr}
                    </p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </FadeIn>
 
        {/* Thin Divider */}
        <FadeIn delay={0.8} className="w-full flex justify-center">
          <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-3.5 sm:my-5 md:my-4"></div>
        </FadeIn>
 
        {/* Action Button */}
        <FadeIn delay={0.9} className="mt-2 sm:mt-4">
          <button
            onClick={() => setShowRundownOverlay(true)}
            className="font-lekton text-[#4A3E3D] text-[clamp(10px,2.8vw,13px)] md:text-[clamp(11px,0.8vw,13px)] tracking-wider px-6 md:px-10 py-2.5 md:py-3.5 border border-[#4A3E3D] rounded-full bg-transparent hover:bg-[#4A3E3D]/10 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Detailed Info & Rundown
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

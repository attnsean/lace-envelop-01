"use client";

import React from "react";
import Image from "next/image";
import { DbProject, DbEvent } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  events?: DbEvent[] | null;
  setShowRundownOverlay: (val: boolean) => void;
}

export default function DetailsSection({ project, events, setShowRundownOverlay }: Props) {
  const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';
  const detailsImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec6-details.jpg`;

  const formatEnglishDate = (dateStr?: string | null) => {
    const date = dateStr ? new Date(dateStr) : null;
    if (!date || isNaN(date.getTime())) return "Saturday, 8 August 2026";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
    if (events && events.length > 0) {
      const sortedEvents = [...events].sort((a, b) => {
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
  const eventDateRaw = project?.wedding_date || events?.[0]?.event_date || "2026-08-08";
  const formattedDate = formatEnglishDate(eventDateRaw);

  return (
    <section id="details" className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col md:flex-row bg-[#E1D8CC]">
      {/* Left Column (Foot-in-grass photo) */}
      <div className="relative w-full md:w-[50%] h-[32%] sm:h-[35%] md:h-full shrink-0 overflow-hidden">
        <FadeIn className="w-full h-full" delay={0.2}>
          <Image
            src={detailsImgUrl}
            alt="Wedding Details Foot Photo"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover pointer-events-none w-full h-full select-none"
            unoptimized
          />
        </FadeIn>
      </div>

      {/* Right Column (Beige detail card) */}
      <div className="w-full md:w-[50%] h-[68%] sm:h-[65%] md:h-full flex flex-col items-center justify-center overflow-y-auto no-scrollbar p-3 xs:p-5 md:p-8 text-[#4A3E3D] select-none text-center bg-[#E1D8CC]">
        {/* The Details Title */}
        <FadeIn delay={0.3}>
          <div className="flex flex-col items-center mb-4 sm:mb-8 md:mb-6 select-none relative">
            <span className="font-parfumerie text-[#4A3E3D] text-[clamp(36px,11vw,65px)] md:text-[clamp(44px,4vw,68px)] leading-none italic font-light z-10 -mb-2 md:-mb-2">
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
            <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(10px,2.8vw,14px)] md:text-[clamp(12px,0.9vw,14px)] leading-tight sm:leading-relaxed tracking-wider">
              {project?.venue_name || "Openaire Resto Bar Market Semarang"}
            </p>
          </div>
        </FadeIn>
 
        {/* Thin Divider */}
        <FadeIn delay={0.6} className="w-full flex justify-center">
          <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-3.5 sm:my-5 md:my-4"></div>
        </FadeIn>
 
        {/* Akad & Reception */}
        <FadeIn delay={0.7}>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 md:mb-5">
            <h4 className="font-seasons text-[#4A3E3D] text-[clamp(11px,3.2vw,15px)] md:text-[clamp(13px,1.2vw,16px)] font-medium uppercase tracking-[0.2em] md:tracking-[0.25em] mb-1 sm:mb-2">
              AKAD & RECEPTION
            </h4>
            <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(10px,2.8vw,14px)] md:text-[clamp(12px,0.9vw,14px)] leading-tight sm:leading-relaxed tracking-wider">
              {weddingTimeRange}
            </p>
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

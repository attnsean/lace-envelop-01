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
      <div className="w-full md:w-[50%] h-[68%] sm:h-[65%] md:h-full flex flex-col items-center justify-center overflow-y-auto no-scrollbar p-3 xs:p-5 md:p-12 text-[#4A3E3D] select-none text-center bg-[#E1D8CC]">
        {/* The Details Title */}
        <FadeIn delay={0.3}>
          <div className="flex flex-col items-center mb-2 sm:mb-6 md:mb-12 select-none relative">
            <span className="font-parfumerie text-[#4A3E3D] text-[clamp(45px,10vw,95px)] md:text-[clamp(85px,6vw,120px)] leading-none italic font-light z-10 -mb-2 md:-mb-5">
              The
            </span>
            <h3 className="font-seasons text-[#4A3E3D] text-[clamp(26px,6.5vw,56px)] md:text-[clamp(48px,4.5vw,68px)] font-normal uppercase leading-none tracking-[0.15em] md:tracking-[0.2em]">
              DETAILS
            </h3>
          </div>
        </FadeIn>

        {/* Date & Location */}
        <FadeIn delay={0.5}>
          <div className="flex flex-col items-center mb-2 sm:mb-4 md:mb-8">
            <h4 className="font-seasons text-[#4A3E3D] text-[clamp(12px,2.5vw,18px)] md:text-[clamp(18px,1.8vw,24px)] font-medium uppercase tracking-[0.2em] md:tracking-[0.25em] mb-1 md:mb-3">
              DATE & LOCATION
            </h4>
            <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(11px,2.2vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-tight sm:leading-relaxed tracking-wider">
              {formattedDate}
            </p>
            <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(11px,2.2vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-tight sm:leading-relaxed tracking-wider">
              {project?.venue_name || "Openaire Resto Bar Market Semarang"}
            </p>
            {project?.venue_address && (
              <p className="font-lekton text-[#4A3E3D]/80 text-[clamp(9px,1.6vw,13px)] md:text-[clamp(12px,1vw,14px)] leading-normal tracking-wider mt-0.5 px-4 max-w-sm">
                {project.venue_address}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Thin Divider */}
        <FadeIn delay={0.6} className="w-full flex justify-center">
          <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-1.5 sm:my-3 md:my-5"></div>
        </FadeIn>

        {/* Akad & Reception */}
        <FadeIn delay={0.7}>
          <div className="flex flex-col items-center mb-2 sm:mb-4 md:mb-8">
            <h4 className="font-seasons text-[#4A3E3D] text-[clamp(12px,2.5vw,18px)] md:text-[clamp(18px,1.8vw,24px)] font-medium uppercase tracking-[0.2em] md:tracking-[0.25em] mb-1 md:mb-3">
              AKAD & RECEPTION
            </h4>
            {events && events.length > 0 ? (
              <div className="flex flex-col gap-1">
                {events.map((evt, idx) => {
                  const label = (evt.event_type === "akad" || evt.custom_label === "Pemberkatan Pernikahan" || evt.custom_label === "Akad Nikah")
                    ? "Holy Matrimony"
                    : (evt.event_type === "resepsi" || evt.event_type === "reception" || evt.custom_label === "Resepsi Pernikahan")
                    ? "Wedding Reception"
                    : evt.custom_label || evt.event_type;
                  const timeStr = formatTime(evt.event_time) || "13.15";
                  const endTimeStr = evt.end_time ? ` - ${formatTime(evt.end_time)}` : " - Finish";
                  return (
                    <p key={idx} className="font-lekton text-[#4A3E3D]/95 text-[clamp(11px,2.2vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-tight sm:leading-relaxed tracking-wider">
                      {label} : {timeStr}{endTimeStr}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(11px,2.2vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-tight sm:leading-relaxed tracking-wider">
                {project?.wedding_time || "13.15 - 18.00"}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Thin Divider */}
        <FadeIn delay={0.8} className="w-full flex justify-center">
          <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-1.5 sm:my-3 md:my-5"></div>
        </FadeIn>

        {/* Action Button */}
        <FadeIn delay={0.9} className="mt-1 sm:mt-2">
          <button
            onClick={() => setShowRundownOverlay(true)}
            className="font-lekton text-[#4A3E3D] text-[clamp(10px,2vw,15px)] md:text-[clamp(13px,1.2vw,16px)] tracking-wider px-6 md:px-10 py-2.5 md:py-3.5 border border-[#4A3E3D] rounded-full bg-transparent hover:bg-[#4A3E3D]/10 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Detailed Info & Rundown
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

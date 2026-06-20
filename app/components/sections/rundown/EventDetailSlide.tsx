"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject, DbEvent } from "../../../../lib/resolveProject";
import FadeIn from "../../FadeIn";

interface Props {
  project?: DbProject | null;
  events?: DbEvent[] | null;
  formattedIndoDate: string;
  mapIframeSrc: string;
  mapLinkUrl: string;
  googleCalendarLink: string;
  slideRef: React.RefObject<HTMLDivElement | null>;
  nextSlideRef: React.RefObject<HTMLDivElement | null>;
}

export default function EventDetailSlide({
  project,
  events,
  formattedIndoDate,
  mapIframeSrc,
  mapLinkUrl,
  googleCalendarLink,
  slideRef,
  nextSlideRef,
}: Props) {
  const userId = project?.user_id || "a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf";
  const projectId = project?.id || "f93ad18d-cba2-4de0-a86b-b1fadf2783a2";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xnruifsptjsafctjwqdh.supabase.co";

  const pigeonsImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-pigeons.jpg`;
  const firstEvent = events?.[0] || null;
  const venueName =
    project?.venue_name ||
    firstEvent?.venue_name ||
    "Openaire Resto Bar Market Semarang";

  return (
    <div
      ref={slideRef}
      className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 flex flex-col justify-center items-center bg-neutral-950 px-4 sm:px-6 md:px-8 py-16"
    >
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src={pigeonsImgUrl}
          alt="Background Acara & Lokasi"
          fill
          className="object-cover brightness-[0.45] select-none"
          draggable={false}
          unoptimized
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-between h-full py-12 px-6 sm:px-8 text-center text-white min-h-[100dvh]">
        <div className="h-6"></div>{" "}
        {/* spacer to avoid overlapping with floating back button */}
        <FadeIn>
          <h2 className="font-parfumerie text-[#e2ddc7] text-[clamp(36px,7.5vw,52px)] md:text-[clamp(56px,5vw,78px)] drop-shadow-md leading-none mb-2">
            Detail Acara & Lokasi
          </h2>
        </FadeIn>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full max-w-4xl flex-grow overflow-y-auto no-scrollbar py-4">
          {/* Left Column: Map with lace border */}
          <FadeIn
            delay={0.2}
            className="relative w-[70vw] h-[70vw] max-w-[240px] max-h-[240px] xs:max-w-[270px] xs:max-h-[270px] sm:max-w-[300px] sm:max-h-[300px] md:max-w-[350px] md:max-h-[350px] flex items-center justify-center drop-shadow-2xl"
          >
            <Image
              src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/lace-frame.png`}
              alt="Lace Frame"
              fill
              className="object-contain pointer-events-none select-none z-10"
              unoptimized
            />
            <div
              style={{ top: "17%", left: "17%", width: "66%", height: "66%" }}
              className="absolute overflow-hidden rounded-[8px] sm:rounded-[12px] md:rounded-[16px] z-30"
            >
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapIframeSrc}
              ></iframe>
            </div>
          </FadeIn>

          {/* Right Column: Text & Buttons */}
          <FadeIn
            delay={0.4}
            className="flex flex-col items-center justify-center text-center gap-4 max-w-md"
          >
            <div className="flex flex-col items-center gap-2">
              <p className="font-seasons text-white/95 text-[clamp(14px,3vw,18px)] md:text-[clamp(18px,1.5vw,22px)] leading-relaxed tracking-wider font-medium">
                {venueName}
              </p>
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2.5 px-8 rounded-full bg-[#EAE3D2] text-[#333333] hover:bg-[#D8C4A9] transition-all duration-300 font-seasons text-[11px] tracking-[0.15em] uppercase shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer mt-1"
              >
                Google Map
              </a>
            </div>

            <div className="w-12 h-[1px] bg-white/20 my-1"></div>

            <div className="flex flex-col items-center gap-2">
              <p className="font-seasons text-white/95 text-[clamp(14px,3vw,18px)] md:text-[clamp(18px,1.5vw,22px)] leading-relaxed tracking-wider font-medium">
                {formattedIndoDate}
              </p>
              <a
                href={googleCalendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2.5 px-8 rounded-full bg-[#EAE3D2] text-[#333333] hover:bg-[#D8C4A9] transition-all duration-300 font-seasons text-[11px] tracking-[0.15em] uppercase shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer mt-1"
              >
                Tambah ke Kalender
              </a>
            </div>
          </FadeIn>
        </div>
        {/* Footer controls to navigate to Rundown */}
        <div className="w-full flex flex-col items-center gap-4 z-30 mt-4">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 0.6, y: [0, 5, 0] }}
            transition={{
              delay: 0.8,
              y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
            }}
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => {
              nextSlideRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="text-[8px] font-sans tracking-[0.25em] text-white/40 uppercase">
              Scroll Down
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-white/40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </motion.div>

          <FadeIn delay={0.8}>
            <button
              onClick={() =>
                nextSlideRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-lekton text-white text-[clamp(10px,1.8vw,12px)] uppercase tracking-[0.25em] border-b border-white/60 pb-1 hover:text-white/80 hover:border-white/80 transition-all cursor-pointer"
            >
              Rundown &gt;&gt;
            </button>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

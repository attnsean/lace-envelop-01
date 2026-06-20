"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../../lib/resolveProject";
import FadeIn from "../../FadeIn";

interface Props {
  project?: DbProject | null;
  slideRef: React.RefObject<HTMLDivElement | null>;
  prevSlideRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export default function DiningScheduleSlide({
  project,
  slideRef,
  prevSlideRef,
  onClose,
}: Props) {
  const userId = project?.user_id || "a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf";
  const projectId = project?.id || "f93ad18d-cba2-4de0-a86b-b1fadf2783a2";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xnruifsptjsafctjwqdh.supabase.co";

  const diningItems = [
    { time: "15.00", title: "Canapés & Welcome Drinks" },
    { time: "15.20", title: "Starter Served" },
    { time: "15.45", title: "Main Course Served" },
    { time: "16.15", title: "Dessert" },
  ];

  return (
    <div
      ref={slideRef}
      className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 flex flex-col justify-start bg-[#363D22] px-4 sm:px-6 md:px-8 pt-24 pb-16 lg:py-16"
    >
      {/* Back to Rundown */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.6, y: [0, -5, 0] }}
        transition={{
          delay: 1.1,
          y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        }}
        className="w-full flex flex-col items-center gap-1 cursor-pointer z-30 mb-8"
        onClick={() => {
          prevSlideRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4 text-[#e2ddc7]/40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
        <span className="text-[8px] font-sans tracking-[0.25em] text-[#e2ddc7]/40 uppercase">
          Back to Rundown
        </span>
      </motion.div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center max-w-5xl w-full mx-auto gap-4 sm:gap-6 md:gap-16 px-4 md:px-8 lg:py-0">
        {/* Left Column: Title & Schedule */}
        <div className="flex flex-col items-start w-full md:w-[50%] select-none">
          {/* Title */}
          <FadeIn delay={0.2} className="text-left mb-4 sm:mb-8 md:mb-10">
            <h2 className="font-seasons text-[#e2ddc7] text-[clamp(32px,6.5vw,56px)] font-normal uppercase tracking-[0.1em] leading-[1.1]">
              DINING
              <br />
              SCHEDULE
            </h2>
          </FadeIn>

          {/* Dining Schedule List */}
          <div className="flex flex-col w-full text-[#e2ddc7]/95 text-left border-t border-[#e2ddc7]/20 pt-1">
            {diningItems.map((item, idx) => (
              <FadeIn
                key={idx}
                delay={0.3 + idx * 0.1}
                className="flex justify-between items-center py-2.5 sm:py-4.5 border-b border-[#e2ddc7]/20"
              >
                <span className="font-seasons text-[clamp(12px,2vw,16px)] sm:text-base font-bold tracking-widest text-[#e2ddc7] w-[20%]">
                  {item.time}
                </span>
                <span className="font-seasons text-[clamp(11px,1.8vw,15px)] sm:text-md tracking-wider text-[#e2ddc7]/90 w-[80%] text-left pl-4 sm:pl-8">
                  {item.title}
                </span>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Right Column: Portrait Couple Photo */}
        <div className="w-full md:w-[50%] flex items-center justify-center select-none overflow-hidden max-h-[35dvh] md:max-h-none">
          <FadeIn
            delay={0.4}
            className="relative w-[75vw] sm:w-[60vw] md:w-full max-w-[420px] aspect-[3/4] overflow-hidden rounded-2xl md:rounded-[2.5rem]"
          >
            <Image
              src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/dining-schedule-photo.jpg`}
              alt="Couple dining preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 75vw, 45vw"
              unoptimized
            />
          </FadeIn>
        </div>
      </div>

      {/* Home Page control */}
      <FadeIn delay={1.1} className="w-full flex justify-center mt-12 z-40">
        <button
          onClick={onClose}
          className="font-lekton text-[#e2ddc7] text-[clamp(10px,1.8vw,12px)] uppercase tracking-[0.25em] border-b border-[#e2ddc7]/60 pb-1 hover:text-[#e2ddc7]/80 hover:border-[#e2ddc7]/80 transition-all cursor-pointer"
        >
          Home Page &gt;&gt;
        </button>
      </FadeIn>
    </div>
  );
}

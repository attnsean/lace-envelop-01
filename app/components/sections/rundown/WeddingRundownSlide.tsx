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
  nextSlideRef: React.RefObject<HTMLDivElement | null>;
}

export default function WeddingRundownSlide({
  project,
  slideRef,
  prevSlideRef,
  nextSlideRef,
}: Props) {
  const userId = project?.user_id || "a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf";
  const projectId = project?.id || "f93ad18d-cba2-4de0-a86b-b1fadf2783a2";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xnruifsptjsafctjwqdh.supabase.co";

  const rundownItems = [
    {
      time: "14.00",
      title: "Akad Ceremony",
      icon: "rundown-rings.png",
    },
    {
      time: "15.00",
      title: "Reception Opens",
      icon: "rundown-table.png",
    },
    {
      time: "15.10",
      title: "Our Story Screening",
      icon: "rundown-doves.png",
    },
    {
      time: "15.55",
      title: "Toast Session",
      icon: "rundown-toast.png",
    },
    {
      time: "16.10",
      title: "Photo Session",
      icon: "rundown-camera.png",
    },
    {
      time: "17.00",
      title: "Couple Send-Off",
      icon: "rundown-hands.png",
    },
  ];

  return (
    <div
      ref={slideRef}
      className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 flex flex-col justify-start bg-[#e2ddc7] px-4 sm:px-6 md:px-8 pt-24 pb-16 lg:py-16"
    >
      {/* Back to Location Summary */}
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
          className="w-4 h-4 text-[#4a3525]/40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
        <span className="text-[8px] font-sans tracking-[0.25em] text-[#4a3525]/40 uppercase">
          Back to Location
        </span>
      </motion.div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl w-full mx-auto text-center text-[#4a3525] select-none lg:py-0">
        {/* Title */}
        <FadeIn delay={0.2}>
          <h2 className="font-altesse text-[#4a3525] text-[clamp(36px,8.5vw,64px)] font-light tracking-wide leading-none mb-4 xs:mb-6 sm:mb-12 md:mb-16 drop-shadow-sm">
            Wedding Rundown
          </h2>
        </FadeIn>

        {/* Rundown Grid */}
        <div className="grid grid-cols-3 gap-x-2 xs:gap-x-4 sm:gap-x-10 md:gap-x-16 gap-y-4 xs:gap-y-6 sm:gap-y-12 md:gap-y-14 w-full max-w-4xl px-2 sm:px-6">
          {rundownItems.map((item, idx) => {
            const imgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/${item.icon}?v=5`;
            return (
              <FadeIn
                key={idx}
                delay={0.3 + idx * 0.1}
                className="flex flex-col items-center text-center gap-2 sm:gap-3 group"
              >
                {/* Icon Container */}
                <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center mix-blend-multiply transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={imgUrl}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 64px, (max-width: 1024px) 96px, 112px"
                    unoptimized
                  />
                </div>

                {/* Time */}
                <p className="font-seasons text-[#4a3525] text-[clamp(11px,2.2vw,16px)] sm:text-base md:text-lg font-bold tracking-widest leading-none mt-1 sm:mt-2">
                  {item.time}
                </p>

                {/* Activity Title */}
                <p className="font-lekton italic text-[#4a3525]/90 text-[clamp(9px,1.8vw,13px)] sm:text-[11px] md:text-xs lg:text-sm tracking-wide leading-tight px-1">
                  {item.title}
                </p>
              </FadeIn>
            );
          })}
        </div>

        {/* Footer controls to navigate to Dining */}
        <div className="w-full flex flex-col items-center gap-6 mt-12 z-30">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 0.6, y: [0, 5, 0] }}
            transition={{
              delay: 1.1,
              y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
            }}
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => {
              nextSlideRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="text-[8px] font-sans tracking-[0.25em] text-[#4a3525]/40 uppercase">
              Scroll Down
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-[#4a3525]/40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </motion.div>

          <FadeIn delay={1.1}>
            <button
              onClick={() =>
                nextSlideRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-lekton text-[#4a3525] text-[clamp(10px,1.8vw,12px)] uppercase tracking-[0.25em] border-b border-[#4a3525]/60 pb-1 hover:text-[#4a3525]/80 hover:border-[#4a3525]/80 transition-all cursor-pointer"
            >
              Dining &gt;&gt;
            </button>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../../lib/resolveProject";
import FadeIn from "../../FadeIn";

interface Props {
  project?: DbProject | null;
  slideRef: React.RefObject<HTMLDivElement | null>;
  meetCoupleRef: React.RefObject<HTMLDivElement | null>;
  loveStorySectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function BrideGroomSlide({
  project,
  slideRef,
  meetCoupleRef,
  loveStorySectionRef,
}: Props) {
  const userId = project?.user_id || "a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf";
  const projectId = project?.id || "f93ad18d-cba2-4de0-a86b-b1fadf2783a2";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xnruifsptjsafctjwqdh.supabase.co";

  return (
    <div
      ref={slideRef}
      className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 flex flex-col justify-start bg-[#e2ddc7] px-4 sm:px-8 pt-24 pb-16 lg:py-16"
    >
      {/* Back to Video */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.6, y: [0, -5, 0] }}
        transition={{
          opacity: { delay: 1.0 },
          y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        }}
        className="w-full flex flex-col items-center gap-1 cursor-pointer z-30 mb-8"
        onClick={() => {
          meetCoupleRef.current?.scrollIntoView({ behavior: "smooth" });
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
          Back to Video
        </span>
      </motion.div>

      <div className="flex flex-col justify-center items-center gap-6 lg:gap-12 xl:gap-16 max-w-6xl w-full mx-auto text-[#4a3525] select-none lg:py-0">
        {/* Bride Row */}
        <FadeIn
          delay={0.2}
          className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-4 lg:gap-10 xl:gap-14 w-full h-auto"
        >
          <div className="relative w-[65vw] h-[65vw] max-w-[270px] max-h-[270px] xs:w-[70vw] xs:h-[70vw] sm:w-[360px] sm:h-[360px] lg:w-[28vw] lg:h-[28vw] lg:max-w-[340px] lg:max-h-[340px] xl:w-[22vw] xl:h-[22vw] xl:max-w-[360px] xl:max-h-[360px] flex-shrink-0">
            <Image
              src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/lace-frame.png?v=2`}
              alt="Lace frame"
              fill
              className="object-contain filter drop-shadow-[0_8px_16px_rgba(74,53,37,0.18)]"
              unoptimized
            />
            <div
              style={{ top: "17%", left: "17%", width: "66%", height: "66%" }}
              className="absolute overflow-hidden rounded-[8px] sm:rounded-[12px] md:rounded-[16px]"
            >
              <Image
                src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/bride-photo.jpg?v=2`}
                alt="Jovita Lola Edria"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xs sm:max-w-md lg:max-w-lg">
            <span className="font-altesse text-[#4a3525] text-[clamp(28px,6vw,44px)] font-light leading-none mb-1 md:mb-2">
              The Bride
            </span>
            <span className="font-seasons text-[#4a3525] text-[clamp(16px,4vw,26px)] font-bold tracking-wide leading-tight mb-2 sm:mb-3">
              Jovita Lola Edria
            </span>
            <p className="font-lekton text-[#4a3525]/80 text-[clamp(9px,2.2vw,12px)] leading-relaxed tracking-wide sm:tracking-wider">
              The daughter of Mr. Joko Sulistyo U.
              <br />& Mrs. Evi Rita Sari
            </p>
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="h-[1px] w-1/3 bg-[#4a3525]/10 mx-auto lg:hidden"></div>

        {/* Groom Row */}
        <FadeIn
          delay={0.4}
          className="flex flex-col lg:flex-row-reverse items-center lg:items-center justify-center gap-4 lg:gap-10 xl:gap-14 w-full h-auto"
        >
          <div className="relative w-[65vw] h-[65vw] max-w-[270px] max-h-[270px] xs:w-[70vw] xs:h-[70vw] sm:w-[360px] sm:h-[360px] lg:w-[28vw] lg:h-[28vw] lg:max-w-[340px] lg:max-h-[340px] xl:w-[22vw] xl:h-[22vw] xl:max-w-[360px] xl:max-h-[360px] flex-shrink-0">
            <Image
              src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/lace-frame.png?v=2`}
              alt="Lace frame"
              fill
              className="object-contain filter drop-shadow-[0_8px_16px_rgba(74,53,37,0.18)]"
              unoptimized
            />
            <div
              style={{ top: "17%", left: "17%", width: "66%", height: "66%" }}
              className="absolute overflow-hidden rounded-[8px] sm:rounded-[12px] md:rounded-[16px]"
            >
              <Image
                src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/groom-photo.jpg?v=2`}
                alt="Muhammad Luqman Fikri"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end text-center lg:text-right max-w-xs sm:max-w-md lg:max-w-lg">
            <span className="font-altesse text-[#4a3525] text-[clamp(28px,6vw,44px)] font-light leading-none mb-1 md:mb-2">
              The Groom
            </span>
            <span className="font-seasons text-[#4a3525] text-[clamp(16px,4vw,26px)] font-bold tracking-wide leading-tight mb-2 sm:mb-3">
              Muhammad Luqman Fikri
            </span>
            <p className="font-lekton text-[#4a3525]/80 text-[clamp(9px,2.2vw,12px)] leading-relaxed tracking-wide sm:tracking-wider">
              The son of the late Mr. Mudin
              <br />& Mrs. Marlia Masdiarti
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Scroll down */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 0.6, y: [0, 5, 0] }}
        transition={{
          opacity: { delay: 1.0 },
          y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        }}
        className="w-full flex flex-col items-center gap-1 cursor-pointer z-30 mt-12"
        onClick={() => {
          loveStorySectionRef.current?.scrollIntoView({ behavior: "smooth" });
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
    </div>
  );
}

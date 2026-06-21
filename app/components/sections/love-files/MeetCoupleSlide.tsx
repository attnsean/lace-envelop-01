"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../../lib/resolveProject";
import FadeIn from "../../FadeIn";

interface Props {
  project?: DbProject | null;
  danceImgUrl: string;
  pigeonsImgUrl: string;
  flowersImgUrl: string;
  runImgUrl: string;
  brideGroomSectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function MeetCoupleSlide({
  project,
  danceImgUrl,
  pigeonsImgUrl,
  flowersImgUrl,
  runImgUrl,
  brideGroomSectionRef,
}: Props) {
  return (
    <div className="relative w-full h-[100dvh] snap-start shrink-0 flex items-center justify-center overflow-hidden">
      {/* Top-Left */}
      <FadeIn
        delay={0.1}
        className="absolute top-[12%] left-[6%] sm:top-[12%] sm:left-[8%] w-[26vw] sm:w-[29vw] md:w-[15vw] lg:w-[16vw] xl:w-[17vw] max-w-[140px] sm:max-w-[320px] md:max-w-[190px] lg:max-w-[225px] xl:max-w-[250px] aspect-[4/3] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={danceImgUrl}
          alt="Couple walking"
          fill
          sizes="(max-width: 768px) 250px, (max-width: 1024px) 205px, 280px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Top-Right */}
      <FadeIn
        delay={0.3}
        className="absolute top-[12%] right-[6%] sm:top-[16%] sm:right-[8%] w-[24vw] sm:w-[26vw] md:w-[14vw] lg:w-[15vw] xl:w-[15vw] max-w-[130px] sm:max-w-[290px] md:max-w-[165px] lg:max-w-[205px] xl:max-w-[240px] aspect-[3/4] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={pigeonsImgUrl}
          alt="Fountain"
          fill
          sizes="(max-width: 768px) 230px, (max-width: 1024px) 205px, 250px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Bottom-Left */}
      <FadeIn
        delay={0.5}
        className="absolute bottom-[12%] left-[6%] sm:bottom-[16%] sm:left-[12%] w-[22vw] sm:w-[24vw] md:w-[12vw] lg:w-[14vw] xl:w-[15vw] max-w-[120px] sm:max-w-[265px] md:max-w-[150px] lg:max-w-[195px] xl:max-w-[225px] aspect-[3/4] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={flowersImgUrl}
          alt="Tree leaves"
          fill
          sizes="(max-width: 768px) 195px, (max-width: 1024px) 195px, 240px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Bottom-Right */}
      <FadeIn
        delay={0.7}
        className="absolute bottom-[12%] right-[6%] sm:bottom-[12%] sm:right-[12%] w-[26vw] sm:w-[29vw] md:w-[15vw] lg:w-[16vw] xl:w-[17vw] max-w-[140px] sm:max-w-[320px] md:max-w-[190px] lg:max-w-[225px] xl:max-w-[250px] aspect-[4/3] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={runImgUrl}
          alt="Hand with ring"
          fill
          sizes="(max-width: 768px) 250px, (max-width: 1024px) 225px, 280px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Center Text */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto h-full select-none">
        <FadeIn delay={0.4}>
          <h2 className="font-altesse text-white text-[clamp(44px,9vw,76px)] md:text-[clamp(56px,5.5vw,90px)] font-light tracking-wide leading-none whitespace-nowrap drop-shadow-md">
            Meet The Couple
          </h2>
        </FadeIn>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.7, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1.5, duration: 1 },
            y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
          }}
          className="absolute bottom-8 flex flex-col items-center gap-1 cursor-pointer z-20"
          onClick={() => {
            brideGroomSectionRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-[9px] font-sans tracking-[0.25em] text-white/40 uppercase">
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
      </div>
    </div>
  );
}

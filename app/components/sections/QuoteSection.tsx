"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  setShowLoveFiles: (val: boolean) => void;
}

export default function QuoteSection({ project, setShowLoveFiles }: Props) {
  const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';

  const danceImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-dance.jpg`;
  const pigeonsImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-pigeons.jpg`;
  const flowersImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/gallery-24.jpg`;
  const runImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-run.jpg`;

  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-[#e2ddc7]">
      {/* Top-Left: Dance */}
      <FadeIn 
        delay={0.1} 
        className="absolute top-[12%] left-[6%] sm:top-[12%] sm:left-[8%] w-[26vw] sm:w-[29vw] md:w-[15vw] lg:w-[16vw] xl:w-[17vw] max-w-[140px] sm:max-w-[320px] md:max-w-[190px] lg:max-w-[225px] xl:max-w-[250px] aspect-[3/4] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={danceImgUrl}
          alt="Dancing"
          fill
          sizes="(max-width: 768px) 250px, (max-width: 1024px) 225px, 280px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Top-Right: Pigeons */}
      <FadeIn 
        delay={0.3} 
        className="absolute top-[12%] right-[6%] sm:top-[16%] sm:right-[8%] w-[24vw] sm:w-[26vw] md:w-[14vw] lg:w-[15vw] xl:w-[15vw] max-w-[130px] sm:max-w-[290px] md:max-w-[165px] lg:max-w-[205px] xl:max-w-[240px] aspect-square shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={pigeonsImgUrl}
          alt="Pigeons"
          fill
          sizes="(max-width: 768px) 230px, (max-width: 1024px) 205px, 250px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Bottom-Left: Flowers */}
      <FadeIn 
        delay={0.5} 
        className="absolute bottom-[12%] left-[6%] sm:bottom-[16%] sm:left-[12%] w-[22vw] sm:w-[24vw] md:w-[12vw] lg:w-[14vw] xl:w-[15vw] max-w-[120px] sm:max-w-[265px] md:max-w-[150px] lg:max-w-[195px] xl:max-w-[225px] aspect-[4/5] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={flowersImgUrl}
          alt="Flowers"
          fill
          sizes="(max-width: 768px) 195px, (max-width: 1024px) 195px, 240px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Bottom-Right: Run */}
      <FadeIn 
        delay={0.7} 
        className="absolute bottom-[12%] right-[6%] sm:bottom-[12%] sm:right-[12%] w-[26vw] sm:w-[29vw] md:w-[15vw] lg:w-[16vw] xl:w-[17vw] max-w-[140px] sm:max-w-[320px] md:max-w-[190px] lg:max-w-[225px] xl:max-w-[250px] aspect-[3/4] shadow-2xl border-[2px] sm:border-[6px] border-white/95 rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
      >
        <Image
          src={runImgUrl}
          alt="Running"
          fill
          sizes="(max-width: 768px) 250px, (max-width: 1024px) 225px, 280px"
          className="object-cover pointer-events-none w-full h-full"
          unoptimized
        />
      </FadeIn>

      {/* Centered Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto h-full select-none space-y-3 sm:space-y-4">
        <FadeIn delay={0.4}>
          <p className="font-seasons text-[#4a3525] text-[clamp(16px,4.5vw,36px)] font-medium leading-relaxed tracking-wide">
            Our next chapter starts{" "}
            <span className="font-altesse text-[clamp(28px,7vw,58px)] italic font-light text-[#4a3525] inline-block ml-1">
              here,
            </span>
          </p>
        </FadeIn>
        
        <FadeIn delay={0.7}>
          <p className="font-seasons text-[#4a3525] text-[clamp(16px,4.5vw,36px)] font-medium leading-relaxed tracking-wide">
            And it starts with{" "}
            <span className="font-altesse text-[clamp(28px,7vw,58px)] italic font-light text-[#4a3525] inline-block ml-1">
              love.
            </span>
          </p>
        </FadeIn>

        <FadeIn delay={1.0} className="pt-8 sm:pt-10">
          <motion.button
            onClick={() => setShowLoveFiles(true)}
            whileHover={{ scale: 1.06 }}
            animate={{ 
              y: [0, -5, 0],
              textShadow: [
                "0px 0px 0px rgba(74,53,37,0)",
                "0px 0px 4px rgba(74,53,37,0.2)",
                "0px 0px 0px rgba(74,53,37,0)"
              ]
            }}
            transition={{ 
              y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              textShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.2 }
            }}
            className="font-lekton text-[#4a3525] text-[clamp(11px,2vw,15px)] uppercase tracking-[0.25em] border-b border-[#4a3525]/60 pb-1.5 hover:text-[#4a3525]/80 hover:border-[#4a3525]/80 transition-all cursor-pointer flex items-center gap-2 group"
          >
            <span>Open the Love Files</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              &gt;&gt;
            </motion.span>
          </motion.button>
        </FadeIn>
      </div>
    </section>
  );
}

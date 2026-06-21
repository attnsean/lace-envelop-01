"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../lib/resolveProject";

interface Props {
  project?: DbProject | null;
}

export default function VerseSection({ project }: Props) {
  const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
  const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';

  const bgImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec3-bg.jpg`;
  const frameImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec3-frame.png`;
  const coupleImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec3-couple.jpg`;

  const quoteArabic = project?.quote_arabic !== undefined && project?.quote_arabic !== null
    ? project.quote_arabic
    : "وَخَلَقْنَاكُمْ أَزْوَاجًا";
  const quoteTranslation = project?.quote_translation !== undefined && project?.quote_translation !== null
    ? project.quote_translation
    : "“And We created you in pairs.”";
  const quoteSource = project?.quote_source !== undefined && project?.quote_source !== null
    ? project.quote_source
    : "— Surah An-Naba (78:8)";

  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-neutral-950 flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src={bgImgUrl}
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover opacity-100 select-none"
          draggable={false}
          unoptimized
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto h-full select-none gap-6 sm:gap-8">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[95vw] sm:w-[90vw] max-w-[540px] sm:max-w-[660px] aspect-[1.7] flex items-center justify-center filter drop-shadow-2xl"
            >
              {/* Platter Frame */}
              <div className="absolute w-[55%] h-[158%] z-10 rotate-90">
                <Image
                  src={frameImgUrl}
                  alt="Silver Platter"
                  fill
                  sizes="(max-width: 640px) 540px, 660px"
                  className="object-fill"
                  unoptimized
                />
              </div>

              {/* Couple Photo */}
              <div className="absolute w-[70%] h-[74%] z-20 overflow-hidden" style={{ clipPath: 'ellipse(48% 48% at 50% 50%)' }}>
                <Image
                  src={coupleImgUrl}
                  alt="Couple under Veil"
                  fill
                  sizes="(max-width: 640px) 380px, 460px"
                  className="object-cover scale-110"
                  unoptimized
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          {quoteArabic && (
            <motion.div 
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
            >
              <h3 
                className="text-white text-[clamp(28px,7.5vw,46px)] leading-relaxed text-center font-normal"
                style={{ 
                  fontFamily: '"Traditional Arabic", "Amiri", "Scheherazade New", serif', 
                  direction: 'rtl'
                }}
              >
                {quoteArabic}
              </h3>
            </motion.div>
          )}

          {quoteTranslation && (
            <motion.div 
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.7 }}
            >
              <p 
                className="font-altesse text-white text-[clamp(22px,5vw,36px)] italic font-light tracking-wide text-center leading-normal"
                style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.95), 0 0 18px rgba(255, 255, 255, 0.85), 0 0 32px rgba(255, 255, 255, 0.75), 0 0 48px rgba(255, 255, 255, 0.6), 1px 1px 3px rgba(0, 0, 0, 0.95)' }}
              >
                {quoteTranslation}
              </p>
            </motion.div>
          )}

          {quoteSource && (
            <motion.div 
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 1.0 }}
              className="w-full text-right"
            >
              <p className="font-seasons text-white/90 text-[clamp(10px,1.8vw,13px)] uppercase tracking-[0.25em] pt-2">
                {quoteSource}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

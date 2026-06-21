"use client";

import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DbProject } from "../../../../lib/resolveProject";
import MeetCoupleSlide from "./MeetCoupleSlide";
import BrideGroomSlide from "./BrideGroomSlide";
import StoryTimelineSlide from "./StoryTimelineSlide";
import GallerySlidersSlide from "./GallerySlidersSlide";

interface Props {
  project?: DbProject | null;
  showLoveFiles: boolean;
  onClose: () => void;
  galleryImages: string[];
  openLightbox: (idx: number) => void;
}

export default function LoveFilesOverlay({
  project,
  showLoveFiles,
  onClose,
  galleryImages,
  openLightbox,
}: Props) {
  const meetCoupleRef = useRef<HTMLDivElement>(null);
  const brideGroomSectionRef = useRef<HTMLDivElement>(null);
  const loveStorySectionRef = useRef<HTMLDivElement>(null);
  const gallerySectionRef = useRef<HTMLDivElement>(null);

  const userId = project?.user_id || "a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf";
  const projectId = project?.id || "6d889fed-efb5-4a32-97ce-16f74bce763c";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xnruifsptjsafctjwqdh.supabase.co";

  const danceImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-dance.jpg`;
  const pigeonsImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-pigeons.jpg`;
  const flowersImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/gallery-24.jpg`;
  const runImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-run.jpg`;

  return (
    <AnimatePresence>
      {showLoveFiles && (
        <motion.div
          key="love-files-view"
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed inset-0 z-[120] w-full h-[100dvh] overflow-hidden bg-[#363D22] flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
        >
          <div className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory flex flex-col scrollbar-hide bg-[#363D22] relative">
            {/* Floating Back Button */}
            <button
              onClick={onClose}
              className="fixed top-6 left-6 z-[140] flex items-center gap-2 text-white/80 hover:text-white bg-black/35 hover:bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </button>

            {/* SLIDE 1: Meet The Couple */}
            <div ref={meetCoupleRef}>
              <MeetCoupleSlide
                project={project}
                danceImgUrl={danceImgUrl}
                pigeonsImgUrl={pigeonsImgUrl}
                flowersImgUrl={flowersImgUrl}
                runImgUrl={runImgUrl}
                brideGroomSectionRef={brideGroomSectionRef}
              />
            </div>

            {/* SLIDE 2: Bride & Groom Cards */}
            <BrideGroomSlide
              project={project}
              slideRef={brideGroomSectionRef}
              meetCoupleRef={meetCoupleRef}
              loveStorySectionRef={loveStorySectionRef}
            />

            {/* SLIDE 3: Love Story */}
            <StoryTimelineSlide
              project={project}
              slideRef={loveStorySectionRef}
              brideGroomSectionRef={brideGroomSectionRef}
              gallerySectionRef={gallerySectionRef}
            />

            {/* SLIDE 4: Our The Couple’s Gallery */}
            <GallerySlidersSlide
              project={project}
              galleryImages={galleryImages}
              openLightbox={openLightbox}
              slideRef={gallerySectionRef}
              loveStorySectionRef={loveStorySectionRef}
              onClose={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../../lib/resolveProject";
import FadeIn from "../../FadeIn";

interface Props {
  project?: DbProject | null;
  slideRef: React.RefObject<HTMLDivElement | null>;
  brideGroomSectionRef: React.RefObject<HTMLDivElement | null>;
  gallerySectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function StoryTimelineSlide({
  project,
  slideRef,
  brideGroomSectionRef,
  gallerySectionRef,
}: Props) {
  const userId = project?.user_id || "a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf";
  const projectId = project?.id || "f93ad18d-cba2-4de0-a86b-b1fadf2783a2";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xnruifsptjsafctjwqdh.supabase.co";

  const storyItems = project?.love_story_items as any[] | undefined;
  const firstStoryItem = storyItems?.[0];
  const rawLoveStory = firstStoryItem?.desc || firstStoryItem?.description || (project?.love_story && !project.love_story.trim().startsWith('{') ? project.love_story : '');

  return (
    <div
      ref={slideRef}
      className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 flex flex-col items-center justify-start bg-black px-6 sm:px-12 pt-24 pb-16 lg:py-16"
    >
      {/* Background image with warm/dark sepia overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
        <Image
          src={`${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/love-story-bg.jpg`}
          alt="Love Story Background"
          fill
          className="object-cover brightness-[0.55] select-none"
          draggable={false}
          priority
        />
        <div className="absolute inset-0 bg-[#5b3b1e]/45 mix-blend-multiply"></div>
      </div>

      {/* Back to Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2 }}
        className="w-full flex flex-col items-center gap-1 cursor-pointer z-30 mb-8"
        onClick={() => {
          brideGroomSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4 text-[#e2ddc7]/30"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
        <span className="text-[8px] font-sans tracking-[0.25em] text-[#e2ddc7]/30 uppercase">
          Back to Cards
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-3xl mx-auto text-center text-white/95 select-none lg:py-0">
        {/* Title */}
        <FadeIn delay={0.2}>
          <h2 className="font-altesse text-[#e2ddc7] text-[clamp(44px,9vw,64px)] font-light tracking-wide leading-none mb-4 lg:mb-8 drop-shadow-md">
            Love Story
          </h2>
        </FadeIn>

        {/* Paragraphs */}
        <div className="flex flex-col gap-3 lg:gap-5">
          {rawLoveStory ? (
            rawLoveStory.split("\n").filter((p: string) => p.trim() !== "").map((para: string, idx: number) => (
              <FadeIn key={idx} delay={0.4 + idx * 0.15}>
                <p className="font-seasons text-[#e2ddc7]/95 text-[clamp(11px,2.4vw,15px)] md:text-[clamp(13px,1.5vw,16px)] leading-relaxed md:leading-loose tracking-wider max-w-2xl mx-auto drop-shadow-sm">
                  {para}
                </p>
              </FadeIn>
            ))
          ) : (
            <>
              <FadeIn delay={0.4}>
                <p className="font-seasons text-[#e2ddc7]/95 text-[clamp(11px,2.4vw,15px)] md:text-[clamp(13px,1.5vw,16px)] leading-relaxed md:leading-loose tracking-wider max-w-2xl mx-auto drop-shadow-sm">
                  If someone had told us years ago that all the little moments would
                  lead us here, we probably wouldn’t have believed them.
                </p>
              </FadeIn>

              <FadeIn delay={0.6}>
                <p className="font-seasons text-[#e2ddc7]/95 text-[clamp(11px,2.4vw,15px)] md:text-[clamp(13px,1.5vw,16px)] leading-relaxed md:leading-loose tracking-wider max-w-2xl mx-auto drop-shadow-sm">
                  Back then, we were simply part of each other’s daily routines
                  &mdash; just coworkers sharing ordinary days at the office before
                  life eventually moved us onto different paths. When Luqman left to
                  study abroad, we never imagined our story would continue beyond
                  that chapter.
                </p>
              </FadeIn>

              <FadeIn delay={0.8}>
                <p className="font-seasons text-[#e2ddc7]/95 text-[clamp(11px,2.4vw,15px)] md:text-[clamp(13px,1.5vw,16px)] leading-relaxed md:leading-loose tracking-wider max-w-2xl mx-auto drop-shadow-sm">
                  But years later, two familiar people meeting again in a completely
                  different season of life. What started as simple conversations
                  slowly became the best part of our days. Somewhere along the way,
                  familiarity turned into comfort, comfort turned into love, and
                  being together began to feel like the most natural thing in the
                  world.
                </p>
              </FadeIn>

              <FadeIn delay={1.0}>
                <p className="font-seasons text-[#e2ddc7]/95 text-[clamp(11px,2.4vw,15px)] md:text-[clamp(13px,1.5vw,16px)] leading-relaxed md:leading-loose tracking-wider max-w-2xl mx-auto drop-shadow-sm">
                  Looking back now, it’s hard not to believe that some people are
                  simply meant to find their way back to one another.
                </p>
              </FadeIn>
            </>
          )}
        </div>

        {/* Scroll down to Gallery */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 0.6, y: [0, 5, 0] }}
          transition={{
            opacity: { delay: 1.0 },
            y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
          }}
          className="w-full flex flex-col items-center gap-1 cursor-pointer z-30 mt-12"
          onClick={() => {
            gallerySectionRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-[8px] font-sans tracking-[0.25em] text-[#e2ddc7]/40 uppercase">
            Scroll Down to Gallery
          </span>
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
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

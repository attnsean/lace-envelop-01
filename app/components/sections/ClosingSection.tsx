"use client";

import React, { useEffect, useRef } from "react";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  isOpen: boolean;
  onVideoPlay: () => void;
  onVideoPause: () => void;
}

export default function ClosingSection({ project, isOpen, onVideoPlay, onVideoPause }: Props) {
  const thankYouVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (thankYouVideoRef.current && !thankYouVideoRef.current.paused) {
        thankYouVideoRef.current.pause();
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = thankYouVideoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            video.play()
              .then(() => {
                onVideoPlay();
              })
              .catch((err) => {
                console.log("Closing thank you video autoplay blocked, attempting muted:", err);
                video.muted = true;
                video.play().catch((e) => console.error("Muted thank you video play failed:", e));
              });
          } else {
            if (!video.paused) {
              video.pause();
            }
            onVideoPause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const target = thankYouVideoRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isOpen, onVideoPlay, onVideoPause]);

  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col items-center justify-between bg-neutral-950 px-8 py-10 md:py-16 text-center border-t border-white/5">
      <div className="flex flex-col items-center justify-center flex-grow gap-4 md:gap-6 w-full max-w-2xl mx-auto">
        <FadeIn>
          <h2 className="text-2xl md:text-4xl font-serif text-[#979e6c] tracking-widest uppercase drop-shadow-[0_0_15px_rgba(151, 158, 108,0.3)]">Thank You</h2>
        </FadeIn>

        <FadeIn delay={0.2} className="max-w-md">
          <p className="text-[11px] md:text-sm font-sans font-light leading-relaxed text-gray-300">
            It is a joy to share this beautiful chapter of our lives with you. Your presence and blessings mean the world to us.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] md:text-xs tracking-[0.4em] text-white/50 uppercase font-bold">With Love</span>
            <p className="text-2xl md:text-3xl font-script text-white mt-1">
              {project?.groom_nickname || "Luqman"} & {project?.bride_nickname || "Jovita"}
            </p>
            <p className="font-seasons text-xs tracking-[0.3em] text-[#979e6c] font-semibold mt-2">
              #MANtracinTA
            </p>
          </div>
        </FadeIn>

        {/* Video Player */}
        <FadeIn delay={0.5} className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[480px] aspect-video relative rounded-xl overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <video
            ref={thankYouVideoRef}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            onPlay={onVideoPlay}
            onPause={onVideoPause}
            onEnded={onVideoPause}
          >
            <source
              src="/video-teaser.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </FadeIn>
      </div>

      <FadeIn delay={0.6} className="w-full flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity duration-500 mt-6">
        <div className="h-[1px] w-12 bg-white/30 mb-3"></div>
        <p className="text-[8px] md:text-[9px] font-sans tracking-[0.3em] text-white uppercase font-bold">
          Designed & Crafted by
        </p>
        <p className="text-[10px] md:text-xs font-serif tracking-widest text-[#979e6c] mt-1 font-bold">
          SERA STORY
        </p>
        <p className="text-[7px] md:text-[8px] font-sans tracking-[0.2em] text-white/50 mt-0.5 uppercase">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </FadeIn>
    </section>
  );
}

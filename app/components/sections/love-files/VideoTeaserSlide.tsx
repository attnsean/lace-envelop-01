"use client";

import React, { useEffect, useRef } from "react";
import FadeIn from "../../FadeIn";

interface Props {
  showLoveFiles: boolean;
  onVideoPlay: () => void;
  onVideoPause: () => void;
  videoSectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function VideoTeaserSlide({ showLoveFiles, onVideoPlay, onVideoPause, videoSectionRef }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer for autoplay
  useEffect(() => {
    if (!showLoveFiles) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            video.play()
              .then(() => {
                onVideoPlay();
              })
              .catch((err) => {
                console.log("Teaser video autoplay blocked, attempting muted:", err);
                video.muted = true;
                video.play().catch((e) => console.error("Muted teaser play failed:", e));
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

    const target = videoSectionRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [showLoveFiles, onVideoPlay, onVideoPause, videoSectionRef]);

  // Pause when overlay is closed
  useEffect(() => {
    if (!showLoveFiles && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      onVideoPause();
    }
  }, [showLoveFiles, onVideoPause]);

  return (
    <div
      ref={videoSectionRef}
      className="relative w-full h-[100dvh] snap-start shrink-0 flex flex-col items-center justify-center bg-black overflow-hidden px-4 sm:px-6"
    >
      {/* Background blurry glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-[#363D22]/30 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center gap-6">
        <FadeIn delay={0.2} className="text-center">
          <span className="text-[10px] font-bold tracking-[0.35em] text-[#979e6c] uppercase block mb-1">Teaser Video</span>
          <h3 className="font-seasons text-white text-[clamp(24px,5vw,36px)] font-normal uppercase tracking-wider mb-2">Our Love Story</h3>
          <div className="h-[1px] w-12 bg-white/20 mx-auto"></div>
        </FadeIn>

        <FadeIn delay={0.4} className="w-full relative rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] aspect-video">
          <video
            ref={videoRef}
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
    </div>
  );
}

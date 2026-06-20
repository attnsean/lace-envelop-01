"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FadeIn from "../../FadeIn";

interface Props {
  galleryImages: string[];
  openLightbox: (idx: number) => void;
  slideRef: React.RefObject<HTMLDivElement | null>;
  loveStorySectionRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export default function GallerySlidersSlide({
  galleryImages,
  openLightbox,
  slideRef,
  loveStorySectionRef,
  onClose,
}: Props) {
  const [leftGalleryIdx, setLeftGalleryIdx] = useState(0);
  const [rightGalleryIdx, setRightGalleryIdx] = useState(0);

  const leftImages = useMemo(() => {
    return galleryImages.length > 0
      ? galleryImages.slice(0, Math.min(7, galleryImages.length))
      : [];
  }, [galleryImages]);

  const rightImages = useMemo(() => {
    return galleryImages.length > 7
      ? galleryImages.slice(7, Math.min(12, galleryImages.length))
      : galleryImages.length > 1
      ? galleryImages.slice(1, Math.min(6, galleryImages.length))
      : [];
  }, [galleryImages]);

  return (
    <div
      ref={slideRef}
      className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 flex flex-col items-center justify-start bg-[#5E3D22] px-6 sm:px-12 pt-24 pb-16"
    >
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto text-center select-none w-full">
        {/* Back to Story Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2 }}
          className="w-full flex flex-col items-center gap-1 cursor-pointer z-30 mb-8"
          onClick={() => {
            loveStorySectionRef.current?.scrollIntoView({ behavior: "smooth" });
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
            Back to Story
          </span>
        </motion.div>

        {/* Title */}
        <FadeIn delay={0.2}>
          <h2 className="font-parfumerie text-[#e2ddc7] text-[clamp(44px,9vw,64px)] font-light tracking-wide leading-none mb-2 drop-shadow-md">
            Our Gallery
          </h2>
          <p className="font-seasons text-[#e2ddc7]/85 font-semibold text-[clamp(11px,2.2vw,14px)] tracking-[0.2em] mb-8">
            #MANtracinTA
          </p>
        </FadeIn>

        {/* Two Columns for Desktop / Stacked for Mobile */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full mt-4">
          {/* Left Card: 7 photos slider */}
          {leftImages.length > 0 && (
            <FadeIn delay={0.4} className="w-full max-w-[320px]">
              <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group bg-black/25">
                {/* Active Image */}
                <Image
                  src={leftImages[leftGalleryIdx]}
                  alt={`Gallery left ${leftGalleryIdx + 1}`}
                  fill
                  className="object-cover transition-all duration-700 select-none pointer-events-none"
                  unoptimized={typeof leftImages[leftGalleryIdx] === "string"}
                  sizes="320px"
                />

                {/* Dark Bottom Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/45 to-transparent pointer-events-none z-10" />

                {/* Controls */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col z-20">
                  {/* Story progress indicators */}
                  <div className="flex gap-1 w-full mb-3">
                    {leftImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-[2px] flex-1 rounded-full transition-all duration-300 ${
                          idx === leftGalleryIdx ? "bg-white" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-row justify-between items-center text-white">
                    {/* Left/Right Page controls */}
                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm text-[11px] font-sans">
                      <button
                        onClick={() =>
                          setLeftGalleryIdx((prev) =>
                            prev === 0 ? leftImages.length - 1 : prev - 1
                          )
                        }
                        className="hover:scale-125 transition-transform cursor-pointer p-0.5 active:scale-95"
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
                      </button>
                      <span className="min-w-[28px] text-center select-none font-medium">
                        {leftGalleryIdx + 1} / {leftImages.length}
                      </span>
                      <button
                        onClick={() =>
                          setLeftGalleryIdx((prev) =>
                            prev === leftImages.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="hover:scale-125 transition-transform cursor-pointer p-0.5 active:scale-95"
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
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Right side helper icons */}
                    <div className="flex items-center gap-3 text-white/80">
                      <button
                        onClick={() => {
                          const globalIdx = galleryImages.indexOf(
                            leftImages[leftGalleryIdx]
                          );
                          if (globalIdx !== -1) openLightbox(globalIdx);
                        }}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                          />
                        </svg>
                      </button>
                      <span className="opacity-50 select-none">• • •</span>
                      <button
                        onClick={() => {
                          const globalIdx = galleryImages.indexOf(
                            leftImages[leftGalleryIdx]
                          );
                          if (globalIdx !== -1) openLightbox(globalIdx);
                        }}
                        className="hover:text-white transition-colors cursor-pointer"
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
                            d="M3.75 3.75v6.5m0-6.5h6.5m-6.5 0L9 9M20.25 3.75v6.5m0-6.5h-6.5m6.5 0l-5.25 5.25m-11.25 11.25v-6.5m0 6.5h6.5m-6.5 0l5.25-5.25m11.25 11.25v-6.5m0 6.5h-6.5m6.5 0l-5.25-5.25"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Right Card: 5 photos slider */}
          {rightImages.length > 0 && (
            <FadeIn delay={0.6} className="w-full max-w-[320px]">
              <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group bg-black/25">
                {/* Active Image */}
                <Image
                  src={rightImages[rightGalleryIdx]}
                  alt={`Gallery right ${rightGalleryIdx + 1}`}
                  fill
                  className="object-cover transition-all duration-700 select-none pointer-events-none"
                  unoptimized={typeof rightImages[rightGalleryIdx] === "string"}
                  sizes="320px"
                />

                {/* Dark Bottom Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/45 to-transparent pointer-events-none z-10" />

                {/* Controls */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col z-20">
                  {/* Story progress indicators */}
                  <div className="flex gap-1 w-full mb-3">
                    {rightImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-[2px] flex-1 rounded-full transition-all duration-300 ${
                          idx === rightGalleryIdx ? "bg-white" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-row justify-between items-center text-white">
                    {/* Left/Right Page controls */}
                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm text-[11px] font-sans">
                      <button
                        onClick={() =>
                          setRightGalleryIdx((prev) =>
                            prev === 0 ? rightImages.length - 1 : prev - 1
                          )
                        }
                        className="hover:scale-125 transition-transform cursor-pointer p-0.5 active:scale-95"
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
                      </button>
                      <span className="min-w-[28px] text-center select-none font-medium">
                        {rightGalleryIdx + 1} / {rightImages.length}
                      </span>
                      <button
                        onClick={() =>
                          setRightGalleryIdx((prev) =>
                            prev === rightImages.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="hover:scale-125 transition-transform cursor-pointer p-0.5 active:scale-95"
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
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Right side helper icons */}
                    <div className="flex items-center gap-3 text-white/80">
                      <button
                        onClick={() => {
                          const globalIdx = galleryImages.indexOf(
                            rightImages[rightGalleryIdx]
                          );
                          if (globalIdx !== -1) openLightbox(globalIdx);
                        }}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                          />
                        </svg>
                      </button>
                      <span className="opacity-50 select-none">• • •</span>
                      <button
                        onClick={() => {
                          const globalIdx = galleryImages.indexOf(
                            rightImages[rightGalleryIdx]
                          );
                          if (globalIdx !== -1) openLightbox(globalIdx);
                        }}
                        className="hover:text-white transition-colors cursor-pointer"
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
                            d="M3.75 3.75v6.5m0-6.5h6.5m-6.5 0L9 9M20.25 3.75v6.5m0-6.5h-6.5m6.5 0l-5.25 5.25m-11.25 11.25v-6.5m0 6.5h6.5m-6.5 0l5.25-5.25m11.25 11.25v-6.5m0 6.5h-6.5m6.5 0l-5.25-5.25"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Footer Link: Halaman Utama */}
        <FadeIn delay={0.8} className="w-full flex flex-col items-center mt-12 z-30">
          <button
            onClick={onClose}
            className="font-lekton text-[#e2ddc7] text-[clamp(11px,1.8vw,14px)] uppercase tracking-[0.25em] border-b border-[#e2ddc7]/60 pb-1 hover:text-[#e2ddc7]/80 hover:border-[#e2ddc7]/80 transition-all cursor-pointer"
          >
            HALAMAN UTAMA &gt;&gt;
          </button>
        </FadeIn>
      </div>
    </div>
  );
}

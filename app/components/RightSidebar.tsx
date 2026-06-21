"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import CustomCursor from "./CustomCursor";
import { DbGuest, DbProject, DbEvent, DbWish } from "../../lib/resolveProject";

// Import sections
import CoverSection from "./sections/CoverSection";
import IntroSection from "./sections/IntroSection";
import QuoteSection from "./sections/QuoteSection";
import VerseSection from "./sections/VerseSection";
import RsvpSection from "./sections/RsvpSection";
import DetailsSection from "./sections/DetailsSection";
import FaqSection from "./sections/FaqSection";
import GiftRegistrySection from "./sections/GiftRegistrySection";

import ClosingSection from "./sections/ClosingSection";

// Import overlays
import LoveFilesOverlay from "./sections/love-files/LoveFilesOverlay";
import RundownOverlay from "./sections/rundown/RundownOverlay";



const fragments = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519225495810-7517c24a2ed3?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=400&auto=format&fit=crop",
];

interface Props {
  guestName: string;
  guest?: DbGuest | null;
  project?: DbProject | null;
  events?: DbEvent[] | null;
  wishes?: DbWish[] | null;
  stats?: {
    attending: number;
    wishes: number;
  };
}

export default function RightSidebar({
  guestName,
  guest,
  project,
  events,
  wishes,
  stats,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [[page, direction], setPage] = useState([0, 0]);
  const [showLoveFiles, setShowLoveFiles] = useState(false);
  const [showRundownOverlay, setShowRundownOverlay] = useState(false);



  const audioRef = useRef<HTMLAudioElement>(null);
  const bgMusicWasPlayingRef = useRef(false);

  const galleryImages =
    project?.gallery_photos &&
    Array.isArray(project.gallery_photos) &&
    project.gallery_photos.length > 0
      ? (project.gallery_photos as (
          | string
          | { url?: string; public_url?: string }
        )[])
          .map((p) => (typeof p === "string" ? p : p?.url || p?.public_url))
          .filter((url): url is string => typeof url === "string" && !!url)
      : project
      ? []
      : fragments;

  const formattedWeddingDate = React.useMemo(() => {
    if (project?.wedding_date) {
      const date = new Date(project.wedding_date);
      if (!isNaN(date.getTime())) {
        return date
          .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toUpperCase();
      }
    }
    return "AUGUST 8, 2026";
  }, [project?.wedding_date]);

  const formattedWeddingLocation = React.useMemo(() => {
    const venue = project?.venue_name || "";
    const knownCities = [
      "SEMARANG", "JAKARTA", "BANDUNG", "SURABAYA", "MEDAN", "BALI", 
      "YOGYAKARTA", "JOGJA", "MAKASSAR", "DENPASAR", "TANGERANG", 
      "BEKASI", "DEPOK", "BOGOR", "SOLO", "SURAKARTA"
    ];
    
    // Check address first for "Kota [Nama]" or "Kabupaten [Nama]" or known cities
    const address = (project?.venue_address || "").toUpperCase();
    for (const city of knownCities) {
      if (address.includes(city)) {
        return city;
      }
    }
    
    // Check venue name next for known cities
    const venueUpper = venue.toUpperCase();
    for (const city of knownCities) {
      if (venueUpper.includes(city)) {
        return city;
      }
    }
    
    // Fallback: take the last word of venue_name, clean it
    if (venue.trim()) {
      const parts = venue.trim().split(/\s+/);
      const lastWord = parts[parts.length - 1].toUpperCase().replace(/[.,()]/g, "");
      if (lastWord) return lastWord;
    }
    
    return "SEMARANG";
  }, [project?.venue_name, project?.venue_address]);

  const openLightbox = (idx: number) => {
    setPage([idx, 0]);
    setSelectedIndex(idx);
  };

  const paginate = (newDirection: number) => {
    if (selectedIndex === null) return;
    const nextIndex = selectedIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < galleryImages.length) {
      setPage([nextIndex, newDirection]);
      setSelectedIndex(nextIndex);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity;

  const handleOpen = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PAUSE_AUDIO") {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPlaying]);

  const handleVideoPlay = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      bgMusicWasPlayingRef.current = true;
      setIsPlaying(false);
    }
  };

  const handleVideoPause = () => {
    if (bgMusicWasPlayingRef.current && audioRef.current) {
      audioRef.current
        .play()
        .catch((e) => console.error("Error resuming audio:", e));
      bgMusicWasPlayingRef.current = false;
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] z-20 flex-shrink-0 overflow-hidden bg-neutral-950">
      <CustomCursor />

      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        src={project?.music_url || "/audio/bgm.mp3"}
      />

      {/* Premium Music Player UI */}
      <div
        className={`fixed bottom-6 right-6 z-[100] flex flex-row-reverse items-center gap-4 transition-all duration-1000 delay-500 ${
          isOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-10 pointer-events-none"
        }`}
      >
        <button
          onClick={toggleAudio}
          className="relative group w-14 h-14 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 overflow-hidden"
        >
          {/* Rotating Vinyl Effect */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-1 rounded-full border border-dashed border-white/30 ${
              !isPlaying && "opacity-50"
            }`}
          />

          {/* Inner Circle / Label */}
          <div className="absolute inset-4 rounded-full bg-[#979e6c]/20 border border-[#979e6c]/40 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex gap-0.5 items-end h-3">
                <motion.div
                  animate={{ height: [4, 12, 6] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="w-0.5 bg-[#979e6c]"
                />
                <motion.div
                  animate={{ height: [8, 4, 10] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="w-0.5 bg-[#979e6c]"
                />
                <motion.div
                  animate={{ height: [6, 10, 4] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="w-0.5 bg-[#979e6c]"
                />
              </div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-[#979e6c]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z"
                />
              </svg>
            )}
          </div>
        </button>

        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="hidden sm:flex flex-col items-end"
            >
              <p className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase">
                Now Playing
              </p>
              <p className="text-[10px] font-serif text-[#979e6c] tracking-widest whitespace-nowrap">
                Wedding Melody
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Content (Sections 2, 3, 4, 5, 6, 7) */}
      <div
        className={`h-full overflow-y-auto no-scrollbar pb-24 absolute inset-0 w-full h-full overflow-x-hidden snap-y snap-mandatory flex flex-col gap-20 md:gap-28 scrollbar-hide transition-opacity duration-1000 ease-in-out delay-300 z-10 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <IntroSection
          project={project}
          isOpen={isOpen}
          formattedWeddingDate={formattedWeddingDate}
          formattedWeddingLocation={formattedWeddingLocation}
        />

        <QuoteSection
          project={project}
          setShowLoveFiles={setShowLoveFiles}
        />

        <VerseSection project={project} />

        <RsvpSection
          project={project}
          guestName={guestName}
          guest={guest}
          wishes={wishes}
          galleryImages={galleryImages}
        />

        <DetailsSection
          project={project}
          events={events}
          setShowRundownOverlay={setShowRundownOverlay}
        />

        <FaqSection project={project} />

        <GiftRegistrySection project={project} />



        <ClosingSection
          project={project}
          isOpen={isOpen}
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
        />

        {/* Snap anchor for the bottom of the last tall section */}
        <div className="w-full h-[1px] shrink-0 snap-end"></div>
      </div>

      {/* SECTION 1: Cover (Envelope Reveal) */}
      <CoverSection
        project={project}
        guestName={guestName}
        isOpen={isOpen}
        handleOpen={handleOpen}
      />



      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            key="lightbox-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
          >
            {/* Top Bar with Close Button */}
            <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center z-50">
              <div className="text-white/50 text-xs tracking-widest font-sans bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                {selectedIndex + 1} / {galleryImages.length}
              </div>
              <button
                className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 transition-all duration-300"
                onClick={() => setSelectedIndex(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Main Image Slider */}
            <div className="relative w-full h-[65vh] md:h-[70vh] flex items-center justify-center overflow-hidden safe-area-x mt-10 md:mt-0">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute w-full h-full max-w-5xl px-4 flex justify-center items-center cursor-grab active:cursor-grabbing"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={galleryImages[selectedIndex]}
                      alt={`Fragment ${selectedIndex + 1}`}
                      fill
                      unoptimized={
                        typeof galleryImages[selectedIndex] === "string"
                      }
                      className="object-contain"
                      sizes="100vw"
                      quality={100}
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Nav Buttons (Desktop) */}
              <div className="hidden md:flex absolute inset-y-0 w-full max-w-7xl justify-between items-center px-4 pointer-events-none z-10">
                <button
                  className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 ${
                    selectedIndex === 0
                      ? "opacity-0 pointer-events-none cursor-default"
                      : "opacity-100"
                  }`}
                  onClick={() => paginate(-1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 ${
                    selectedIndex === galleryImages.length - 1
                      ? "opacity-0 pointer-events-none cursor-default"
                      : "opacity-100"
                  }`}
                  onClick={() => paginate(1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Thumbnails row below */}
            <div className="w-full h-[15vh] mt-4 md:mt-8 px-4 safe-area-x safe-area-b flex flex-col justify-center">
              <div className="w-full max-w-3xl mx-auto flex items-center gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2">
                {galleryImages.map((frag, idx) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden snap-center transition-all duration-300 ${
                      selectedIndex === idx
                        ? "ring-2 ring-[#979e6c] scale-110 opacity-100"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={frag}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      unoptimized={typeof frag === "string"}
                      className="object-cover"
                      sizes="(max-width: 768px) 20vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Love Files Overlay */}
      <LoveFilesOverlay
        project={project}
        showLoveFiles={showLoveFiles}
        onClose={() => setShowLoveFiles(false)}
        galleryImages={galleryImages}
        openLightbox={openLightbox}
      />

      {/* Rundown Overlay */}
      <RundownOverlay
        project={project}
        events={events}
        showRundownOverlay={showRundownOverlay}
        onClose={() => setShowRundownOverlay(false)}
      />
    </div>
  );
}

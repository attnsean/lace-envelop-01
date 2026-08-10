"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images?: (string | null | undefined)[];
  coverPhotoUrl?: string; // backwards compatibility
  coupleName?: string;
  monogram?: string;
  onFinish?: () => void;
}

export default function InvitationPreloader({
  images = [],
  coverPhotoUrl,
  coupleName = "The Wedding of",
  monogram = "S",
  onFinish,
}: Props) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [statusText, setStatusText] = useState("Menyiapkan Undangan...");
  
  const targetProgressRef = useRef(0);
  const loadedCountRef = useRef(0);
  const totalImagesRef = useRef(0);

  useEffect(() => {
    // Collect all valid unique image URLs to preload
    const candidateList = [...images, coverPhotoUrl].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0
    );
    const uniqueImages = Array.from(new Set(candidateList));
    totalImagesRef.current = Math.max(uniqueImages.length, 1);

    let isMounted = true;

    // Real Image Preloading Function
    const preloadAll = async () => {
      if (uniqueImages.length === 0) {
        targetProgressRef.current = 100;
        return;
      }

      uniqueImages.forEach((url) => {
        if (typeof window === "undefined") return;

        const img = new window.Image();
        img.src = url;

        const onAssetReady = () => {
          if (!isMounted) return;
          loadedCountRef.current += 1;
          const pct = Math.round((loadedCountRef.current / totalImagesRef.current) * 100);
          targetProgressRef.current = Math.max(targetProgressRef.current, pct);
        };

        if (img.complete && img.naturalWidth > 0) {
          onAssetReady();
        } else {
          img.onload = onAssetReady;
          img.onerror = onAssetReady;
          if (typeof img.decode === "function") {
            img.decode().then(onAssetReady).catch(onAssetReady);
          }
        }
      });
    };

    preloadAll();

    // Smooth animation tick to smoothly advance displayProgress toward targetProgress
    const animInterval = setInterval(() => {
      setDisplayProgress((prev) => {
        // Natural gradual crawl even if network is fast or slow
        const target = targetProgressRef.current;
        
        let nextVal = prev;
        if (prev < target) {
          const step = Math.max(1, Math.ceil((target - prev) * 0.25));
          nextVal = Math.min(prev + step, target);
        } else if (prev < 90 && loadedCountRef.current < totalImagesRef.current) {
          // Slow incremental bump while waiting
          nextVal = Math.min(prev + 1, 90);
        }

        // Update dynamic luxury status text
        if (nextVal < 30) {
          setStatusText("Menghubungkan & Memuat Data...");
        } else if (nextVal < 70) {
          setStatusText("Mengunduh Foto & Galeri...");
        } else if (nextVal < 99) {
          setStatusText("Menyempurnakan Tampilan...");
        } else {
          setStatusText("Selamat Datang");
        }

        if (nextVal >= 100) {
          clearInterval(animInterval);
          setTimeout(() => {
            if (isMounted) {
              setIsFinished(true);
              onFinish?.();
            }
          }, 450);
          return 100;
        }

        return nextVal;
      });
    }, 40);

    // Fallback safety timeout: ensure preloader finishes within 3.5s regardless of slow network
    const safetyTimeout = setTimeout(() => {
      targetProgressRef.current = 100;
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(animInterval);
      clearTimeout(safetyTimeout);
    };
  }, [images, coverPhotoUrl, onFinish]);

  if (isFinished) return null;

  // Derive Monogram initials from coupleName if not customized
  const displayMonogram = monogram !== "S" 
    ? monogram 
    : (coupleName.includes("&") 
        ? coupleName.split("&").map(s => s.trim()[0]).filter(Boolean).join("") 
        : "S").slice(0, 3).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.04,
          filter: "blur(8px)",
          transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
        }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070707] text-white select-none px-6 overflow-hidden"
      >
        {/* Deep ambient glow effects */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-600/15 via-amber-400/10 to-transparent blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-amber-200/5 blur-[80px] pointer-events-none" />

        {/* Ambient floating star sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-200 rounded-full shadow-[0_0_8px_#fde68a]"
              style={{
                top: `${15 + (i * 14)}%`,
                left: `${10 + ((i * 17) % 80)}%`,
              }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
                scale: [0.7, 1.3, 0.7],
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Center Container */}
        <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center space-y-7">
          {/* Astrolabe Luxury Rotating Seal Badge */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer golden orbiting tick ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-amber-300/30"
            />
            {/* Inner counter-rotating ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-dotted border-amber-200/20"
            />
            {/* Glowing gold halo */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 backdrop-blur-md shadow-[0_0_25px_rgba(251,191,36,0.25)] border border-amber-300/40" />

            {/* Monogram Text */}
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 font-serif text-2xl md:text-3xl text-amber-200 tracking-widest font-light drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]"
            >
              {displayMonogram}
            </motion.span>
          </div>

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-2"
          >
            <p className="text-[9px] md:text-[10px] tracking-[0.45em] text-amber-200/70 uppercase font-medium">
              Wedding Invitation
            </p>
            <h1 className="text-xl md:text-2xl font-serif text-white tracking-wide font-light drop-shadow-md">
              {coupleName}
            </h1>
          </motion.div>

          {/* Progress Bar & Dynamic Percentage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full space-y-3 pt-1"
          >
            {/* Shimmering Progress Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden relative shadow-inner p-[1px]">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-300 rounded-full relative shadow-[0_0_12px_rgba(251,191,36,0.7)]"
                style={{ width: `${displayProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.1 }}
              >
                {/* Shimmer light reflection line */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_1.8s_infinite] -translate-x-full" />
              </motion.div>
            </div>

            {/* Status Text & Numerical Percentage */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/50 tracking-wider pt-0.5">
              <span className="text-[9px] uppercase tracking-widest text-amber-100/60 font-sans truncate max-w-[190px] text-left">
                {statusText}
              </span>
              <span className="text-amber-200 font-bold font-mono text-[11px] drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                {displayProgress}%
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

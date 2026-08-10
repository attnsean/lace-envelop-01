"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images?: (string | null | undefined)[];
  coverPhotoUrl?: string;
  coupleName?: string;
  monogram?: string;
  onFinish?: () => void;
}

export default function InvitationPreloader({
  images = [],
  coverPhotoUrl,
  coupleName = "The Wedding of",
  monogram,
  onFinish,
}: Props) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isGateOpening, setIsGateOpening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [statusText, setStatusText] = useState("Menyiapkan Undangan...");

  const targetProgressRef = useRef(0);
  const loadedCountRef = useRef(0);
  const totalAssetsRef = useRef(0);

  useEffect(() => {
    // 1. Gather all candidates & transform into both raw + Next.js optimized URLs
    const rawList = [...images, coverPhotoUrl].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0
    );
    const uniqueRawList = Array.from(new Set(rawList));

    const allUrlsToPreload: string[] = [];
    uniqueRawList.forEach((url) => {
      allUrlsToPreload.push(url);
      // Generate Next.js optimized image URLs so browser cache primes the exact Next.js <Image /> request
      if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
        try {
          allUrlsToPreload.push(`/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`);
          allUrlsToPreload.push(`/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`);
        } catch (_) {}
      }
    });

    const uniqueUrls = Array.from(new Set(allUrlsToPreload));
    totalAssetsRef.current = Math.max(uniqueUrls.length, 1);

    let isMounted = true;

    // 2. Real asset download & decoding
    if (uniqueUrls.length === 0) {
      targetProgressRef.current = 100;
    } else {
      uniqueUrls.forEach((url) => {
        if (typeof window === "undefined") return;

        const img = new window.Image();
        img.src = url;

        const onAssetReady = () => {
          if (!isMounted) return;
          loadedCountRef.current += 1;
          const pct = Math.round((loadedCountRef.current / totalAssetsRef.current) * 100);
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
    }

    // 3. Smooth animation ticker: steadily moves displayProgress toward targetProgress
    const animInterval = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = targetProgressRef.current;
        let nextVal = prev;

        if (prev < target) {
          // Smooth progressive easing toward real target
          const step = Math.max(1, Math.ceil((target - prev) * 0.18));
          nextVal = Math.min(prev + step, target);
        } else if (prev < 92 && loadedCountRef.current < totalAssetsRef.current) {
          // Subtle crawl while waiting for heavy images
          nextVal = Math.min(prev + 1, 92);
        }

        // Refined status text
        if (nextVal < 35) {
          setStatusText("Memuat Data...");
        } else if (nextVal < 75) {
          setStatusText("Mengunduh Foto...");
        } else if (nextVal < 100) {
          setStatusText("Menyempurnakan Visual...");
        } else {
          setStatusText("Selamat Datang");
        }

        // When 100% reached, trigger Grand Gate Opening
        if (nextVal >= 100) {
          clearInterval(animInterval);
          setTimeout(() => {
            if (isMounted) {
              setIsGateOpening(true);
              // After gate split animation completes (~1000ms), unmount preloader
              setTimeout(() => {
                if (isMounted) {
                  setIsFinished(true);
                  onFinish?.();
                }
              }, 1050);
            }
          }, 400);
          return 100;
        }

        return nextVal;
      });
    }, 35);

    // Fallback safety timeout (6s) so slow 3G network never locks out the user permanently
    const safetyTimeout = setTimeout(() => {
      targetProgressRef.current = 100;
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(animInterval);
      clearTimeout(safetyTimeout);
    };
  }, [images, coverPhotoUrl, onFinish]);

  if (isFinished) return null;

  // Simple elegant monogram
  const displayMonogram = monogram
    ? monogram
    : coupleName.includes("&")
    ? coupleName
        .split("&")
        .map((s) => s.trim()[0])
        .filter(Boolean)
        .join(" & ")
    : "S";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none select-none overflow-hidden">
      {/* LEFT GATE DOOR */}
      <motion.div
        initial={{ x: "0%" }}
        animate={isGateOpening ? { x: "-100%" } : { x: "0%" }}
        transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#090807] border-r border-[#d4af37]/25 z-20 shadow-[15px_0_40px_rgba(0,0,0,0.9)] flex items-center justify-end"
      >
        {/* Subtle royal door edge trim */}
        <div className="absolute right-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#d4af37]/15 to-transparent pointer-events-none" />
      </motion.div>

      {/* RIGHT GATE DOOR */}
      <motion.div
        initial={{ x: "0%" }}
        animate={isGateOpening ? { x: "100%" } : { x: "0%" }}
        transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#090807] border-l border-[#d4af37]/25 z-20 shadow-[-15px_0_40px_rgba(0,0,0,0.9)] flex items-center justify-start"
      >
        {/* Subtle royal door edge trim */}
        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#d4af37]/15 to-transparent pointer-events-none" />
      </motion.div>

      {/* CENTER SEAM GOLDEN LIGHT BEAM (Shines brightly when gate splits) */}
      <motion.div
        animate={
          isGateOpening
            ? { opacity: [0.8, 1, 0], scaleX: [1, 8, 20], scaleY: [1, 1.2, 1.5] }
            : { opacity: [0.4, 0.8, 0.4] }
        }
        transition={
          isGateOpening
            ? { duration: 0.8, ease: "easeOut" }
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#fae19c] to-transparent z-25 pointer-events-none shadow-[0_0_20px_#fae19c]"
      />

      {/* CENTER CONTENT (Simple, Clean, Ultra-Elegant) */}
      <AnimatePresence>
        {!isGateOpening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: -12,
              filter: "blur(4px)",
              transition: { duration: 0.35, ease: "easeIn" },
            }}
            className="relative z-30 flex flex-col items-center max-w-[290px] w-full text-center px-4"
          >
            {/* Ambient Warm Backlight */}
            <div className="absolute w-64 h-64 rounded-full bg-amber-500/10 blur-[90px] pointer-events-none -top-12" />

            {/* Minimalist Rotating Monogram Emblem */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-6">
              {/* Thin Golden Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-amber-300/30 border-t-amber-100/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
              />
              {/* Inner Soft Circle */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-amber-950/40 to-black/80 backdrop-blur-sm border border-amber-200/20" />

              {/* Monogram Text */}
              <span className="relative z-10 font-serif text-lg md:text-xl text-amber-100 tracking-widest font-light">
                {displayMonogram}
              </span>
            </div>

            {/* Couple Typography */}
            <div className="space-y-1.5 mb-7">
              <p className="text-[9px] tracking-[0.4em] text-amber-200/60 uppercase font-medium">
                Wedding Invitation
              </p>
              <h2 className="text-xl md:text-2xl font-serif text-white tracking-wide font-light">
                {coupleName}
              </h2>
            </div>

            {/* Slim Golden Progress Line */}
            <div className="w-full space-y-2.5">
              <div className="w-full bg-white/10 h-[3px] rounded-full overflow-hidden relative p-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-300 rounded-full relative shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                  style={{ width: `${displayProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                />
              </div>

              {/* Status and Percentage */}
              <div className="flex justify-between items-center text-[10px] font-mono text-white/50 tracking-wider">
                <span className="text-[9px] uppercase tracking-widest text-amber-100/50 font-sans truncate">
                  {statusText}
                </span>
                <span className="text-amber-200 font-bold font-mono text-[11px]">
                  {displayProgress}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

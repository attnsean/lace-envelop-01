"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  coverPhotoUrl?: string;
  coupleName?: string;
}

export default function InvitationPreloader({ coverPhotoUrl, coupleName = "The Wedding of" }: Props) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // 1. Proactively preload cover photo in browser memory
    if (coverPhotoUrl && typeof window !== "undefined") {
      const img = new window.Image();
      img.src = coverPhotoUrl;
    }

    // 2. Smooth loading progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsFinished(true), 350);
          return 100;
        }
        const increment = prev < 50 ? Math.floor(Math.random() * 18) + 12 : Math.floor(Math.random() * 25) + 18;
        return Math.min(prev + increment, 100);
      });
    }, 70);

    return () => clearInterval(interval);
  }, [coverPhotoUrl]);

  if (isFinished) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] text-white select-none px-6"
      >
        {/* Subtle background glow */}
        <div className="absolute w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center space-y-6">
          {/* Monogram / Top Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-full border border-amber-200/30 flex items-center justify-center text-amber-200 font-serif text-xl tracking-widest bg-amber-900/10 backdrop-blur-sm shadow-[0_0_20px_rgba(251,191,36,0.15)]"
          >
            S
          </motion.div>

          <div className="space-y-1.5">
            <p className="text-[9px] tracking-[0.4em] text-amber-200/60 uppercase font-medium">Wedding Invitation</p>
            <h2 className="text-xl md:text-2xl font-serif text-white tracking-wide font-light">{coupleName}</h2>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="w-full space-y-2.5 pt-2">
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.15 }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/50 tracking-wider">
              <span>MEMUAT FOTO & ASSETS</span>
              <span className="text-amber-200 font-bold">{progress}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

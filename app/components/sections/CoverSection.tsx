"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../lib/resolveProject";
import FloatingParticles from "../FloatingParticles";

interface Props {
  project?: DbProject | null;
  guestName: string;
  isOpen: boolean;
  handleOpen: () => void;
}

export default function CoverSection({ project, guestName, isOpen, handleOpen }: Props) {
  return (
    <section
      className={`absolute inset-0 w-full h-full z-40 transition-transform duration-[1500ms] ease-[cubic-bezier(0.7,0,0.3,1)] ${
        isOpen ? "-translate-y-[120%] pointer-events-none" : "translate-y-0 pointer-events-auto"
      } flex flex-col items-center justify-center`}
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-black shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
        <FloatingParticles />
        <Image
          src={project?.opening_photo_url || project?.cover_photo_url || "/bg-invitation.jpg"}
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover brightness-[0.65] select-none"
          draggable={false}
          priority
        />
        <div className="absolute inset-0 bg-[#5b3b1e]/45 mix-blend-multiply"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-full py-16 text-white text-center px-4 w-full overflow-y-auto no-scrollbar">
        {/* Top Leaf Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-16 h-20 mb-8 flex items-center justify-center"
        >
          <Image
            src="/logo-white.png"
            alt="Logo"
            fill
            className="object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
            priority
          />
        </motion.div>

        {/* Dear, [Nama tamu] using font The Seasons */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-lg md:text-xl font-seasons text-white/90 tracking-wide mb-6"
        >
          Dear, {guestName}
        </motion.p>

        {/* Bride & Groom names in Parfumerie Script */}
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
          className="text-6xl md:text-8xl lg:text-9xl font-parfumerie text-white mb-6 leading-none drop-shadow-2xl font-light"
        >
          Jovita & Luqman
        </motion.h1>

        {/* Excitedly request your presence in The Seasons */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1.4 }}
          className="text-xs md:text-sm tracking-[0.2em] text-white/80 uppercase font-seasons mb-12"
        >
          excitedly request your presence
        </motion.p>

        <div className="flex flex-col items-center w-full max-w-[240px] z-30">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 2.0 }}
            className="w-full"
          >
            <button
              onClick={handleOpen}
              className="w-full py-3 px-8 rounded-full bg-[#EAE3D2] text-[#333333] hover:bg-[#D8C4A9] transition-all duration-300 font-seasons text-xs tracking-[0.15em] uppercase shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Open Invitation
            </button>

            <p className="font-seasons text-[11px] tracking-[0.25em] text-white/70 font-semibold mt-8 select-none">
              #MANtracinTA
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

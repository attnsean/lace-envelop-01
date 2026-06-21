"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../lib/resolveProject";

interface Props {
  project?: DbProject | null;
  isOpen: boolean;
  formattedWeddingDate: string;
  formattedWeddingLocation: string;
}

export default function IntroSection({ project, isOpen, formattedWeddingDate, formattedWeddingLocation }: Props) {
  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <Image
          src={project?.opening_photo_url || project?.cover_photo_url || "/bg-invitation.jpg"}
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover brightness-[0.55] select-none"
          draggable={false}
          priority
        />
        <div className="absolute inset-0 bg-[#5b3b1e]/45 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-full py-16 text-center px-4 w-full select-none">
        {/* Heart Doily wrapper with scale/fade animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isOpen ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
          className="relative w-[80vw] h-[77vw] max-w-[420px] max-h-[404px] flex items-center justify-center mb-10 drop-shadow-2xl"
        >
          <Image
            src="/heart-doily.png"
            alt="Heart Doily"
            fill
            className="object-contain"
            priority
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={isOpen ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1.0 }}
            className="relative z-10 flex flex-col items-center justify-center text-center -mt-1 w-[85%]"
          >
            <span className="font-parfumerie text-[#5b3b1e] text-[clamp(42.5px,10.6vw,64.6px)] xs:text-[clamp(47.6px,10.2vw,69.7px)] md:text-[clamp(57.8px,5.95vw,88.4px)] leading-[1.0] font-medium block whitespace-nowrap">
              {project?.bride_nickname || "Jovita"} &
            </span>
            <span className="font-parfumerie text-[#5b3b1e] text-[clamp(42.5px,10.6vw,64.6px)] xs:text-[clamp(47.6px,10.2vw,69.7px)] md:text-[clamp(57.8px,5.95vw,88.4px)] leading-[1.0] font-medium block whitespace-nowrap mt-1">
              {project?.groom_nickname || "Luqman"}
            </span>
          </motion.div>
        </motion.div>

        {/* Are getting married! in Altesse Std */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isOpen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.4 }}
          className="font-altesse text-white text-[clamp(32px,8vw,48px)] md:text-[clamp(44px,4.5vw,64px)] tracking-wide drop-shadow-md"
        >
          Are getting married!
        </motion.p>

        {/* Date and Place in The Seasons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isOpen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.8 }}
          className="flex flex-col items-center mt-8 gap-2 text-white font-seasons drop-shadow-md tracking-[0.25em] text-[clamp(11px,2.5vw,14px)] md:text-[clamp(13px,1.5vw,18px)] uppercase"
        >
          <p>{formattedWeddingDate}</p>
          <p>{formattedWeddingLocation}</p>
        </motion.div>
      </div>
    </section>
  );
}

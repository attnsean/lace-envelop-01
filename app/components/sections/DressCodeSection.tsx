"use client";

import React from "react";
import Image from "next/image";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  galleryImages: string[];
  slide4Img: string;
}

export default function DressCodeSection({ project, galleryImages, slide4Img }: Props) {
  const bgImage = galleryImages.length > 0
    ? (galleryImages[1 % galleryImages.length] || project?.cover_photo_url || slide4Img)
    : (project?.cover_photo_url || slide4Img);

  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src={bgImage}
          alt="Dress Code Background"
          fill
          unoptimized={typeof bgImage === 'string'}
          sizes="(max-width: 768px) 100vw, 30vw"
          className="object-cover object-[center_35%] opacity-70 grayscale"
        />
        <div className="absolute inset-0 bg-[#363D22]/65 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center justify-center text-center text-white">
        <FadeIn>
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#E1D8CC] uppercase mb-2 block">DRESS CODE</span>
          <h2 className="font-seasons text-[clamp(28px,6.5vw,48px)] md:text-[clamp(36px,4vw,56px)] leading-tight tracking-wide mb-6">
            Dress to Impress
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-gray-300 max-w-md mx-auto mb-10">
            To create a beautifully unified celebration, we invite our guests to join us in dress code. <br />
            We encourage you to wear <span className="font-semibold text-white">Darker Earthy Colors</span> (Dark Green, Brown, Maroon, Navy, Black).
          </p>
        </FadeIn>

        {/* Earthy Color Palette circles */}
        <FadeIn delay={0.4} className="flex gap-4 sm:gap-6 justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 shadow-lg bg-[#2D3B2A] transition-transform hover:scale-110 duration-300"></div>
            <span className="text-[8px] md:text-[10px] font-lekton tracking-widest text-[#E1D8CC] uppercase">Forest</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 shadow-lg bg-[#4A3B32] transition-transform hover:scale-110 duration-300"></div>
            <span className="text-[8px] md:text-[10px] font-lekton tracking-widest text-[#E1D8CC] uppercase">Earth</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 shadow-lg bg-[#592825] transition-transform hover:scale-110 duration-300"></div>
            <span className="text-[8px] md:text-[10px] font-lekton tracking-widest text-[#E1D8CC] uppercase">Maroon</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 shadow-lg bg-[#1B263B] transition-transform hover:scale-110 duration-300"></div>
            <span className="text-[8px] md:text-[10px] font-lekton tracking-widest text-[#E1D8CC] uppercase">Navy</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 shadow-lg bg-[#111111] transition-transform hover:scale-110 duration-300"></div>
            <span className="text-[8px] md:text-[10px] font-lekton tracking-widest text-[#E1D8CC] uppercase">Black</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

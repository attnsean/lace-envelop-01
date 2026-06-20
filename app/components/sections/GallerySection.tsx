"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FadeIn from "../FadeIn";

interface Props {
  galleryImages: string[];
  openLightbox: (idx: number) => void;
}

export default function GallerySection({ galleryImages, openLightbox }: Props) {
  if (galleryImages.length === 0) return null;

  return (
    <section className="relative w-full min-h-screen h-auto snap-start shrink-0 bg-neutral-900 pb-24">
      <div className="w-full flex flex-col items-center justify-center pt-20 pb-12 px-6 sticky top-0 z-10 bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-transparent pointer-events-none">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-widest text-center">
            Fragments of <br />
            <motion.span
              className="font-script text-4xl md:text-5xl text-[#979e6c] block mt-2 lowercase -rotate-2"
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
              whileInView={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            >
              forever
            </motion.span>
          </h2>
        </FadeIn>
      </div>

      <div className="w-full px-2 grid grid-cols-3 gap-1 relative z-0">
        {galleryImages.map((frag, idx) => {
          // Custom pattern matching the reference
          let colSpan = "col-span-3";

          if (idx === 3 || idx === 4 || idx === 5) colSpan = "col-span-1";
          if (idx === 9 || idx === 10 || idx === 11) colSpan = "col-span-1";

          // Keep images square when they are in 3 columns, and 16:9 / aspect-auto when full width.
          const heightClass =
            colSpan === "col-span-1"
              ? "aspect-[3/4]"
              : "aspect-[4/3] md:aspect-[16/9]";

          return (
            <div
              key={idx}
              className={`relative w-full overflow-hidden ${colSpan} ${heightClass} cursor-pointer group`}
              onClick={() => openLightbox(idx)}
            >
              <Image
                src={frag}
                alt={`Fragment ${idx + 1}`}
                fill
                unoptimized={typeof frag === "string"}
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

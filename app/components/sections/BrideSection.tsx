"use client";

import React from "react";
import Image from "next/image";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  bridePhotoPosition: string;
  wanitaImg: string;
}

export default function BrideSection({ project, bridePhotoPosition, wanitaImg }: Props) {
  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-black">
      <Image
        src={project?.bride_photo_url || wanitaImg}
        alt="Mempelai Wanita"
        fill
        unoptimized={typeof (project?.bride_photo_url) === 'string'}
        sizes="(max-width: 768px) 100vw, 30vw"
        className="object-cover opacity-80 grayscale transition-all duration-700 ease-out z-0"
        style={{ objectPosition: bridePhotoPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 z-10 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-16 px-8 md:px-10">
        <FadeIn>
          <div className="mb-6 space-y-2">
            <h2 className="text-4xl md:text-5xl font-serif tracking-[0.3em] text-white">
              {(project?.bride_nickname || "JOVITA").split("").join(" ")}
            </h2>
            <p className="text-xl md:text-2xl font-script text-white/90">
              {project?.bride_name || "Jovita"}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xs md:text-sm font-sans font-light leading-relaxed tracking-wide text-gray-300 max-w-sm">
            Daughter of Mr. {project?.bride_father || "Rayanto Simangunsong"}{project?.bride_father_deceased ? " (Alm)" : ""} <br />
            & Mrs. {project?.bride_mother || "Sayunah Rutsetyaningsih"}{project?.bride_mother_deceased ? " (Almh)" : ""}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  groomPhotoPosition: string;
  priaImg: string;
}

export default function GroomSection({ project, groomPhotoPosition, priaImg }: Props) {
  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-black">
      <Image
        src={project?.groom_photo_url || priaImg}
        alt="Mempelai Pria"
        fill
        unoptimized={typeof (project?.groom_photo_url) === 'string'}
        sizes="(max-width: 768px) 100vw, 30vw"
        className="object-cover opacity-80 grayscale transition-all duration-700 ease-out z-0"
        style={{ objectPosition: groomPhotoPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 z-10 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-16 px-8 md:px-10">
        <FadeIn>
          <div className="mb-6 space-y-2">
            <h2 className="text-4xl md:text-5xl font-serif tracking-[0.3em] text-white">
              {(project?.groom_nickname || "LUQMAN").split("").join(" ")}
            </h2>
            <p className="text-xl md:text-2xl font-script text-white/90">
              {project?.groom_name || "Luqman"}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xs md:text-sm font-sans font-light leading-relaxed tracking-wide text-gray-300 max-w-sm">
            Son of Mr. {project?.groom_father || "Binsar Hamonangan Siahaan"}{project?.groom_father_deceased ? " (Alm)" : ""} <br />
            & Mrs. {project?.groom_mother || "Tisnawaty Sagala"}{project?.groom_mother_deceased ? " (Almh)" : ""}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

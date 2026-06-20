"use client";

import React from "react";
import Image from "next/image";
import { DbProject, DbEvent } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  events?: DbEvent[] | null;
  galleryImages: string[];
  bgImgCeremony: string;
  bgImg3: string;
}

export default function EventsSection({ project, events, galleryImages, bgImgCeremony, bgImg3 }: Props) {
  const formatFallbackDate = (dateStr?: string | null) => {
    const wDate = dateStr ? new Date(dateStr) : new Date("2026-04-25");
    if (isNaN(wDate.getTime())) return "Saturday, 25 April 2026";
    return wDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (events && events.length > 0) {
    return (
      <>
        {events.map((event, index) => {
          const eventTitle = (event.custom_label || event.event_type || "").toUpperCase();
          const fallbackImage = (galleryImages && galleryImages.length > 0)
            ? (index % 2 === 0 ? (galleryImages[2 % galleryImages.length] || galleryImages[0]) : (galleryImages[3 % galleryImages.length] || galleryImages[0]))
            : (index % 2 === 0 ? bgImgCeremony : bgImg3);
          const bgImage = event.venue_photo_url || fallbackImage;
          const dateText = formatEventDate(event.event_date);
          const timeText = event.event_time ? `${event.event_time.substring(0, 5)} ${event.end_time ? `- ${event.end_time.substring(0, 5)}` : ""} WIB` : "";

          return (
            <section key={event.id || index} id={index === 0 ? "events-section" : undefined} className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden">
              <div className="absolute inset-0 z-0 bg-black">
                <Image
                  src={bgImage}
                  alt={eventTitle}
                  fill
                  unoptimized={typeof bgImage === 'string'}
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover object-[center_35%] grayscale opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-[2px]"></div>
              </div>

              <div className="relative z-10 w-full h-full flex flex-col justify-center px-8 md:px-10">
                <FadeIn>
                  <h2 className="text-4xl md:text-5xl font-serif tracking-widest text-white mb-8">
                    {eventTitle}
                  </h2>
                </FadeIn>

                <div className="space-y-8">
                  <FadeIn delay={0.2}>
                    <p className="text-sm md:text-base font-sans tracking-[0.2em] text-white uppercase mb-4">{dateText}</p>
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] w-8 bg-white/30"></div>
                      <div>
                        <p className="text-xs font-sans tracking-widest text-white/60 uppercase">{event.custom_label || event.event_type}</p>
                        <p className="text-sm md:text-base font-sans tracking-widest text-white">{timeText}</p>
                      </div>
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.4}>
                    <p className="text-sm md:text-base font-sans tracking-[0.1em] text-white">{event.venue_name}</p>
                    <p className="text-xs font-sans font-light leading-relaxed text-gray-300 mt-2 pr-4 mb-6">
                      {event.venue_address}
                    </p>
                    {((event.latitude && event.longitude) || event.venue_maps_url) && (
                      <>
                        <div className="w-full h-48 md:h-64 mb-6 rounded-md overflow-hidden ring-1 ring-white/20">
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={event.latitude && event.longitude
                              ? `https://maps.google.com/maps?q=${event.latitude},${event.longitude}&hl=en&z=15&output=embed`
                              : event.venue_maps_url || undefined
                            }
                          ></iframe>
                        </div>
                        <a
                          href={event.venue_maps_url || `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-3 text-xs md:text-sm bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-md text-white tracking-widest"
                        >
                          Take Me There
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </>
                    )}
                  </FadeIn>
                </div>
              </div>
            </section>
          );
        })}
      </>
    );
  }

  return (
    <>
      {/* SECTION 6: Holy Matrimony */}
      <section id="events-section" className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={bgImgCeremony}
            alt="Holy Matrimony Location"
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover object-[center_35%] grayscale opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center px-8 md:px-10">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-serif tracking-widest text-white mb-8">
              HOLY MATRIMONY
            </h2>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <p className="text-sm md:text-base font-sans tracking-[0.2em] text-white uppercase mb-4">{formatFallbackDate(project?.wedding_date)}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-white/30"></div>
                  <div>
                    <p className="text-xs font-sans tracking-widest text-white/60 uppercase">Wedding Ceremony</p>
                    <p className="text-sm md:text-base font-sans tracking-widest text-white">10.00 WIB</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-sm md:text-base font-sans tracking-[0.1em] text-white">HKBP Perumnas Batu Onom</p>
              <p className="text-xs font-sans font-light leading-relaxed text-gray-300 mt-2 pr-4 mb-6">
                Perumnas–Batu Onom Street, Pantoan Maju, Siantar District, Simalungun Regency, North Sumatra 21151
              </p>
              <div className="w-full h-48 md:h-64 mb-6 rounded-md overflow-hidden ring-1 ring-white/20">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=2.9681810000000017,99.13241908650755&hl=en&z=15&output=embed"
                ></iframe>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=2.9681810000000017,99.13241908650755"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 text-xs md:text-sm bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-md text-white tracking-widest"
              >
                Take Me There
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 6.5: Reception */}
      <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={bgImg3}
            alt="Reception Location"
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center px-8 md:px-10">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-serif tracking-widest text-white mb-8">
              RECEPTION
            </h2>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <p className="text-sm md:text-base font-sans tracking-[0.2em] text-white uppercase mb-4">{formatFallbackDate(project?.wedding_date)}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-white/30"></div>
                  <div>
                    <p className="text-xs font-sans tracking-widest text-white/60 uppercase">Reception</p>
                    <p className="text-sm md:text-base font-sans tracking-widest text-white">12.00 WIB</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-sm md:text-base font-sans tracking-[0.1em] text-white">SOPO GODANG HKBP ANUGERAH</p>
              <p className="text-xs font-sans font-light leading-relaxed text-gray-300 mt-2 pr-4 mb-6">
                Pattimura Street No. 394, Tomuan, Siantar Timur District, Pematang Siantar City, North Sumatra 21139
              </p>
              <div className="w-full h-48 md:h-64 mb-6 rounded-md overflow-hidden ring-1 ring-white/20">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=2.9538467276350473,99.07676277502532&hl=en&z=15&output=embed"
                ></iframe>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=2.9538467276350473,99.07676277502532"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 text-xs md:text-sm bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-md text-white tracking-widest"
              >
                Take Me There
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}

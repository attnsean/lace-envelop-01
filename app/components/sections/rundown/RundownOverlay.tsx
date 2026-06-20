"use client";

import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DbProject, DbEvent } from "../../../../lib/resolveProject";
import EventDetailSlide from "./EventDetailSlide";
import WeddingRundownSlide from "./WeddingRundownSlide";
import DiningScheduleSlide from "./DiningScheduleSlide";

interface Props {
  project?: DbProject | null;
  events?: DbEvent[] | null;
  showRundownOverlay: boolean;
  onClose: () => void;
}

export default function RundownOverlay({
  project,
  events,
  showRundownOverlay,
  onClose,
}: Props) {
  const rundownOverlaySummaryRef = useRef<HTMLDivElement>(null);
  const rundownOverlayRundownRef = useRef<HTMLDivElement>(null);
  const rundownOverlayDiningRef = useRef<HTMLDivElement>(null);

  const formatIndonesianDate = (dateStr?: string | null) => {
    const wDate = dateStr ? new Date(dateStr) : new Date("2026-08-08");
    if (isNaN(wDate.getTime())) return "Sabtu, 8 Agustus 2026";
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const dayName = days[wDate.getDay()];
    const day = wDate.getDate();
    const monthName = months[wDate.getMonth()];
    const year = wDate.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  const getGoogleCalendarLink = () => {
    const bride = project?.bride_nickname || "Jovita";
    const groom = project?.groom_nickname || "Luqman";
    const title = encodeURIComponent(`Wedding of ${groom} & ${bride}`);
    const wDate = project?.wedding_date
      ? new Date(project.wedding_date)
      : new Date("2026-04-25");
    const year = wDate.getFullYear();
    const month = String(wDate.getMonth() + 1).padStart(2, '0');
    const day = String(wDate.getDate()).padStart(2, '0');
    const dates = `${year}${month}${day}T020000Z/${year}${month}${day}T140000Z`;
    const details = encodeURIComponent(
      `We look forward to sharing our special day with you!`
    );
    const location = encodeURIComponent(project?.venue_name || "Indonesia");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const firstEvent = events?.[0] || null;
  const eventDateRaw =
    project?.wedding_date || firstEvent?.event_date || "2026-08-08";
  const formattedIndoDate = formatIndonesianDate(eventDateRaw);
  const latitude = firstEvent?.latitude;
  const longitude = firstEvent?.longitude;

  const mapIframeSrc =
    latitude && longitude
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&hl=id&z=15&output=embed`
      : firstEvent?.venue_maps_url ||
        `https://maps.google.com/maps?q=-6.9538467,110.3767627&hl=id&z=15&output=embed`;

  const mapLinkUrl =
    firstEvent?.venue_maps_url ||
    (latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=-6.9538467,110.3767627`);

  const googleCalendarLink = getGoogleCalendarLink();

  return (
    <AnimatePresence>
      {showRundownOverlay && (
        <motion.div
          key="rundown-overlay-view"
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed inset-0 z-[120] w-full h-[100dvh] overflow-hidden bg-[#e2ddc7] flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
        >
          <div className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory flex flex-col scrollbar-hide relative">
            {/* Floating Back Button */}
            <button
              onClick={onClose}
              className="fixed top-6 left-6 z-[140] flex items-center gap-2 text-[#4a3525]/80 hover:text-[#4a3525] bg-white/40 hover:bg-white/60 backdrop-blur-md border border-[#4a3525]/20 rounded-full px-4 py-2.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </button>

            {/* SLIDE 1: Detail Acara & Lokasi */}
            <EventDetailSlide
              project={project}
              events={events}
              formattedIndoDate={formattedIndoDate}
              mapIframeSrc={mapIframeSrc}
              mapLinkUrl={mapLinkUrl}
              googleCalendarLink={googleCalendarLink}
              slideRef={rundownOverlaySummaryRef}
              nextSlideRef={rundownOverlayRundownRef}
            />

            {/* SLIDE 2: Wedding Rundown */}
            <WeddingRundownSlide
              project={project}
              slideRef={rundownOverlayRundownRef}
              prevSlideRef={rundownOverlaySummaryRef}
              nextSlideRef={rundownOverlayDiningRef}
            />

            {/* SLIDE 3: Dining Schedule */}
            <DiningScheduleSlide
              project={project}
              slideRef={rundownOverlayDiningRef}
              prevSlideRef={rundownOverlayRundownRef}
              onClose={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

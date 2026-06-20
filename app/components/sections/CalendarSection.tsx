"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

interface Props {
  project?: DbProject | null;
  bgImg12: string;
}

export default function CalendarSection({ project, bgImg12 }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const countdownTarget = project?.countdown_target || project?.wedding_date || "2026-04-25T00:00:00";
    const targetDate = new Date(countdownTarget).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [project]);

  const renderCalendar = () => {
    const wDate = project?.wedding_date ? new Date(project.wedding_date) : new Date("2026-04-25");
    const year = wDate.getFullYear();
    const month = wDate.getMonth();
    const targetDay = wDate.getDate();

    const rawMonthName = wDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
    const monthName = rawMonthName.split("").join(" ");

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const grid = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ day: null, isTarget: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      grid.push({ day: d, isTarget: d === targetDay });
    }

    return { monthName, grid };
  };

  const { monthName: dynamicMonthName, grid: calendarGrid } = renderCalendar();

  const getGoogleCalendarLink = () => {
    const bride = project?.bride_nickname || "Jovita";
    const groom = project?.groom_nickname || "Luqman";
    const title = encodeURIComponent(`Wedding of ${groom} & ${bride}`);
    const wDate = project?.wedding_date ? new Date(project.wedding_date) : new Date("2026-04-25");
    const year = wDate.getFullYear();
    const month = String(wDate.getMonth() + 1).padStart(2, '0');
    const day = String(wDate.getDate()).padStart(2, '0');
    const dates = `${year}${month}${day}T020000Z/${year}${month}${day}T140000Z`;
    const details = encodeURIComponent(`We look forward to sharing our special day with you!`);
    const location = encodeURIComponent(project?.venue_name || "Indonesia");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src={project?.cover_photo_url || bgImg12}
          alt="Save the Date"
          fill
          unoptimized={typeof (project?.cover_photo_url) === 'string'}
          sizes="(max-width: 768px) 100vw, 30vw"
          className="object-cover object-[center_35%] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      <div className="absolute top-[5%] left-[-15%] text-[30rem] font-script text-white/5 leading-none pointer-events-none mix-blend-overlay">
        &
      </div>

      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center pb-12 px-6">
        <FadeIn>
          <h2 className="text-3xl font-serif tracking-[0.4em] text-white mb-6">
            {dynamicMonthName}
          </h2>
        </FadeIn>

        {/* Dynamic Calendar Grid */}
        <FadeIn delay={0.2} className="w-full max-w-[280px] mb-10">
          <div className="grid grid-cols-7 gap-y-4 text-center text-[10px] md:text-xs text-white/80 font-sans font-light">
            <div className="font-medium text-white mb-2">Su</div>
            <div className="font-medium text-white mb-2">Mo</div>
            <div className="font-medium text-white mb-2">Tu</div>
            <div className="font-medium text-white mb-2">We</div>
            <div className="font-medium text-white mb-2">Th</div>
            <div className="font-medium text-white mb-2">Fr</div>
            <div className="font-medium text-white mb-2">Sa</div>

            {calendarGrid.map((cell, idx) => (
              <div key={idx} className="relative flex items-center justify-center h-6 w-full">
                {cell.day ? (
                  cell.isTarget ? (
                    <>
                      <span className="relative z-10 font-bold text-white">{cell.day}</span>
                      <div className="absolute inset-0 bg-white/30 rounded-full scale-[1.3] md:scale-150 backdrop-blur-[2px]"></div>
                      <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-[8px] md:text-[10px] text-pink-400">♥</span>
                    </>
                  ) : (
                    <span>{cell.day}</span>
                  )
                ) : (
                  <span className="opacity-0"></span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Countdown */}
        {project?.subscriptions?.packages?.has_hitung_mundur !== false && (
          <>
            <FadeIn delay={0.4} className="w-full max-w-[280px] flex justify-between text-white font-serif tracking-widest border-t border-white/20 pt-6">
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl">{timeLeft.days.toString().padStart(2, '0')}</span>
                <span className="text-[9px] md:text-[10px] font-sans font-light mt-1 opacity-70">Days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[9px] md:text-[10px] font-sans font-light mt-1 opacity-70">Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[9px] md:text-[10px] font-sans font-light mt-1 opacity-70">Minutes</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[9px] md:text-[10px] font-sans font-light mt-1 opacity-70">Seconds</span>
              </div>
            </FadeIn>

            {/* Add to Calendar Button */}
            <FadeIn delay={0.6} className="mt-8 relative z-50">
              <a
                href={getGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-sans uppercase tracking-[0.2em] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                Add to Calendar
              </a>
            </FadeIn>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "react-qr-code";

const priaImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop";
const wanitaImg = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop";
const bgImg12 = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop";
const bgImg3 = "https://images.unsplash.com/photo-1519225495810-7517c24a2ed3?q=80&w=1200&auto=format&fit=crop"; // Used for Reception
const bgImgCeremony = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop"; // Used for Ceremony
const bgImg4 = "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop"; // Used for Wedding Gift
const slide4Img = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop"; // Used for Dress Code

import Slideshow from "./Slideshow";
import FadeIn from "./FadeIn";
import BlessingWall from "./BlessingWall";
import CustomCursor from "./CustomCursor";
import TimelineSection, { StoryEvent } from "./TimelineSection";
import FloatingParticles from "./FloatingParticles";
import { DbGuest, DbProject, DbEvent, DbWish } from "../../lib/resolveProject";
import { supabase } from "../../lib/supabase";
import { useSmartPosition } from "../../lib/useSmartPosition";

const fragments = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519225495810-7517c24a2ed3?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=400&auto=format&fit=crop"
];

interface Props {
  guestName: string;
  guest?: DbGuest | null;
  project?: DbProject | null;
  events?: DbEvent[] | null;
  wishes?: DbWish[] | null;
  stats?: {
    attending: number;
    wishes: number;
  };
}

interface GiftItem {
  id: string;
  name: string;
  image: string;
  isBought: boolean;
  price: string | number;
  originalPrice?: string | number;
  discount?: string;
  link?: string;
}

interface PaymentAccount {
  provider?: string | null;
  bank_name?: string | null;
  bankName?: string | null;
  bank_account?: string | null;
  bankAccount?: string | null;
  account_number?: string | null;
  accountNumber?: string | null;
  owner_name?: string | null;
  ownerName?: string | null;
  account_name?: string | null;
  accountName?: string | null;
}

export default function RightSidebar({ guestName, guest, project, events, wishes, stats }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [[page, direction], setPage] = useState([0, 0]);

  const groomPhotoPosition = useSmartPosition(project?.groom_photo_url || priaImg);
  const bridePhotoPosition = useSmartPosition(project?.bride_photo_url || wanitaImg);
  const [showQRModal, setShowQRModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [giftLoading, setGiftLoading] = useState(true);
  const [activeGiftIndex, setActiveGiftIndex] = useState(0);
  const [selectedGiftForQR, setSelectedGiftForQR] = useState<GiftItem | null>(null);

  const defaultSealSrc = `https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/c6d00359-becb-4f70-ab00-ff8f8530d546/f93ad18d-cba2-4de0-a86b-b1fadf2783a2/wax-seal.png`;
  const [sealSrc, setSealSrc] = useState(defaultSealSrc);

  useEffect(() => {
    if (project?.user_id && project?.id) {
      setSealSrc(`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project.user_id}/${project.id}/wax-seal.png`);
    } else {
      setSealSrc(defaultSealSrc);
    }
  }, [project, defaultSealSrc]);

  useEffect(() => {
    async function fetchGifts() {
      if (!project?.id) {
        setGiftLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('gift_registry')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const mapped = (data || []).map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop",
          isBought: item.is_bought || false,
          price: item.price ? item.price.toLocaleString('id-ID') : '0',
          originalPrice: item.original_price ? item.original_price.toLocaleString('id-ID') : undefined,
          discount: item.discount_label || undefined,
          link: item.link || undefined
        }));
        setGiftItems(mapped);
      } catch (err) {
        console.error("Error fetching gift registry:", err);
      } finally {
        setGiftLoading(false);
      }
    }
    fetchGifts();
  }, [project?.id]);

  const statsState = stats || { attending: 156, wishes: 43 };
  const galleryImages = (project?.gallery_photos && Array.isArray(project.gallery_photos) && project.gallery_photos.length > 0)
    ? (project.gallery_photos as (string | { url?: string; public_url?: string })[])
      .map((p) => typeof p === 'string' ? p : p?.url || p?.public_url)
      .filter((url): url is string => typeof url === 'string' && !!url)
    : (project ? [] : fragments);

  const slideshowImages = React.useMemo(() => {
    const list: string[] = [];
    if (project?.opening_photo_url) list.push(project.opening_photo_url);
    if (project?.cover_photo_url) list.push(project.cover_photo_url);
    if (project?.bride_photo_url) list.push(project.bride_photo_url);
    if (project?.groom_photo_url) list.push(project.groom_photo_url);

    if (project?.gallery_photos && Array.isArray(project.gallery_photos)) {
      project.gallery_photos.forEach((p) => {
        const url = typeof p === 'string' ? p : p?.url || p?.public_url;
        if (url) list.push(url);
      });
    }
    return list.length > 0 ? list : fragments;
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

  const formattedWeddingDate = React.useMemo(() => {
    if (project?.wedding_date) {
      const date = new Date(project.wedding_date);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
      }
    }
    return "AUGUST 8, 2026";
  }, [project?.wedding_date]);

  const formattedWeddingLocation = React.useMemo(() => {
    return project?.venue_name || "SEMARANG";
  }, [project?.venue_name]);

  // Gift items initialized directly in state

  const openLightbox = (idx: number) => {
    setPage([idx, 0]);
    setSelectedIndex(idx);
  };

  const paginate = (newDirection: number) => {
    if (selectedIndex === null) return;
    const nextIndex = selectedIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < galleryImages.length) {
      setPage([nextIndex, newDirection]);
      setSelectedIndex(nextIndex);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Account number copied!");
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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

  return (
    <div className="relative w-full h-[100dvh] z-20 flex-shrink-0 overflow-hidden bg-neutral-950">
      <CustomCursor />

      {/* Audio Element */}
      <audio ref={audioRef} loop src={project?.music_url || "/audio/bgm.mp3"} />

      {/* Premium Music Player UI */}
      <div
        className={`fixed bottom-6 right-6 z-[100] flex flex-row-reverse items-center gap-4 transition-all duration-1000 delay-500 ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"}`}
      >
        <button
          onClick={toggleAudio}
          className="relative group w-14 h-14 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 overflow-hidden"
        >
          {/* Rotating Vinyl Effect */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-1 rounded-full border border-dashed border-white/30 ${!isPlaying && 'opacity-50'}`}
          />

          {/* Inner Circle / Label */}
          <div className="absolute inset-4 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex gap-0.5 items-end h-3">
                <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-[#d4af37]" />
                <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-[#d4af37]" />
                <motion.div animate={{ height: [6, 10, 4] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-[#d4af37]" />
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#d4af37]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
              </svg>
            )}
          </div>
        </button>

        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="hidden sm:flex flex-col items-end"
            >
              <p className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase">Now Playing</p>
              <p className="text-[10px] font-serif text-[#d4af37] tracking-widest whitespace-nowrap">Wedding Melody</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Content (Sections 2, 3, 4, 5, 6, 7) */}
      <div
        className={`h-full overflow-y-auto no-scrollbar pb-24 absolute inset-0 w-full h-full overflow-x-hidden snap-y snap-mandatory flex flex-col gap-20 md:gap-28 scrollbar-hide transition-opacity duration-1000 ease-in-out delay-300 z-10 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* NEW SECTION: Wedding Intro with Heart Doily */}
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
                <span className="font-parfumerie text-[#5b3b1e] text-[clamp(50px,12.5vw,76px)] xs:text-[clamp(56px,12vw,82px)] md:text-[clamp(68px,7vw,104px)] leading-[1.0] font-medium block whitespace-nowrap">
                  Jovita &
                </span>
                <span className="font-parfumerie text-[#5b3b1e] text-[clamp(50px,12.5vw,76px)] xs:text-[clamp(56px,12vw,82px)] md:text-[clamp(68px,7vw,104px)] leading-[1.0] font-medium block whitespace-nowrap mt-1">
                  Luqman
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

        {/* SECTION 2: Quote */}
        <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-[#e2ddc7]">
          {/* Decorative Images around center text with Staggered Animations */}
          {(() => {
            const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
            const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';

            const danceImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-dance.jpg`;
            const pigeonsImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-pigeons.jpg`;
            const flowersImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/gallery-24.jpg`;
            const runImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec2-run.jpg`;

            return (
              <>
                {/* Top-Left: Dance */}
                <FadeIn 
                  delay={0.1} 
                  className="absolute top-[8%] sm:top-[12%] left-[4%] sm:left-[8%] w-[37vw] sm:w-[29vw] md:w-[15vw] lg:w-[16vw] xl:w-[17vw] max-w-[250px] sm:max-w-[320px] md:max-w-[190px] lg:max-w-[225px] xl:max-w-[250px] aspect-[3/4] shadow-2xl border-[3px] sm:border-[6px] border-white/95 rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
                >
                  <Image
                    src={danceImgUrl}
                    alt="Dancing"
                    fill
                    sizes="(max-width: 768px) 250px, (max-width: 1024px) 225px, 280px"
                    className="object-cover pointer-events-none w-full h-full"
                    unoptimized
                  />
                </FadeIn>

                {/* Top-Right: Pigeons */}
                <FadeIn 
                  delay={0.3} 
                  className="absolute top-[12%] sm:top-[16%] right-[4%] sm:right-[8%] w-[35vw] sm:w-[26vw] md:w-[14vw] lg:w-[15vw] xl:w-[15vw] max-w-[230px] sm:max-w-[290px] md:max-w-[165px] lg:max-w-[205px] xl:max-w-[240px] aspect-square shadow-2xl border-[3px] sm:border-[6px] border-white/95 rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
                >
                  <Image
                    src={pigeonsImgUrl}
                    alt="Pigeons"
                    fill
                    sizes="(max-width: 768px) 230px, (max-width: 1024px) 205px, 250px"
                    className="object-cover pointer-events-none w-full h-full"
                    unoptimized
                  />
                </FadeIn>

                {/* Bottom-Left: Flowers */}
                <FadeIn 
                  delay={0.5} 
                  className="absolute bottom-[12%] sm:bottom-[16%] left-[6%] sm:left-[12%] w-[32vw] sm:w-[24vw] md:w-[12vw] lg:w-[14vw] xl:w-[15vw] max-w-[195px] sm:max-w-[265px] md:max-w-[150px] lg:max-w-[195px] xl:max-w-[225px] aspect-[4/5] shadow-2xl border-[3px] sm:border-[6px] border-white/95 rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
                >
                  <Image
                    src={flowersImgUrl}
                    alt="Flowers"
                    fill
                    sizes="(max-width: 768px) 195px, (max-width: 1024px) 195px, 240px"
                    className="object-cover pointer-events-none w-full h-full"
                    unoptimized
                  />
                </FadeIn>

                {/* Bottom-Right: Run */}
                <FadeIn 
                  delay={0.7} 
                  className="absolute bottom-[8%] sm:bottom-[12%] right-[6%] sm:right-[12%] w-[37vw] sm:w-[29vw] md:w-[15vw] lg:w-[16vw] xl:w-[17vw] max-w-[250px] sm:max-w-[320px] md:max-w-[190px] lg:max-w-[225px] xl:max-w-[250px] aspect-[3/4] shadow-2xl border-[3px] sm:border-[6px] border-white/95 rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 overflow-hidden"
                >
                  <Image
                    src={runImgUrl}
                    alt="Running"
                    fill
                    sizes="(max-width: 768px) 250px, (max-width: 1024px) 225px, 280px"
                    className="object-cover pointer-events-none w-full h-full"
                    unoptimized
                  />
                </FadeIn>
              </>
            );
          })()}

          {/* Centered Content with Cascading Text Animations */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto h-full select-none space-y-3 sm:space-y-4">
            <FadeIn delay={0.4}>
              <p className="font-seasons text-[#4a3525] text-[clamp(16px,4.5vw,36px)] font-medium leading-relaxed tracking-wide">
                Our next chapter starts{" "}
                <span className="font-altesse text-[clamp(28px,7vw,58px)] italic font-light text-[#4a3525] inline-block ml-1">
                  here,
                </span>
              </p>
            </FadeIn>
            
            <FadeIn delay={0.7}>
              <p className="font-seasons text-[#4a3525] text-[clamp(16px,4.5vw,36px)] font-medium leading-relaxed tracking-wide">
                And it starts with{" "}
                <span className="font-altesse text-[clamp(28px,7vw,58px)] italic font-light text-[#4a3525] inline-block ml-1">
                  love.
                </span>
              </p>
            </FadeIn>

            <FadeIn delay={1.0} className="pt-8 sm:pt-10">
              <motion.button
                onClick={() => {
                  document.getElementById("love-story")?.scrollIntoView({ behavior: "smooth" });
                }}
                whileHover={{ scale: 1.06 }}
                animate={{ 
                  y: [0, -5, 0],
                  textShadow: [
                    "0px 0px 0px rgba(74,53,37,0)",
                    "0px 0px 4px rgba(74,53,37,0.2)",
                    "0px 0px 0px rgba(74,53,37,0)"
                  ]
                }}
                transition={{ 
                  y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                  textShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.2 }
                }}
                className="font-lekton text-[#4a3525] text-[clamp(11px,2vw,15px)] uppercase tracking-[0.25em] border-b border-[#4a3525]/60 pb-1.5 hover:text-[#4a3525]/80 hover:border-[#4a3525]/80 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <span>Open the Love Files</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block"
                >
                  &gt;&gt;
                </motion.span>
              </motion.button>
            </FadeIn>
          </div>
        </section>

        {/* SECTION 2.5: Quran Verse */}
        <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-neutral-950 flex flex-col items-center justify-center">
          {/* Background image with overlay */}
          {(() => {
            const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
            const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';

            const bgImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec3-bg.jpg`;
            const frameImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec3-frame.png`;
            const coupleImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec3-couple.jpg`;

            return (
              <>
                <div className="absolute inset-0 z-0 bg-black">
                  <Image
                    src={bgImgUrl}
                    alt="Background"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-100 select-none"
                    draggable={false}
                    unoptimized
                  />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto h-full select-none gap-6 sm:gap-8">
                  {/* Silver Platter with Spring Entry + Gentle Floating Animation */}
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
                    >
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-[95vw] sm:w-[90vw] max-w-[540px] sm:max-w-[660px] aspect-[1.7] flex items-center justify-center filter drop-shadow-2xl"
                      >
                        {/* Silver Platter png overlay (rotated 90deg, visually horizontal and gepeng, z-10) */}
                        <div className="absolute w-[55%] h-[158%] z-10 rotate-90">
                          <Image
                            src={frameImgUrl}
                            alt="Silver Platter"
                            fill
                            sizes="(max-width: 640px) 540px, 660px"
                            className="object-fill"
                            unoptimized
                          />
                        </div>

                        {/* Couple Photo cropped into horizontal flat ellipse, placed on TOP of the platter (z-20) */}
                        <div className="absolute w-[70%] h-[74%] z-20 overflow-hidden" style={{ clipPath: 'ellipse(48% 48% at 50% 50%)' }}>
                          <Image
                            src={coupleImgUrl}
                            alt="Couple under Veil"
                            fill
                            sizes="(max-width: 640px) 380px, 460px"
                            className="object-cover scale-110"
                            unoptimized
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Texts with staggered delay and premium blur fade-in */}
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
                    >
                      <h3 
                        className="text-white text-[clamp(28px,7.5vw,46px)] leading-relaxed text-center font-normal"
                        style={{ 
                          fontFamily: '"Traditional Arabic", "Amiri", "Scheherazade New", serif', 
                          direction: 'rtl'
                        }}
                      >
                        وَخَلَقْنَاكُمْ أَزْوَاجًا
                      </h3>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: 0.7 }}
                    >
                      <p 
                        className="font-altesse text-white text-[clamp(22px,5vw,36px)] italic font-light tracking-wide text-center leading-normal"
                        style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.95), 0 0 18px rgba(255, 255, 255, 0.85), 0 0 32px rgba(255, 255, 255, 0.75), 0 0 48px rgba(255, 255, 255, 0.6), 1px 1px 3px rgba(0, 0, 0, 0.95)' }}
                      >
                        “And We created you in pairs.”
                      </p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: 1.0 }}
                      className="w-full text-right"
                    >
                      <p className="font-seasons text-white/90 text-[clamp(10px,1.8vw,13px)] uppercase tracking-[0.25em] pt-2">
                        — Surah An-Naba (78:8)
                      </p>
                    </motion.div>
                  </div>
                </div>
              </>
            );
          })()}
        </section>

        {/* RSVP Section (Moved above Groom/Bride details) */}
        {project?.subscriptions?.packages?.has_rsvp !== false && (
          <BlessingWall
            guestName={guestName}
            guest={guest}
            projectId={project?.id}
            wishes={wishes}
            hasRsvp={true}
            hasGuestbook={false}
            project={project}
            galleryImages={galleryImages}
          />
        )}

        {/* NEW SECTION: The Details */}
        {(() => {
          const userId = project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
          const projectId = project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';
          const detailsImgUrl = `${supabaseUrl}/storage/v1/object/public/undangan/${userId}/${projectId}/sec6-details.jpg`;

          return (
            <section id="details" className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col md:flex-row bg-[#E1D8CC]">
              {/* Left Column (Foot-in-grass photo) */}
              <div className="relative w-full md:w-[50%] h-[42%] md:h-full shrink-0 overflow-hidden">
                <FadeIn className="w-full h-full" delay={0.2}>
                  <Image
                    src={detailsImgUrl}
                    alt="Wedding Details Foot Photo"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover pointer-events-none w-full h-full select-none"
                    unoptimized
                  />
                </FadeIn>
              </div>

              {/* Right Column (Beige detail card) */}
              <div className="w-full md:w-[50%] h-[58%] md:h-full flex flex-col items-center justify-center p-6 md:p-12 text-[#4A3E3D] select-none text-center bg-[#E1D8CC]">
                {/* The Details Title */}
                <FadeIn delay={0.3}>
                  <div className="flex flex-col items-center mb-8 md:mb-12 select-none relative">
                    <span className="font-parfumerie text-[#4A3E3D] text-[clamp(65px,14vw,95px)] md:text-[clamp(85px,6vw,120px)] leading-none italic font-light z-10 -mb-3 md:-mb-5">
                      The
                    </span>
                    <h3 className="font-seasons text-[#4A3E3D] text-[clamp(36px,8vw,56px)] md:text-[clamp(48px,4.5vw,68px)] font-normal uppercase leading-none tracking-[0.2em]">
                      DETAILS
                    </h3>
                  </div>
                </FadeIn>

                {/* Date & Location */}
                <FadeIn delay={0.5}>
                  <div className="flex flex-col items-center mb-5 md:mb-8">
                    <h4 className="font-seasons text-[#4A3E3D] text-[clamp(15px,3vw,18px)] md:text-[clamp(18px,1.8vw,24px)] font-medium uppercase tracking-[0.25em] mb-2 md:mb-3">
                      DATE & LOCATION
                    </h4>
                    <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(13px,2.5vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-relaxed tracking-wider">
                      Saturday, 8 August 2026
                    </p>
                    <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(13px,2.5vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-relaxed tracking-wider">
                      Openaire Resto Bar Market Semarang
                    </p>
                  </div>
                </FadeIn>

                {/* Thin Divider */}
                <FadeIn delay={0.6} className="w-full flex justify-center">
                  <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-4 md:my-5"></div>
                </FadeIn>

                {/* Akad & Reception */}
                <FadeIn delay={0.7}>
                  <div className="flex flex-col items-center mb-5 md:mb-8">
                    <h4 className="font-seasons text-[#4A3E3D] text-[clamp(15px,3vw,18px)] md:text-[clamp(18px,1.8vw,24px)] font-medium uppercase tracking-[0.25em] mb-2 md:mb-3">
                      AKAD & RECEPTION
                    </h4>
                    <p className="font-lekton text-[#4A3E3D]/95 text-[clamp(13px,2.5vw,16px)] md:text-[clamp(15px,1.3vw,19px)] leading-relaxed tracking-wider">
                      13.15-18.00
                    </p>
                  </div>
                </FadeIn>

                {/* Thin Divider */}
                <FadeIn delay={0.8} className="w-full flex justify-center">
                  <div className="w-20 md:w-28 h-[1px] bg-[#4A3E3D]/20 my-4 md:my-5"></div>
                </FadeIn>

                {/* Action Button */}
                <FadeIn delay={0.9} className="mt-3">
                  <button
                    onClick={() => {
                      document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="font-lekton text-[#4A3E3D] text-[clamp(12px,2.2vw,15px)] md:text-[clamp(13px,1.2vw,16px)] tracking-wider px-8 md:px-10 py-3 md:py-3.5 border border-[#4A3E3D] rounded-full bg-transparent hover:bg-[#4A3E3D]/10 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    Detailed Info & Rundown
                  </button>
                </FadeIn>
              </div>
            </section>
          );
        })()}

        {/* NEW SECTION: FAQs */}
        <section id="faq" className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden bg-[#363D22] text-white flex flex-col justify-center items-center select-none">
          <div className="w-full max-w-2xl px-6 md:px-8 py-8 md:py-12 flex flex-col items-center justify-center text-center h-full space-y-6 md:space-y-8">
            {/* Header */}
            <FadeIn delay={0.1}>
              <h2 className="font-seasons text-[clamp(44px,9vw,64px)] md:text-[clamp(56px,5vw,78px)] font-normal tracking-wide text-white leading-none">
                FAQs
              </h2>
            </FadeIn>

            {/* FAQ Q&A Container */}
            <div className="flex flex-col space-y-6 md:space-y-8 w-full overflow-y-auto no-scrollbar max-h-[80vh] py-2">
              {/* Q&A Item 1 */}
              <FadeIn delay={0.2} className="w-full">
                <div className="space-y-1.5 md:space-y-2.5">
                  <h4 className="font-seasons italic text-[#E1D8CC] text-[clamp(16.5px,3.2vw,21px)] md:text-[clamp(19px,1.6vw,24px)] font-medium tracking-wide">
                    Can I arrive in the middle of the event?
                  </h4>
                  <p className="font-seasons text-[#D2CFC7]/90 text-[clamp(13px,2.4vw,15.5px)] md:text-[clamp(14.5px,1.25vw,17px)] leading-relaxed max-w-xl mx-auto font-light">
                    We kindly recommend arriving on time, as the celebration will feature a seated set-menu dining experience served at specific times throughout the evening. Arriving late may result in missed courses.
                  </p>
                </div>
              </FadeIn>

              {/* Q&A Item 2 */}
              <FadeIn delay={0.3} className="w-full">
                <div className="space-y-1.5 md:space-y-2.5">
                  <h4 className="font-seasons italic text-[#E1D8CC] text-[clamp(16.5px,3.2vw,21px)] md:text-[clamp(19px,1.6vw,24px)] font-medium tracking-wide">
                    Can I bring a plus one?
                  </h4>
                  <p className="font-seasons text-[#D2CFC7]/90 text-[clamp(13px,2.4vw,15.5px)] md:text-[clamp(14.5px,1.25vw,17px)] leading-relaxed max-w-xl mx-auto font-light">
                    This is an intimate destination wedding with limited seating. Kindly note that only named guests in the invitation are included.
                  </p>
                </div>
              </FadeIn>

              {/* Q&A Item 3 */}
              <FadeIn delay={0.4} className="w-full">
                <div className="space-y-1.5 md:space-y-2.5">
                  <h4 className="font-seasons italic text-[#E1D8CC] text-[clamp(16.5px,3.2vw,21px)] md:text-[clamp(19px,1.6vw,24px)] font-medium tracking-wide">
                    Can children attend the wedding?
                  </h4>
                  <p className="font-seasons text-[#D2CFC7]/90 text-[clamp(13px,2.4vw,15.5px)] md:text-[clamp(14.5px,1.25vw,17px)] leading-relaxed max-w-xl mx-auto font-light">
                    To maintain the atmosphere and seating arrangements, attendance is limited to guests listed on the invitation.
                  </p>
                </div>
              </FadeIn>

              {/* Q&A Item 4 */}
              <FadeIn delay={0.5} className="w-full">
                <div className="space-y-1.5 md:space-y-2.5">
                  <h4 className="font-seasons italic text-[#E1D8CC] text-[clamp(16.5px,3.2vw,21px)] md:text-[clamp(19px,1.6vw,24px)] font-medium tracking-wide">
                    Is there a dress code?
                  </h4>
                  <p className="font-seasons text-[#D2CFC7]/90 text-[clamp(13px,2.4vw,15.5px)] md:text-[clamp(14.5px,1.25vw,17px)] leading-relaxed max-w-xl mx-auto font-light">
                    Guests are welcome to wear any style or color they feel comfortable in, as long as it is appropriate for the occasion. We kindly ask guests to avoid white, cream, or overly bright/light colors, and encourage darker tones instead.
                  </p>
                </div>
              </FadeIn>

              {/* Q&A Item 5 */}
              <FadeIn delay={0.6} className="w-full">
                <div className="space-y-1.5 md:space-y-2.5">
                  <h4 className="font-seasons italic text-[#E1D8CC] text-[clamp(16.5px,3.2vw,21px)] md:text-[clamp(19px,1.6vw,24px)] font-medium tracking-wide">
                    Can I choose my seat/table?
                  </h4>
                  <p className="font-seasons text-[#D2CFC7]/90 text-[clamp(13px,2.4vw,15.5px)] md:text-[clamp(14.5px,1.25vw,17px)] leading-relaxed max-w-xl mx-auto font-light">
                    Seating has been thoughtfully arranged by the couple and families. Your assigned table information will be available upon arrival.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* NEW SECTION: Gift Registry */}
        {project?.subscriptions?.packages?.has_amplop_digital !== false && (
          <section id="gift-registry" className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col md:flex-row bg-[#E1D8CC] text-[#4A3E3D] select-none">
            {/* Left Column (Registry title and bird) */}
            <div className="w-full md:w-[45%] h-[25%] md:h-full flex flex-col items-center justify-center p-4 pb-2 md:p-12 text-center relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className="flex flex-col items-center select-none"
              >
                <span className="font-parfumerie text-[#4A3E3D] text-[clamp(60px,12vw,80px)] md:text-[clamp(100px,8vw,140px)] leading-none italic font-light z-10 -mb-3 md:-mb-6">
                  Gift
                </span>
                <h3 className="font-seasons text-[#4A3E3D] text-[clamp(32px,7vw,46px)] md:text-[clamp(55px,5vw,85px)] font-normal uppercase leading-none tracking-[0.08em] mb-3 md:mb-8">
                  REGISTRY
                </h3>
                
                {/* Bird illustration */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  className="relative w-[160px] h-[90px] xs:w-[190px] xs:h-[110px] md:w-[360px] md:h-[200px] mt-1 md:mt-3 select-none pointer-events-none"
                >
                  <Image
                    src={`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf'}/${project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'}/gift-bird.png`}
                    alt="Bird Illustration"
                    fill
                    sizes="(max-width: 768px) 190px, 360px"
                    className="object-contain"
                    unoptimized
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column (Message and Doily bank details card) */}
            <div className="w-full md:w-[55%] h-[75%] md:h-full flex flex-col items-center justify-start md:justify-center p-4 pt-4 pb-2 md:p-12 text-center md:text-left md:items-start space-y-3 xs:space-y-5 md:space-y-8">
              {/* Message */}
              <div className="space-y-2 md:space-y-4 max-w-xl md:max-w-md lg:max-w-lg">
                <FadeIn delay={0.3}>
                  <h4 className="font-seasons text-[clamp(18px,4.5vw,25px)] md:text-[clamp(26px,2vw,36px)] leading-[1.3] text-[#4A3E3D] font-normal">
                    Your presence at our wedding is the greatest gift of all.
                  </h4>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <p className="font-lekton text-[#4A3E3D]/90 text-[clamp(12px,2.6vw,14px)] md:text-[clamp(14px,1.2vw,16px)] leading-relaxed font-light text-justify md:text-left">
                    For family and friends who have kindly asked about wedding gifts, we truly appreciate your generosity and thoughtfulness. Should you wish to bless us with a gift, a contribution through the following registry would be warmly appreciated as we begin this new chapter together.
                  </p>
                </FadeIn>
              </div>

              {/* Doily Card list */}
              <div className="w-full flex justify-center md:justify-start">
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center md:justify-start overflow-x-auto no-scrollbar">
                  {(() => {
                    const paymentAccounts = (project?.payment_accounts && Array.isArray(project.payment_accounts) && project.payment_accounts.length > 0
                      ? project.payment_accounts
                      : [
                          { bank_name: "BRI", bank_account: "125101001997509", owner_name: "M LUQMAN FIKRI" }
                        ]) as PaymentAccount[];

                    return paymentAccounts.map((acc, i) => {
                      const bankName = acc.provider || acc.bank_name || acc.bankName || "";
                      const accountNo = acc.bank_account || acc.bankAccount || acc.account_number || acc.accountNumber || "";
                      const ownerName = acc.owner_name || acc.ownerName || acc.account_name || acc.accountName || "";

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 35 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 * i }}
                          className="relative shrink-0"
                        >
                          <motion.div
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="relative w-[320px] h-[200px] xs:w-[370px] xs:h-[230px] md:w-[560px] md:h-[345px] flex items-center justify-center text-[#4A3E3D] font-seasons cursor-pointer"
                          >
                            {/* Lace Frame Background */}
                            <Image
                              src={`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf'}/${project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'}/gift-lace.png`}
                              alt="Lace Card Frame"
                              fill
                              sizes="(max-width: 768px) 370px, 560px"
                              className="object-contain pointer-events-none select-none"
                              unoptimized
                            />

                            {/* Card Content */}
                            <div 
                              className="relative z-10 flex flex-col items-center justify-center text-center p-3 md:p-4 -mt-2 w-[80%] h-[75%] origin-center"
                              style={{ transform: "rotate(-3.5deg)" }}
                            >
                              <span className="text-[clamp(12px,2.4vw,15px)] md:text-[clamp(15px,1.2vw,18px)] tracking-[0.2em] font-light uppercase text-[#4A3E3D]/80">
                                {bankName}
                              </span>
                              <span className="text-[clamp(17px,3.5vw,21px)] md:text-[clamp(22px,1.8vw,26px)] font-normal text-[#4A3E3D] mt-1 mb-1.5 md:mt-2 md:mb-2 tracking-wide truncate max-w-full">
                                {ownerName}
                              </span>
                              <span className="font-lekton italic text-[clamp(14px,2.8vw,18px)] md:text-[clamp(17px,1.4vw,20px)] text-[#4A3E3D] tracking-[0.12em] mb-3 md:mb-4 select-text">
                                {accountNo}
                              </span>
                              <button
                                onClick={() => copyToClipboard(accountNo)}
                                className="font-lekton text-white text-[clamp(11px,2.2vw,13px)] md:text-[clamp(13px,1.1vw,15px)] tracking-[0.2em] uppercase px-6 py-1.5 md:px-10 md:py-2.5 bg-[#4A2511] hover:bg-[#3D1E0E] active:scale-95 rounded-full transition-all duration-300 cursor-pointer shadow-md"
                              >
                                Copy
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === HIDDEN SECTIONS START (below Gift Registry) === */}
        {false && (<>
        {/* SECTION 3: Groom */}
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

        {/* SECTION 4: Bride */}
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

        {/* SECTION 4.5: The Love Story Timeline */}
        {project?.subscriptions?.packages?.has_love_story !== false && (
          <TimelineSection loveStoryItems={project?.love_story_items as StoryEvent[] | null | undefined} />
        )}

        {/* SECTION 5: Calendar & Countdown */}
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

        {/* DYNAMIC EVENTS SECTION */}
        {events && (events?.length ?? 0) > 0 ? (
          events!.map((event, index) => {
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
          })
        ) : (
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
        )}

        {/* SECTION 7: Fragments of Forever Gallery */}
        {galleryImages.length > 0 && (
          <section className="relative w-full min-h-screen h-auto snap-start shrink-0 bg-neutral-900 pb-24">
            <div className="w-full flex flex-col items-center justify-center pt-20 pb-12 px-6 sticky top-0 z-10 bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-transparent pointer-events-none">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-serif text-white tracking-widest text-center">
                  Fragments of <br />
                  <motion.span
                    className="font-script text-4xl md:text-5xl text-[#d4af37] block mt-2 lowercase -rotate-2"
                    initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
                    whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
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
                const heightClass = colSpan === "col-span-1" ? "aspect-[3/4]" : "aspect-[4/3] md:aspect-[16/9]";

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
                      unoptimized={typeof frag === 'string'}
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 8: Dress Code */}
        <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 z-0 bg-black">
            <Image
              src={galleryImages.length > 0 ? (galleryImages[1 % galleryImages.length] || project?.cover_photo_url || slide4Img) : (project?.cover_photo_url || slide4Img)}
              alt="Dress Code Background"
              fill
              unoptimized={
                galleryImages.length > 0
                  ? typeof (galleryImages[1 % galleryImages.length] || project?.cover_photo_url) === 'string'
                  : typeof (project?.cover_photo_url) === 'string'
              }
              sizes="(max-width: 768px) 100vw, 30vw"
              className="object-cover object-[center_35%] opacity-30 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
          </div>
          <div className="relative z-10 w-full flex flex-col items-center px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-serif tracking-widest text-white mb-6">
                DRESS CODE
              </h2>
            </FadeIn>

            <FadeIn delay={0.2} className="max-w-xs">
              <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-gray-300 mb-12">
                To maintain the harmony of our wedding theme, we kindly request our guests to wear
              </p>
            </FadeIn>

            <FadeIn delay={0.4} className="flex gap-12 items-center justify-center">
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-14 h-14 rounded-full bg-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-110"></div>
                <span className="text-[10px] tracking-widest text-gray-400 uppercase font-sans">White</span>
              </div>
              <div className="h-10 w-[1px] bg-white/20"></div>
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-14 h-14 rounded-full bg-black border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-transform duration-500 group-hover:scale-110"></div>
                <span className="text-[10px] tracking-widest text-gray-400 uppercase font-sans">Black</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* SECTION 11: Blessing Wall / Guestbook */}
        {project?.subscriptions?.packages?.has_guestbook !== false && (
          <BlessingWall
            guestName={guestName}
            guest={guest}
            projectId={project?.id}
            wishes={wishes}
            hasRsvp={false}
            hasGuestbook={true}
            project={project}
            galleryImages={galleryImages}
          />
        )}
        </>)}
        {/* === HIDDEN SECTIONS END === */}

        {/* SECTION 12: Closing & Copyright */}
        <section className="relative w-full h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col items-center justify-center bg-neutral-950 px-8 text-center border-t border-white/5">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-serif text-[#d4af37] tracking-widest mb-8 uppercase drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Thank You</h2>
          </FadeIn>

          <FadeIn delay={0.2} className="max-w-md">
            <p className="text-xs md:text-sm font-sans font-light leading-relaxed text-gray-300 mb-12">
              It is a joy to share this beautiful chapter of our lives with you. Your presence and blessings mean the world to us.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] md:text-xs tracking-[0.4em] text-white/50 uppercase font-bold">With Love</span>
              <p className="text-2xl md:text-3xl font-script text-white mt-2">
                {project?.groom_nickname || "Luqman"} & {project?.bride_nickname || "Jovita"}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.6} className="absolute bottom-10 left-0 right-0 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div className="h-[1px] w-12 bg-white/30 mb-4"></div>
            <p className="text-[8px] md:text-[9px] font-sans tracking-[0.3em] text-white uppercase font-bold">
              Designed & Crafted by
            </p>
            <p className="text-[10px] md:text-xs font-serif tracking-widest text-[#d4af37] mt-1.5 font-bold">
              SERA STORY
            </p>
            <p className="text-[7px] md:text-[8px] font-sans tracking-[0.2em] text-white/50 mt-1 uppercase">
              © {new Date().getFullYear()} All Rights Reserved.
            </p>
          </FadeIn>
        </section>

        {/* Snap anchor for the bottom of the last tall section */}
        <div className="w-full h-[1px] shrink-0 snap-end"></div>
      </div>

      {/* SECTION 1: Cover (Envelope Reveal) */}
      <section
        className={`absolute inset-0 w-full h-full z-40 transition-transform duration-[1500ms] ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? "-translate-y-[120%] pointer-events-none" : "translate-y-0 pointer-events-auto"
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

              <button
                onClick={() => setShowQRModal(true)}
                className="w-full py-3 px-8 mt-4 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 hover:bg-white/5 transition-all duration-300 font-seasons text-xs tracking-[0.15em] uppercase"
              >
                Entry Code
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            key="entry-qr-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-[#5b3b1e]/90 backdrop-blur-md cursor-pointer p-6"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
              className="bg-white p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center max-w-sm w-full border border-neutral-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-8 bg-neutral-950 rounded-[2rem] border border-neutral-800 overflow-hidden flex flex-col items-center shadow-xl">
                <div className="p-6 pb-4 w-full flex justify-center bg-white relative z-10">
                  <div className="relative inline-block w-[220px] h-[220px]">
                    <QRCode
                      value={guest?.invitation_slug || guestName || "Guest"}
                      size={220}
                      level="H"
                      bgColor="white"
                      fgColor="black"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                </div>

                {/* Text Watermark Bottom Centered */}
                <div className="w-full py-4 flex flex-col items-center justify-center select-none bg-neutral-950 border-t border-white/5 relative z-0">
                  <span className="text-[12px] font-serif font-bold tracking-[0.15em] text-[#d4af37] uppercase mb-1 drop-shadow-md">Sera Story</span>
                  <span className="text-[6px] font-sans tracking-[0.3em] text-neutral-400 uppercase">© 2026 All Rights Reserved.</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase">Your Access Code</h2>
                <p className="text-2xl font-serif text-black uppercase tracking-tight break-words max-w-full leading-tight">{guest?.invitation_slug || guestName || "Guest"}</p>
              </div>

              <p className="text-neutral-400 text-[10px] font-sans mt-8 uppercase tracking-[0.2em] text-center italic">Show this code at the entrance</p>

              <button
                onClick={() => setShowQRModal(false)}
                className="mt-10 w-full py-5 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] transition-all uppercase rounded-2xl hover:bg-neutral-800 active:scale-95 shadow-xl"
              >
                Return to Invitation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            key="lightbox-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
          >
            {/* Top Bar with Close Button */}
            <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center z-50">
              <div className="text-white/50 text-xs tracking-widest font-sans bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                {selectedIndex + 1} / {galleryImages.length}
              </div>
              <button
                className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 transition-all duration-300"
                onClick={() => setSelectedIndex(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Image Slider */}
            <div className="relative w-full h-[65vh] md:h-[70vh] flex items-center justify-center overflow-hidden safe-area-x mt-10 md:mt-0">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute w-full h-full max-w-5xl px-4 flex justify-center items-center cursor-grab active:cursor-grabbing"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={galleryImages[selectedIndex]}
                      alt={`Fragment ${selectedIndex + 1}`}
                      fill
                      unoptimized={typeof galleryImages[selectedIndex] === 'string'}
                      className="object-contain"
                      sizes="100vw"
                      quality={100}
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Nav Buttons (Desktop) */}
              <div className="hidden md:flex absolute inset-y-0 w-full max-w-7xl justify-between items-center px-4 pointer-events-none z-10">
                <button
                  className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 ${selectedIndex === 0 ? 'opacity-0 pointer-events-none cursor-default' : 'opacity-100'}`}
                  onClick={() => paginate(-1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <button
                  className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 ${selectedIndex === galleryImages.length - 1 ? 'opacity-0 pointer-events-none cursor-default' : 'opacity-100'}`}
                  onClick={() => paginate(1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>

            {/* Thumbnails row below */}
            <div className="w-full h-[15vh] mt-4 md:mt-8 px-4 safe-area-x safe-area-b flex flex-col justify-center">
              <div className="w-full max-w-3xl mx-auto flex items-center gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2">
                {galleryImages.map((frag, idx) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden snap-center transition-all duration-300 ${selectedIndex === idx ? 'ring-2 ring-[#d4af37] scale-110 opacity-100' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <Image
                      src={frag}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      unoptimized={typeof frag === 'string'}
                      className="object-cover"
                      sizes="(max-width: 768px) 20vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* QRIS Gift Modal */}
      <AnimatePresence>
        {selectedGiftForQR && (
          <motion.div
            key="gift-qr-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#5b3b1e]/90 backdrop-blur-md p-6"
            onClick={() => setSelectedGiftForQR(null)}
          >
            <motion.div
              layout
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-[90%] sm:max-w-sm w-full border border-neutral-100 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <motion.div layout className="mb-4 sm:mb-6 text-center">
                <motion.h3 layout className="text-[8px] sm:text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase mb-1 sm:mb-2">Gift Registry</motion.h3>
                <motion.p layout className="text-base sm:text-lg font-serif text-black leading-tight mb-0.5 sm:mb-1">{selectedGiftForQR.name}</motion.p>
                <motion.div layout className="flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-[#d4af37]">Rp {selectedGiftForQR.price}</span>
                </motion.div>
              </motion.div>

              <motion.div
                key="transfer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="text-center space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-[1px] w-4 bg-neutral-200"></div>
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">Transfer To</span>
                    <div className="h-[1px] w-4 bg-neutral-200"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-4 sm:mb-8">
                  {(() => {
                    const paymentAccounts = (project?.payment_accounts && Array.isArray(project.payment_accounts) && project.payment_accounts.length > 0
                      ? project.payment_accounts
                      : [
                        { bank_name: "Bank BCA", bank_account: "7772276101", owner_name: "Christian Siahaan" },
                        { bank_name: "Bank BCA", bank_account: "7772276101", owner_name: "Ira Mita Simangunsong" }
                      ]) as PaymentAccount[];
                    return paymentAccounts.map((acc: PaymentAccount, i: number) => {
                      const bankName = acc.bank_name || acc.bankName || "Bank";
                      const accountNo = acc.bank_account || acc.bankAccount || acc.account_number || acc.accountNumber || "";
                      const ownerName = acc.owner_name || acc.ownerName || acc.account_name || acc.accountName || "";
                      return (
                        <div key={i} className="bg-neutral-900 p-5 rounded-[1.5rem] border border-neutral-800 transition-all duration-300 group flex flex-col justify-between shadow-lg">
                          <div>
                            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{bankName}</h3>
                            <p className="text-[10px] text-[#d4af37] mb-4 uppercase tracking-widest">{ownerName}</p>
                          </div>
                          <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-white/5 transition-all">
                            <span className="font-mono text-sm text-white tracking-[0.2em]">{accountNo}</span>
                            <button
                              onClick={() => copyToClipboard(accountNo)}
                              className="text-gray-400 hover:text-white hover:scale-110 transition-all"
                              title="Copy Account Number"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="pt-2 pb-2">
                  <p className="text-[10px] md:text-xs font-light text-neutral-500 leading-relaxed italic text-center">
                    Please confirm the gift shipment via personal chat to the couple.
                  </p>
                </div>
              </motion.div>

              <motion.button
                layout
                onClick={() => setSelectedGiftForQR(null)}
                className="w-full py-4 sm:py-5 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.3em] transition-all uppercase rounded-2xl hover:bg-black active:scale-95 shadow-xl"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

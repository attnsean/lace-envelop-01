"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie } from 'recharts';
import { supabase } from "../../lib/supabase";
import QRCode from "react-qr-code";

const getMapsEmbedUrl = (queryOrUrl: string) => {
  if (!queryOrUrl) return "";
  if (queryOrUrl.startsWith("http") && queryOrUrl.includes("output=embed")) {
    return queryOrUrl;
  }
  if (queryOrUrl.startsWith("http")) {
    if (queryOrUrl.includes("q=")) {
      const match = queryOrUrl.match(/[?&]q=([^&]+)/);
      if (match) return `https://maps.google.com/maps?q=${match[1]}&hl=id&z=15&output=embed`;
    }
    if (queryOrUrl.includes("query=")) {
      const match = queryOrUrl.match(/[?&]query=([^&]+)/);
      if (match) return `https://maps.google.com/maps?q=${match[1]}&hl=id&z=15&output=embed`;
    }
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(queryOrUrl)}&hl=id&z=15&output=embed`;
};

interface WishItem {
  text: string;
  createdAt: any;
}

interface RundownItem {
  time: string;
  title: string;
  icon: string;
}

interface RSVPData {
  id: string;
  rsvp_id?: string;
  name: string;
  isAttending: boolean;
  guestsCount: number;
  actualGuestsCount?: number;
  checkedIn?: boolean;
  checkedInAt?: Date | null;
  phone?: string;
  wishes: string;
  createdAt: Date | null;
}

interface GiftItem {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  originalPrice: string;
  discount: string;
  isBought: boolean;
}

const GIFT_PRESETS = [
  { name: "Premium Vacuum Cleaner", price: "2.500.000", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop" },
  { name: "Air Purifier HEPA 13", price: "1.800.000", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop" },
  { name: "Microwave Oven", price: "1.200.000", image: "https://images.unsplash.com/photo-1519225495810-7517c24a2ed3?q=80&w=400&auto=format&fit=crop" },
  { name: "Premium Coffee Maker", price: "3.500.000", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop" },
  { name: "Juicer Blender Set", price: "850.000", image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=400&auto=format&fit=crop" }
];

const formatCurrencyInput = (val: string) => {
  const number = val.replace(/[^0-9]/g, '');
  if (!number) return '';
  return parseInt(number, 10).toLocaleString('id-ID');
};

interface StoryEvent {
  id: string;
  year: string;
  title: string;
  desc: string;
  order: number;
}

export default function RSVPDashboard() {
  const [project, setProject] = useState<any>(null);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'rsvp' | 'content' | 'settings'>('rsvp');
  const [settingsTab, setSettingsTab] = useState<'password'>('password');
  const [activeSection, setActiveSection] = useState<'cover' | 'verse' | 'couple' | 'events' | 'rundown' | 'dining' | 'story' | 'gallery' | 'cashless' | 'faq' | 'video'>('cover');
  const [loading, setLoading] = useState(true);

  // Quote/Verse states
  const [quoteArabicForm, setQuoteArabicForm] = useState("");
  const [quoteTranslationForm, setQuoteTranslationForm] = useState("");
  const [quoteSourceForm, setQuoteSourceForm] = useState("");
  const [photoSec2Dance, setPhotoSec2Dance] = useState("");
  const [photoSec2Pigeons, setPhotoSec2Pigeons] = useState("");
  const [photoSec2Flowers, setPhotoSec2Flowers] = useState("");
  const [photoSec2Run, setPhotoSec2Run] = useState("");
  const [photoSec3Bg, setPhotoSec3Bg] = useState("");
  const [photoSec3Frame, setPhotoSec3Frame] = useState("");
  const [photoSec3Couple, setPhotoSec3Couple] = useState("");

  // Gallery states
  const [galleryPhotosForm, setGalleryPhotosForm] = useState<string[]>([]);
  const [rundownItemsForm, setRundownItemsForm] = useState<RundownItem[]>([]);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  // Content Editor states
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<string | null>(null);
  const [weddingEvents, setWeddingEvents] = useState<any[]>([]);

  // Form details inputs
  const [brideNameForm, setBrideNameForm] = useState("");
  const [brideNicknameForm, setBrideNicknameForm] = useState("");
  const [brideFatherForm, setBrideFatherForm] = useState("");
  const [brideMotherForm, setBrideMotherForm] = useState("");
  const [brideInstagramForm, setBrideInstagramForm] = useState("");
  const [bridePhotoUrlForm, setBridePhotoUrlForm] = useState("");

  const [groomNameForm, setGroomNameForm] = useState("");
  const [groomNicknameForm, setGroomNicknameForm] = useState("");
  const [groomFatherForm, setGroomFatherForm] = useState("");
  const [groomMotherForm, setGroomMotherForm] = useState("");
  const [groomInstagramForm, setGroomInstagramForm] = useState("");
  const [groomPhotoUrlForm, setGroomPhotoUrlForm] = useState("");

  const [weddingDateForm, setWeddingDateForm] = useState("");
  const [weddingTimeForm, setWeddingTimeForm] = useState("");
  const [venueNameForm, setVenueNameForm] = useState("");
  const [venueAddressForm, setVenueAddressForm] = useState("");
  const [venueMapsUrlForm, setVenueMapsUrlForm] = useState("");

  const [hashtagForm, setHashtagForm] = useState("");
  const [musicUrlForm, setMusicUrlForm] = useState("");
  const [countdownTargetForm, setCountdownTargetForm] = useState("");
  const [religionForm, setReligionForm] = useState("");
  const [coverPhotoUrlForm, setCoverPhotoUrlForm] = useState("");
  const [openingPhotoUrlForm, setOpeningPhotoUrlForm] = useState("");

  const [liveStreamLabelForm, setLiveStreamLabelForm] = useState("");
  const [liveStreamUrlForm, setLiveStreamUrlForm] = useState("");
  const [wishlistNoteForm, setWishlistNoteForm] = useState("");
  const [wishlistUrlForm, setWishlistUrlForm] = useState("");

  const [locationCityForm, setLocationCityForm] = useState("");
  const [teaserVideoUrlForm, setTeaserVideoUrlForm] = useState("");
  const [diningScheduleForm, setDiningScheduleForm] = useState<{ time: string; title: string }[]>([]);
  const [faqsForm, setFaqsForm] = useState<{ question: string; answer: string }[]>([]);

  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [dbPassword, setDbPassword] = useState("serastory");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isBasicPlan, setIsBasicPlan] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);

  // Invitation Blast State
  const [blastGuests, setBlastGuests] = useState<{ name: string; phone: string; group?: string; botSession?: string; status?: 'idle' | 'queued' | 'error' }[]>([{ name: '', phone: '', group: '', botSession: '1', status: 'idle' }]);
  const [selectedBotSession, setSelectedBotSession] = useState<string>('1');
  const [rowBotSessions, setRowBotSessions] = useState<{ [key: string]: string }>({});
  const [botStatuses] = useState<{ [key: string]: { status: string, lastActive: any, name?: string } }>({
    Session1: { status: 'online', lastActive: new Date(), name: 'WhatsApp 1' },
    Session2: { status: 'offline', lastActive: null, name: 'WhatsApp 2' },
    Session3: { status: 'offline', lastActive: null, name: 'WhatsApp 3' },
    Session4: { status: 'offline', lastActive: null, name: 'WhatsApp 4' },
  });
  const [messageTemplate, setMessageTemplate] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importSheetUrl, setImportSheetUrl] = useState("");
  const [queuedPhones, setQueuedPhones] = useState<Set<string>>(new Set());
  const [scheduleBlastDate, setScheduleBlastDate] = useState("");

  // Settings State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [isSavingPaymentAccounts, setIsSavingPaymentAccounts] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, attending, declined
  const [filterCheckIn, setFilterCheckIn] = useState("all"); // all, arrived, waiting
  const [currentPage, setCurrentPage] = useState(1);

  // Story State
  const [newStoryYear, setNewStoryYear] = useState("");
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");
  const [newStoryOrder, setNewStoryOrder] = useState("");
  const [singleLoveStoryText, setSingleLoveStoryText] = useState("");
  const [isSavingLoveStory, setIsSavingLoveStory] = useState(false);
  const [isAddingStory, setIsAddingStory] = useState(false);



  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'guestsCount' | 'actualGuestsCount' | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  });

  const [selectedWish, setSelectedWish] = useState<RSVPData | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isHourlyExpanded, setIsHourlyExpanded] = useState(true);

  const [newGift, setNewGift] = useState({
    name: "",
    price: "",
    image: "",
    link: "",
    originalPrice: "",
    discount: ""
  });
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);

  const [editingGift, setEditingGift] = useState<{ id: string, name: string, price: string, image: string, discount: string } | null>(null);
  const [isUpdatingGift, setIsUpdatingGift] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [botStatus, setBotStatus] = useState<{ status: string; qr?: string }>({ status: 'disconnected' });
  const [isChangingBot, setIsChangingBot] = useState(false);
  const [blastLogs, setBlastLogs] = useState<any[]>([]);

  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2';



  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCheckIn]);

  const fetchData = async () => {
    try {
      // 1. Fetch project info
      const { data: rawProjectData } = await supabase
        .from('projects')
        .select('*, wedding_details(*)')
        .eq('id', projectId)
        .maybeSingle();

      let projectData = rawProjectData;
      if (projectData) {
        const details = (projectData as any).wedding_details;
        if (details) {
          Object.assign(projectData, details);
        }
        setProject(projectData);
        setDbPassword(projectData.password_dashboard || "serastory");

        // Populate Content Form inputs
        setBrideNameForm(projectData.bride_name || "");
        setBrideNicknameForm(projectData.bride_nickname || "");
        setBrideFatherForm(projectData.bride_father || "");
        setBrideMotherForm(projectData.bride_mother || "");
        setBrideInstagramForm(projectData.bride_instagram || "");
        setBridePhotoUrlForm(projectData.bride_photo_url || "");

        setGroomNameForm(projectData.groom_name || "");
        setGroomNicknameForm(projectData.groom_nickname || "");
        setGroomFatherForm(projectData.groom_father || "");
        setGroomMotherForm(projectData.groom_mother || "");
        setGroomInstagramForm(projectData.groom_instagram || "");
        setGroomPhotoUrlForm(projectData.groom_photo_url || "");

        setWeddingDateForm(projectData.wedding_date || "");
        setWeddingTimeForm(projectData.wedding_time || "");
        setVenueNameForm(projectData.venue_name || "");
        setVenueAddressForm(projectData.venue_address || "");
        setVenueMapsUrlForm(projectData.venue_maps_url || "");

        setHashtagForm(projectData.hashtag || "");
        setMusicUrlForm(projectData.music_url || "");
        setCountdownTargetForm(projectData.countdown_target || "");
        setReligionForm(projectData.religion || "");
        setCoverPhotoUrlForm(projectData.cover_photo_url || "");
        setOpeningPhotoUrlForm(projectData.opening_photo_url || "");

        let quotesData: any = {};
        if (projectData.wishlist_note && projectData.wishlist_note.trim().startsWith('{')) {
          try {
            quotesData = JSON.parse(projectData.wishlist_note);
          } catch (e) {
            console.error("Error parsing quotes from wishlist_note:", e);
          }
        }

        // Build fallback photo URLs (same pattern as QuoteSection.tsx / VerseSection.tsx)
        const uid = projectData.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf';
        const pid = projectData.id || projectId;
        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnruifsptjsafctjwqdh.supabase.co';
        const storageBase = `${sbUrl}/storage/v1/object/public/undangan/${uid}/${pid}`;

        setQuoteArabicForm(quotesData.quote_arabic || "وَخَلَقْنَاكُمْ أَزْوَاجًا");
        setQuoteTranslationForm(quotesData.quote_translation || "\u201CAnd We created you in pairs.\u201D");
        setQuoteSourceForm(quotesData.quote_source || "— Surah An-Naba (78:8)");
        setPhotoSec2Dance(quotesData.photo_sec2_dance || `${storageBase}/sec2-dance.jpg`);
        setPhotoSec2Pigeons(quotesData.photo_sec2_pigeons || `${storageBase}/sec2-pigeons.jpg`);
        setPhotoSec2Flowers(quotesData.photo_sec2_flowers || `${storageBase}/gallery-24.jpg`);
        setPhotoSec2Run(quotesData.photo_sec2_run || `${storageBase}/sec2-run.jpg`);
        setPhotoSec3Bg(quotesData.photo_sec3_bg || `${storageBase}/sec3-bg.jpg`);
        setPhotoSec3Frame(quotesData.photo_sec3_frame || `${storageBase}/sec3-frame.png`);
        setPhotoSec3Couple(quotesData.photo_sec3_couple || `${storageBase}/sec3-couple.jpg`);

        setLocationCityForm(quotesData.location_city || "");
        setTeaserVideoUrlForm(quotesData.teaser_video_url || `${storageBase}/video-teaser.mp4`);

        // Default dining schedule (same as DiningScheduleSlide.tsx)
        const defaultDining = [
          { time: "15.00", title: "Canapés & Welcome Drinks" },
          { time: "15.20", title: "Starter Served" },
          { time: "15.45", title: "Main Course Served" },
          { time: "16.15", title: "Dessert" }
        ];
        setDiningScheduleForm(
          Array.isArray(quotesData.dining_schedule) && quotesData.dining_schedule.length > 0
            ? quotesData.dining_schedule
            : defaultDining
        );

        // Default FAQs (same as FaqSection.tsx)
        const defaultFaqs = [
          { question: "Can I arrive in the middle of the event?", answer: "We kindly recommend arriving on time, as the celebration will feature a seated set-menu dining experience served at specific times throughout the evening. Arriving late may result in missed courses." },
          { question: "Can I bring a plus one?", answer: "This is an intimate destination wedding with limited seating. Kindly note that only named guests in the invitation are included." },
          { question: "Can children attend the wedding?", answer: "To maintain the atmosphere and seating arrangements, attendance is limited to guests listed on the invitation." },
          { question: "Is there a dress code?", answer: "Guests are welcome to wear any style or color they feel comfortable in, as long as it is appropriate for the occasion. We kindly ask guests to avoid white, cream, or overly bright/light colors, and encourage darker tones instead." },
          { question: "Can I choose my seat/table?", answer: "Seating has been thoughtfully arranged by the couple and families. Your assigned table information will be available upon arrival." }
        ];
        setFaqsForm(
          Array.isArray(quotesData.faqs) && quotesData.faqs.length > 0
            ? quotesData.faqs
            : defaultFaqs
        );

        const rundown = quotesData.rundown && Array.isArray(quotesData.rundown)
          ? quotesData.rundown
          : [
              { time: "10.00 - 11.00", title: "Akad Nikah", icon: "rundown-rings.png" },
              { time: "11.00 - 11.30", title: "Welcoming Guest & Lunch", icon: "rundown-table.png" },
              { time: "11.30 - 12.00", title: "Bride & Groom Entrance", icon: "rundown-doves.png" },
              { time: "12.00 - 12.15", title: "Speech & Toast", icon: "rundown-toast.png" },
              { time: "12.15 - 13.00", title: "Photo Session", icon: "rundown-camera.png" },
              { time: "13.00 - selesai", title: "Closing", icon: "rundown-hands.png" }
            ];
        setRundownItemsForm(rundown);

        // Handle gallery photos
        const gallery = projectData.gallery_photos && Array.isArray(projectData.gallery_photos)
          ? projectData.gallery_photos.map((p: any) => typeof p === 'string' ? p : p?.url || p?.public_url).filter(Boolean)
          : [];
        setGalleryPhotosForm(gallery);

        const accounts = projectData.payment_accounts && Array.isArray(projectData.payment_accounts) && projectData.payment_accounts.length > 0
          ? projectData.payment_accounts
          : [
              { bank_name: "BRI", bank_account: "125101001997509", owner_name: "M LUQMAN FIKRI" },
              { bank_name: "BCA", bank_account: "0131800826", owner_name: "JOVITA LOLA EDRIA" }
            ];
        setPaymentAccounts(accounts);

        try {
          if (projectData.love_story) {
            const status = JSON.parse(projectData.love_story);
            setBotStatus(status);
          } else {
            setBotStatus({ status: 'disconnected' });
          }
        } catch (e) {
          setBotStatus({ status: 'disconnected' });
        }
        
        const bName = projectData.bride_name || "Bride";
        const gName = projectData.groom_name || "Groom";
        const bNick = projectData.bride_nickname || "Bride";
        const gNick = projectData.groom_nickname || "Groom";

        setMessageTemplate("");
      }

      // 2. Fetch guests (safe from missing table error)
      let guestsData: any[] = [];
      try {
        const { data: gData, error: gError } = await supabase
          .from('guests')
          .select('*')
          .eq('project_id', projectId);
        if (!gError && gData) {
          guestsData = gData;
        } else if (gError && gError.code !== 'PGRST205') {
          console.error("Error fetching guests:", gError);
        }
      } catch (e) {
        console.error("Failed to query guests table:", e);
      }

      // 3. Fetch rsvp
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp')
        .select('*')
        .eq('project_id', projectId);

      if (rsvpError) {
        console.error("Error fetching RSVP:", rsvpError);
      }

      // 4. Fetch checkins (disabled check-in database query, return empty array)
      const checkinsData: any[] = [];

      // 5. Merge data
      const rsvpMap = new Map<string, any>();
      const rsvpByNameMap = new Map<string, any>();
      const rsvpByPhoneMap = new Map<string, any>();

      (rsvpData || []).forEach(r => {
        if (r.guest_id) {
          rsvpMap.set(r.guest_id, r);
        } else {
          if (r.guest_name) {
            rsvpByNameMap.set(r.guest_name.toLowerCase().trim(), r);
          }
          if (r.guest_phone) {
            rsvpByPhoneMap.set(r.guest_phone.trim(), r);
          }
        }
      });

      const checkinsMap = new Map<string, any>();
      (checkinsData || []).forEach(c => {
        if (c.guest_id) {
          checkinsMap.set(c.guest_id, c);
        }
      });

      const mergedRSVPs: RSVPData[] = [];
      const matchedRsvpIds = new Set<string>();

      (guestsData || []).forEach(g => {
        let rsvp = rsvpMap.get(g.id);
        if (!rsvp && g.name) {
          rsvp = rsvpByNameMap.get(g.name.toLowerCase().trim());
        }
        if (!rsvp && g.phone) {
          rsvp = rsvpByPhoneMap.get(g.phone.trim());
        }

        if (rsvp) {
          matchedRsvpIds.add(rsvp.id);
        }
        const checkin = checkinsMap.get(g.id);

        mergedRSVPs.push({
          id: g.id,
          rsvp_id: rsvp?.id,
          name: g.name,
          isAttending: rsvp ? (rsvp.attendance === 'hadir') : false,
          guestsCount: rsvp ? rsvp.pax : 0,
          actualGuestsCount: checkin ? parseInt(checkin.notes || '1', 10) : undefined,
          checkedIn: !!checkin,
          checkedInAt: checkin ? new Date(checkin.checked_in_at) : null,
          phone: rsvp?.guest_phone || g.phone || "",
          wishes: rsvp?.message || "",
          createdAt: rsvp ? new Date(rsvp.submitted_at) : new Date(g.created_at)
        });
      });

      // Add unmatched RSVP submissions
      (rsvpData || []).forEach(r => {
        if (r.guest_id) {
          matchedRsvpIds.add(r.id);
        }
        if (!matchedRsvpIds.has(r.id)) {
          mergedRSVPs.push({
            id: r.id,
            rsvp_id: r.id,
            name: r.guest_name || "Guest",
            isAttending: r.attendance === 'hadir',
            guestsCount: r.pax,
            actualGuestsCount: undefined,
            checkedIn: false,
            checkedInAt: null,
            phone: r.guest_phone || "",
            wishes: r.message || "",
            createdAt: r.submitted_at ? new Date(r.submitted_at) : new Date()
          });
        }
      });

      // Sort by createdAt desc
      mergedRSVPs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setRsvps(mergedRSVPs);

      // 6. Fetch gifts
      const { data: giftsData } = await supabase
        .from('gift_registry')
        .select('*')
        .eq('project_id', projectId);

      const mappedGifts = (giftsData || []).map(gift => ({
        id: gift.id,
        name: gift.name,
        price: gift.price ? gift.price.toLocaleString('id-ID') : '0',
        image: gift.image_url || '',
        link: gift.link || '',
        originalPrice: gift.original_price ? gift.original_price.toLocaleString('id-ID') : '',
        discount: gift.discount_label || '',
        isBought: gift.is_bought
      }));
      setGifts(mappedGifts);

      // 7. Fetch stories
      const { data: storyData } = await supabase
        .from('love_story_items')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      const mappedStory = (storyData || []).map(event => ({
        id: event.id,
        year: event.year,
        title: event.title,
        desc: event.description,
        order: event.sort_order
      }));
      setStoryEvents(mappedStory);

      const isLaceEnvelop = projectData?.template_id === 'f93ad18d-cba2-4de0-a86b-b1fadf2783a1' || projectData?.project_name?.includes('lace-envelop');
      if (isLaceEnvelop) {
        const hasRawLoveStory = projectData?.love_story && !projectData.love_story.trim().startsWith('{');
        if (hasRawLoveStory) {
          setSingleLoveStoryText(projectData.love_story);
        } else if (mappedStory.length > 0) {
          setSingleLoveStoryText(mappedStory[0].desc || "");
        }
      }

      // 7.5 Fetch project events
      const { data: eventsData } = await supabase
        .from('project_events')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });
      setWeddingEvents(eventsData || []);

      // 8. Fetch wa_blast_logs queue
      const { data: queueData } = await supabase
        .from('wa_blast_logs')
        .select('phone')
        .eq('project_id', projectId)
        .eq('status', 'queued');

      const activePhones = new Set<string>();
      (queueData || []).forEach(item => {
        if (item.phone) {
          activePhones.add(item.phone.trim());
        }
      });
      setQueuedPhones(activePhones);

      // 9. Fetch wa_blast_logs history (safe from missing table error)
      let logsData: any[] = [];
      try {
        const { data: lData, error: lError } = await supabase
          .from('wa_blast_logs')
          .select('*, guests(name)')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(30);
        if (!lError && lData) {
          logsData = lData;
        } else if (lError && lError.code !== 'PGRST205') {
          console.error("Error fetching wa_blast_logs:", lError);
        }
      } catch (e) {
        console.error("Failed to query wa_blast_logs table:", e);
      }
      setBlastLogs(logsData);

    } catch (error) {
      console.error("Firestore RSVP Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlastLogs = async () => {
    try {
      const { data: lData, error: lError } = await supabase
        .from('wa_blast_logs')
        .select('*, guests(name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!lError && lData) {
        setBlastLogs(lData);
      } else if (lError && lError.code !== 'PGRST205') {
        console.error("Error fetching blast logs:", lError);
      }
    } catch (err) {
      console.error("Error fetching blast logs:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // Enable Supabase Realtime Channels
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rsvp' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => {
          const newProj = payload.new as any;
          try {
            if (newProj && newProj.love_story) {
              const status = JSON.parse(newProj.love_story);
              setBotStatus(status);
            } else {
              setBotStatus({ status: 'disconnected' });
            }
          } catch (e) {
            setBotStatus({ status: 'disconnected' });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wa_blast_logs', filter: `project_id=eq.${projectId}` },
        () => {
          fetchBlastLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  // Fallback Polling for Bot Status when it is in loading or qr state
  useEffect(() => {
    if (!projectId) return;
    if (botStatus?.status !== 'loading' && botStatus?.status !== 'qr') return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('love_story')
          .eq('id', projectId)
          .maybeSingle();

        if (error) throw error;
        if (data && data.love_story) {
          const status = JSON.parse(data.love_story);
          if (status.status !== botStatus.status || status.qr !== botStatus.qr) {
            console.log("Polling updated bot status to:", status.status);
            setBotStatus(status);
          }
        }
      } catch (err) {
        console.error("Error polling bot status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [projectId, botStatus?.status, botStatus?.qr]);

  // Auth & Plan Check Effect
  useEffect(() => {
    const checkAuthAndPlan = async () => {
      try {
        // Fetch project plan using server admin API to bypass RLS
        const planRes = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_project_plan',
            payload: { project_id: projectId }
          })
        });

        if (planRes.ok) {
          const { data } = await planRes.json();
          if (data) {
            setDbPassword(data.password_dashboard || "serastory");
            if (data.subscriptions?.packages?.name?.toLowerCase() === 'basic') {
              setIsBasicPlan(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking plan/password:", error);
      } finally {
        setIsCheckingAuth(false);
        setCheckingPlan(false);
      }
    };

    checkAuthAndPlan();
  }, [projectId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === dbPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password!");
      setPasswordInput("");
    }
  };

  const getGuestLink = (guestName: string, guestId?: string) => {
    const baseLink = typeof window !== 'undefined' ? window.location.origin : '';
    // Find invitation slug if matching guest exists
    const matchingRsvp = rsvps.find(r => r.name.toLowerCase() === guestName.toLowerCase() || r.id === guestId);
    
    // We will fallback to raw guestName if slug not available
    const pathSegment = guestId || encodeURIComponent(guestName.trim().toUpperCase());
    return `${baseLink}/${pathSegment}`;
  };

  const renderMessage = (template: string, name: string) => {
    const link = getGuestLink(name);
    return template
      .replace(/\[wedding link\]/g, link)
      .replace(/\[guest name\]/g, name.trim().toUpperCase())
      .replace(/\[nama\]/g, name.trim().toUpperCase());
  };

  const copyToClipboard = (text: string, msg: string = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text).then(() => {
      alert(msg);
    }).catch(err => {
      console.error("Failed to copy:", err);
      alert("Failed to copy text.");
    });
  };

  const copyAllLinks = () => {
    const validGuests = blastGuests.filter(g => g.name.trim() !== "");
    if (validGuests.length === 0) return;
    const textToCopy = validGuests.map(g => `${g.name.trim().toUpperCase()}:\n${getGuestLink(g.name)}`).join('\n\n');
    copyToClipboard(textToCopy, "All wedding links copied to clipboard!");
  };

  const sendWhatsAppBlast = async (name: string, phone: string, index: number) => {
    if (!phone || phone.trim() === "") {
      alert("WhatsApp phone number is required.");
      return;
    }
    
    try {
      const message = renderMessage(messageTemplate, name);
      
      const updated = [...blastGuests];
      updated[index].status = 'queued';
      setBlastGuests(updated);

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'queue_blast',
          payload: {
            project_id: projectId,
            blasts: [{
              phone: phone.trim(),
              message: message,
              guest_id: null
            }]
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to queue blast');
      }

      setQueuedPhones(prev => {
        const next = new Set(prev);
        next.add(phone.trim());
        return next;
      });

      alert(`Pesan untuk ${name} masuk antrian blast.`);
    } catch (err) {
      console.error(err);
      const updated = [...blastGuests];
      updated[index].status = 'error';
      setBlastGuests(updated);
      alert(`Failed to queue message: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const sendAllBlasts = async () => {
    const validGuests = blastGuests
      .map((g, idx) => ({ ...g, originalIdx: idx }))
      .filter(g => {
        const cleanPhone = g.phone.replace(/[^0-9]/g, '');
        const isPhoneValid = cleanPhone.length >= 10 && cleanPhone.length <= 15 && (cleanPhone.startsWith('62') || cleanPhone.startsWith('08') || cleanPhone.startsWith('0'));
        return g.name.trim() !== "" && isPhoneValid && !queuedPhones.has(g.phone.trim());
      });

    if (validGuests.length === 0) {
      alert("No valid guests with name and phone number to blast.");
      return;
    }

    const confirmBlast = window.confirm(`Are you sure you want to send invitations to ${validGuests.length} guests?`);
    if (!confirmBlast) return;

    const updated = [...blastGuests];

    validGuests.forEach(g => {
      updated[g.originalIdx].status = 'queued';
    });
    setBlastGuests(updated);

    try {
      const blastsData = validGuests.map((g) => {
        const message = renderMessage(messageTemplate, g.name);
        return {
          phone: g.phone.trim(),
          message: message,
          guest_id: null
        };
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'queue_blast',
          payload: {
            project_id: projectId,
            blasts: blastsData
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to queue blasts');
      }

      setQueuedPhones(prev => {
        const next = new Set(prev);
        validGuests.forEach(g => next.add(g.phone.trim()));
        return next;
      });

      alert(`Successfully queued ${validGuests.length} invitations to the WhatsApp Bot queue!`);
    } catch (err) {
      console.error("Error blasting all:", err);
      alert("Failed to queue some invitations. Please check the logs.");
    }
  };

  const handleBatchImport = async () => {
    let lines: string[] = [];

    if (importSheetUrl.trim()) {
      try {
        const res = await fetch(`/api/proxy-sheet?url=${encodeURIComponent(importSheetUrl)}`);
        if (!res.ok) {
          const errData = await res.json();
          alert(errData.error || "Failed to fetch from Google Sheets");
          return;
        }
        const csvText = await res.text();
        lines = csvText.split(/\r?\n/);
        // Remove header if it looks like one
        if (lines.length > 0 && (lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("nama"))) {
          lines.shift();
        }
      } catch (err) {
        alert("Network error trying to fetch Google Sheets.");
        return;
      }
    } else if (importText.trim()) {
      lines = importText.split("\n");
    } else {
      return;
    }
    
    const parsed: { name: string; phone: string; botSession: string; status: 'idle' }[] = [];
    
    lines.forEach(line => {
      if (!line.trim()) return;
      
      let parts: string[] = [];
      if (importSheetUrl.trim()) {
        // Simple CSV parse
        parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
      } else {
        parts = line.split(/[,\t;]+/);
        if (parts.length < 2) {
          const match = line.trim().match(/^(.*?)\s+([\d+-\s]+)$/);
          if (match) {
            parts = [match[1], match[2]];
          }
        }
      }
      
      let name = "";
      let phone = "";
      
      if (importSheetUrl.trim()) {
        name = parts[1]?.trim() || "";
        phone = parts[2]?.trim() || "";
      } else {
        name = parts[0]?.trim() || "";
        phone = parts[1]?.trim() || "";
      }
      
      phone = phone.replace(/[\s\-\(\)]/g, "");
      
      if (name) {
        parsed.push({
          name: name,
          phone: phone,
          botSession: '1',
          status: 'idle'
        });
      }
    });

    if (parsed.length > 0) {
      const currentFiltered = blastGuests.filter(g => g.name.trim() !== "" || g.phone.trim() !== "");
      setBlastGuests([...currentFiltered, ...parsed]);
      setShowImportModal(false);
      setImportText("");
      setImportSheetUrl("");
      alert(`Successfully imported ${parsed.length} guests!`);
    } else {
      alert("Could not parse any valid names from the input. Make sure the format is 'Name, Phone'.");
    }
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryYear || !newStoryTitle || !newStoryDesc || !newStoryOrder) {
      alert("Please fill all fields");
      return;
    }
    
    setIsAddingStory(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_story',
          payload: {
            project_id: projectId,
            year: newStoryYear,
            title: newStoryTitle,
            description: newStoryDesc,
            sort_order: parseInt(newStoryOrder, 10)
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add story event');
      }

      setNewStoryYear("");
      setNewStoryTitle("");
      setNewStoryDesc("");
      setNewStoryOrder("");
      await fetchData();
      alert("Story event added successfully!");
    } catch (error) {
      console.error("Error adding story event:", error);
      alert("Failed to add story event.");
    } finally {
      setIsAddingStory(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_story',
            payload: { id }
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete event');
        }
        await fetchData();
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event.");
      }
    }
  };

  const handleSaveSingleLoveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLoveStory(true);
    try {
      // 1. Delete all existing love story items for this project
      const { error: deleteError } = await supabase
        .from('love_story_items')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) throw deleteError;

      // 2. Insert a single new item with the textarea content
      const { error: insertError } = await supabase
        .from('love_story_items')
        .insert({
          project_id: projectId,
          year: "",
          title: "Love Story",
          description: singleLoveStoryText,
          sort_order: 1
        });

      if (insertError) throw insertError;

      alert("Love Story updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error saving love story:", error);
      alert("Failed to save love story: " + error.message);
    } finally {
      setIsSavingLoveStory(false);
    }
  };

  const handleSaveCover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const formattedCountdown = countdownTargetForm && !countdownTargetForm.includes('+') && !countdownTargetForm.endsWith('Z')
        ? `${countdownTargetForm}:00+00:00`
        : countdownTargetForm;

      const quotesJSON = JSON.stringify({
        quote_arabic: quoteArabicForm, quote_translation: quoteTranslationForm, quote_source: quoteSourceForm,
        photo_sec2_dance: photoSec2Dance, photo_sec2_pigeons: photoSec2Pigeons, photo_sec2_flowers: photoSec2Flowers, photo_sec2_run: photoSec2Run,
        photo_sec3_bg: photoSec3Bg, photo_sec3_frame: photoSec3Frame, photo_sec3_couple: photoSec3Couple,
        rundown: rundownItemsForm, location_city: locationCityForm, teaser_video_url: teaserVideoUrlForm,
        dining_schedule: diningScheduleForm, faqs: faqsForm
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_details',
          payload: {
            project_id: projectId,
            wedding_fields: {
              wedding_date: weddingDateForm,
              countdown_target: formattedCountdown,
              music_url: musicUrlForm,
              cover_photo_url: coverPhotoUrlForm,
              opening_photo_url: openingPhotoUrlForm,
              hashtag: hashtagForm,
              wishlist_note: quotesJSON
            }
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Cover details');
      }

      alert("Cover & Opening section updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save cover: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const quotesJSON = JSON.stringify({
        quote_arabic: quoteArabicForm,
        quote_translation: quoteTranslationForm,
        quote_source: quoteSourceForm,
        photo_sec2_dance: photoSec2Dance,
        photo_sec2_pigeons: photoSec2Pigeons,
        photo_sec2_flowers: photoSec2Flowers,
        photo_sec2_run: photoSec2Run,
        photo_sec3_bg: photoSec3Bg,
        photo_sec3_frame: photoSec3Frame,
        photo_sec3_couple: photoSec3Couple,
        rundown: rundownItemsForm,
        location_city: locationCityForm,
        teaser_video_url: teaserVideoUrlForm,
        dining_schedule: diningScheduleForm,
        faqs: faqsForm
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_details',
          payload: {
            project_id: projectId,
            wedding_fields: {
              wishlist_note: quotesJSON
            }
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Verse details');
      }

      alert("Quote & Verse section updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save Verse: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveRundown = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const quotesJSON = JSON.stringify({
        quote_arabic: quoteArabicForm,
        quote_translation: quoteTranslationForm,
        quote_source: quoteSourceForm,
        photo_sec2_dance: photoSec2Dance,
        photo_sec2_pigeons: photoSec2Pigeons,
        photo_sec2_flowers: photoSec2Flowers,
        photo_sec2_run: photoSec2Run,
        photo_sec3_bg: photoSec3Bg,
        photo_sec3_frame: photoSec3Frame,
        photo_sec3_couple: photoSec3Couple,
        rundown: rundownItemsForm,
        location_city: locationCityForm,
        teaser_video_url: teaserVideoUrlForm,
        dining_schedule: diningScheduleForm,
        faqs: faqsForm
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_details',
          payload: {
            project_id: projectId,
            wedding_fields: {
              wishlist_note: quotesJSON
            }
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Rundown details');
      }

      alert("Rundown updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save Rundown: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_details',
          payload: {
            project_id: projectId,
            wedding_fields: {
              bride_name: brideNameForm,
              bride_nickname: brideNicknameForm,
              bride_father: brideFatherForm,
              bride_mother: brideMotherForm,
              bride_instagram: brideInstagramForm,
              bride_photo_url: bridePhotoUrlForm,
              groom_name: groomNameForm,
              groom_nickname: groomNicknameForm,
              groom_father: groomFatherForm,
              groom_mother: groomMotherForm,
              groom_instagram: groomInstagramForm,
              groom_photo_url: groomPhotoUrlForm,
            }
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Couple details');
      }

      alert("Mempelai (Couple) section updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save Couple: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveEvents = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_details',
          payload: {
            project_id: projectId,
            project_fields: {
              venue_name: venueNameForm,
              venue_address: venueAddressForm,
              venue_maps_url: venueMapsUrlForm,
            },
            events: weddingEvents.map(ev => ({
              id: ev.id,
              custom_label: ev.custom_label,
              event_date: ev.event_date,
              event_time: ev.event_time,
              end_time: ev.end_time,
              venue_name: ev.venue_name,
              venue_address: ev.venue_address,
              venue_maps_url: ev.venue_maps_url
            }))
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Events details');
      }

      alert("Events & Location section updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save Events: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_details',
          payload: {
            project_id: projectId,
            wedding_fields: {
              gallery_photos: galleryPhotosForm
            }
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Gallery');
      }

      alert("Gallery section updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save Gallery: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveCashless = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      const cleanAccounts = paymentAccounts.filter(acc => acc.bank_name || acc.bank_account || acc.owner_name);
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_payment_accounts',
          payload: {
            project_id: projectId,
            payment_accounts: cleanAccounts
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update Cashless');
      }

      alert("Amplop Digital (Cashless) updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save Cashless: " + (error.message || String(error)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large. Max size is 15MB.");
      return;
    }

    setIsUploadingPhoto(fieldName);
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_image',
          payload: {
            project_id: projectId,
            file: base64String,
            fileName: file.name,
            fileType: file.type
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload file');
      }

      const data = await res.json();
      if (fieldName === 'bride_photo_url') setBridePhotoUrlForm(data.url);
      else if (fieldName === 'groom_photo_url') setGroomPhotoUrlForm(data.url);
      else if (fieldName === 'cover_photo_url') setCoverPhotoUrlForm(data.url);
      else if (fieldName === 'opening_photo_url') setOpeningPhotoUrlForm(data.url);
      else if (fieldName === 'photo_sec2_dance') setPhotoSec2Dance(data.url);
      else if (fieldName === 'photo_sec2_pigeons') setPhotoSec2Pigeons(data.url);
      else if (fieldName === 'photo_sec2_flowers') setPhotoSec2Flowers(data.url);
      else if (fieldName === 'photo_sec2_run') setPhotoSec2Run(data.url);
      else if (fieldName === 'photo_sec3_bg') setPhotoSec3Bg(data.url);
      else if (fieldName === 'photo_sec3_frame') setPhotoSec3Frame(data.url);
      else if (fieldName === 'photo_sec3_couple') setPhotoSec3Couple(data.url);
      else if (fieldName === 'music_url') setMusicUrlForm(data.url);

      alert("File uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message || String(err)}`);
    } finally {
      setIsUploadingPhoto(null);
    }
  };

  const handleSavePaymentAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPaymentAccounts(true);
    try {
      const cleanAccounts = paymentAccounts.filter(acc => acc.bank_name || acc.bank_account || acc.owner_name);

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_payment_accounts',
          payload: {
            project_id: projectId,
            payment_accounts: cleanAccounts
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update bank accounts');
      }

      alert("Bank accounts updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error saving bank accounts:", error);
      alert("Failed to save bank accounts: " + error.message);
    } finally {
      setIsSavingPaymentAccounts(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (newPassword.length < 5) {
      alert("Password must be at least 5 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          payload: {
            project_id: projectId,
            password: newPassword
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to change password');
      }

      setDbPassword(newPassword);
      alert("Password successfully changed!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isCheckingAuth || checkingPlan) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 animate-spin"></div>
      </div>
    );
  }

  if (isBasicPlan) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-red-100/30 blur-[120px] animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] border border-white/80 shadow-2xl relative z-10 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-serif tracking-tight text-neutral-800 mb-2">Dashboard Dinonaktifkan</h1>
            <p className="text-xs font-serif tracking-[0.2em] text-red-500/80 uppercase">Fitur Tidak Tersedia</p>
          </div>

          <p className="text-sm text-neutral-500 leading-relaxed font-sans mb-8">
            Fitur dashboard pengelolaan tamu dan RSVP tidak tersedia untuk paket **Basic**. Silakan hubungi administrator atau lakukan upgrade paket untuk mengakses fitur ini.
          </p>

          <a
            href="https://serastory.com"
            className="inline-block text-xs font-semibold tracking-widest text-neutral-500 hover:text-neutral-900 uppercase transition-colors hover:underline"
          >
            Sera Story
          </a>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-amber-100/30 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-emerald-50/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] border border-white/80 shadow-2xl relative z-10 text-center"
        >
          <div className="mb-8">
            <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase mb-3">Restricted Access</h2>
            <h1 className="text-3xl font-serif tracking-tight text-neutral-800">Management <span className="italic text-neutral-400">Suite</span></h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white/80 border border-neutral-200 pl-5 pr-14 py-4 rounded-xl text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-900 placeholder:text-neutral-300"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-[1px] bg-neutral-300"></div>
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black tracking-[0.4em] uppercase text-neutral-400 mb-1">Developed By</span>
                <span className="text-xs font-serif font-black tracking-[0.2em] text-neutral-800">SERA STORY</span>
              </div>
              <div className="w-8 h-[1px] bg-neutral-300"></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Max size is 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_image',
          payload: {
            project_id: projectId,
            file: base64String,
            fileName: file.name,
            fileType: file.type
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image');
      }

      const data = await res.json();
      if (isEditMode && editingGift) {
        setEditingGift({ ...editingGift, image: data.url });
      } else {
        setNewGift({ ...newGift, image: data.url });
      }
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleToggleBot = async (action: 'login' | 'logout') => {
    setIsChangingBot(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_bot',
          payload: {
            project_id: projectId,
            status: 'loading',
            action: action
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update bot command');
      }

      setBotStatus(prev => ({ ...prev, status: 'loading' }));
    } catch (err) {
      console.error(err);
      alert(`Operation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsChangingBot(false);
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGift.name || !newGift.image) return;
    setIsAddingGift(true);

    const originalVal = parseInt(newGift.price.replace(/[^0-9]/g, ''));
    if (isNaN(originalVal)) {
      alert("Invalid price value");
      setIsAddingGift(false);
      return;
    }

    let finalPrice = originalVal;
    let originalPriceVal: number | null = null;
    let discountLabelStr = "";

    if (newGift.discount) {
      const discVal = parseInt(newGift.discount.replace(/[^0-9]/g, ''));
      if (!isNaN(discVal) && discVal > 0 && discVal <= 100) {
        finalPrice = originalVal - (originalVal * discVal / 100);
        originalPriceVal = originalVal;
        discountLabelStr = `${discVal}% OFF`;
      }
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_gift',
          payload: {
            project_id: projectId,
            name: newGift.name,
            price: finalPrice,
            original_price: originalPriceVal,
            discount_label: discountLabelStr,
            image_url: newGift.image
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add gift');
      }

      setNewGift({ name: "", price: "", image: "", link: "", originalPrice: "", discount: "" });
      setShowAddGiftModal(false);
      await fetchData();
      alert("Gift added successfully!");
    } catch (error) {
      console.error("Error adding gift:", error);
      alert("Failed to add gift.");
    } finally {
      setIsAddingGift(false);
    }
  };

  const handleUpdateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGift) return;
    setIsUpdatingGift(true);

    const originalVal = parseInt(editingGift.price.replace(/[^0-9]/g, ''));
    if (isNaN(originalVal)) {
      alert("Invalid price value");
      setIsUpdatingGift(false);
      return;
    }

    let finalPrice = originalVal;
    let originalPriceVal: number | null = null;
    let discountLabelStr = "";

    if (editingGift.discount) {
      const discVal = parseInt(editingGift.discount.replace(/[^0-9]/g, ''));
      if (!isNaN(discVal) && discVal > 0 && discVal <= 100) {
        finalPrice = originalVal - (originalVal * discVal / 100);
        originalPriceVal = originalVal;
        discountLabelStr = `${discVal}% OFF`;
      }
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_gift',
          payload: {
            id: editingGift.id,
            name: editingGift.name,
            price: finalPrice,
            original_price: originalPriceVal,
            discount_label: discountLabelStr,
            image_url: editingGift.image
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update gift');
      }

      setEditingGift(null);
      await fetchData();
      alert("Gift updated successfully!");
    } catch (error) {
      console.error("Error updating gift:", error);
      alert("Failed to update gift.");
    } finally {
      setIsUpdatingGift(false);
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_gift',
          payload: { id }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete gift');
      }
      await fetchData();
    } catch (error) {
      console.error("Error deleting gift:", error);
    }
  };

  const toggleBought = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_gift',
          payload: {
            id,
            is_bought: !currentStatus
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update status');
      }
      await fetchData();
    } catch (error) {
      console.error("Error updating gift status:", error);
    }
  };

  const handleDeleteWish = async (id: string, wishIndex?: number) => {
    if (!confirm("Are you sure you want to delete this wish?")) return;
    try {
      const item = rsvps.find(r => r.id === id || r.rsvp_id === id);
      const rsvpId = item?.rsvp_id;
      const guestId = item?.id;

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_wish',
          payload: {
            project_id: projectId,
            id: guestId,
            rsvp_id: rsvpId,
            name: item?.name
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete wish');
      }

      await fetchData();
      setSelectedWish(null);
      alert("Wish deleted successfully!");
    } catch (error) {
      console.error("Error deleting wish:", error);
      alert("Failed to delete wish.");
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(date);
  };

  const totalGuests = rsvps.length;
  const totalGroupsAttending = rsvps.filter(r => r.rsvp_id && r.isAttending).length;
  const totalGroupsDeclined = rsvps.filter(r => r.rsvp_id && !r.isAttending).length;
  const totalGroupsPending = rsvps.filter(r => !r.rsvp_id).length;
  const totalAttendingPax = rsvps.filter(r => r.isAttending).reduce((sum, r) => sum + r.guestsCount, 0);
  const totalResponded = totalGroupsAttending + totalGroupsDeclined;
  const responsePercentage = totalGuests > 0 ? Math.round((totalResponded / totalGuests) * 100) : 0;

  const sortedRsvps = [...rsvps]
    .filter(rsvp => {
      const matchesSearch = rsvp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || (filterStatus === "attending" && rsvp.isAttending) || (filterStatus === "declined" && !rsvp.isAttending);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      if (sortConfig.key === 'actualGuestsCount') {
        valA = a.actualGuestsCount !== undefined ? a.actualGuestsCount : (a.checkedIn ? a.guestsCount : 0);
        valB = b.actualGuestsCount !== undefined ? b.actualGuestsCount : (b.checkedIn ? b.guestsCount : 0);
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredRsvps = sortedRsvps;

  const requestSort = (key: 'name' | 'guestsCount' | 'actualGuestsCount') => {
    let direction: 'asc' | 'desc' = 'asc';
    let newKey: 'name' | 'guestsCount' | 'actualGuestsCount' | null = key;

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else {
        newKey = null;
      }
    }
    setSortConfig({ key: newKey, direction });
  };

  const getBotStatus = (sessionId: string) => {
    const stat = botStatuses[`Session${sessionId}`];
    if (!stat || stat.status !== 'online') return '(🔴 Offline)';
    return '(🟢 Online)';
  };

  const SortIcon = ({ column }: { column: 'name' | 'guestsCount' | 'actualGuestsCount' }) => {
    if (sortConfig.key !== column) return (
      <svg className="w-3 h-3 ml-1 opacity-20 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
    );
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 ml-1 text-neutral-900 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
    ) : (
      <svg className="w-3 h-3 ml-1 text-neutral-900 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-1l-4 4m0 0l-4-4m4 4V10" /></svg>
    );
  };

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredRsvps.length / ITEMS_PER_PAGE);
  const paginatedRsvps = filteredRsvps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const coupleNicknames = project 
    ? `${project.bride_nickname || 'Bride'} & ${project.groom_nickname || 'Groom'}` 
    : 'Bride & Groom';

  const slideshowBg = project?.cover_photo_url || project?.opening_photo_url || "https://images.unsplash.com/photo-1519225495810-7517c24a2ed3?q=80&w=1920&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-24 relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100/30 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 pt-8 md:pt-12 relative z-10 space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-neutral-200/60 pb-8"
        >
          <div className="flex-1">
            <h2 className="text-[8px] md:text-[9px] font-bold tracking-[0.4em] text-neutral-400 uppercase mb-2">{coupleNicknames} Wedding</h2>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-neutral-800 leading-tight">Management <span className="italic text-neutral-400">Suite</span></h1>
            <div className="flex bg-neutral-200/40 p-1.5 rounded-2xl gap-1 mt-8 max-w-max border border-neutral-200/50">
              {[
                { id: 'rsvp', label: 'RSVP Responses' },
                { id: 'content', label: 'Content Editor' },
                { id: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-5 py-2.5 rounded-xl text-[9px] font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer ${activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-800'}`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-tab-pill"
                      className="absolute inset-0 bg-neutral-900 rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {activeTab === 'rsvp' ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
              {[
                { label: 'Total Guests', value: totalGuests, sub: 'INVITATION LIST', color: 'text-neutral-800', dark: false, percent: undefined, percentColor: undefined },
                { label: 'Attending (Hadir)', value: totalGroupsAttending, sub: 'GROUPS SAYING YES', color: 'text-emerald-600', dark: false, percent: undefined, percentColor: undefined },
                { label: 'Declined (Tidak)', value: totalGroupsDeclined, sub: 'GROUPS SAYING NO', color: 'text-rose-500', dark: false, percent: undefined, percentColor: undefined },
                { label: 'Pending Response', value: totalGroupsPending, sub: 'AWAITING RESPONSE', color: 'text-amber-600', dark: false, percent: undefined, percentColor: undefined },
                { label: 'Total Pax Attending', value: totalAttendingPax, sub: 'EXPECTED SEATS', color: 'text-neutral-800', dark: true, percent: responsePercentage, percentColor: undefined }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`${stat.dark ? 'bg-neutral-900 border-neutral-800 shadow-xl' : 'bg-white/70 backdrop-blur-md border-white/40 shadow-sm'} p-4 md:p-5 flex flex-col justify-between min-h-[100px] md:min-h-[120px] rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 group`}
                >
                  <h3 className={`text-[7px] md:text-[8px] font-bold tracking-[0.2em] uppercase flex justify-between items-center ${stat.dark ? 'text-amber-200/60' : 'text-neutral-400'}`}>
                    <span>{stat.label}</span>
                    {stat.percent !== undefined && (
                      <span className={`font-mono ${stat.dark ? 'text-amber-200' : (stat as any).percentColor || 'text-neutral-400'}`}>
                        {stat.percent}%
                      </span>
                    )}
                  </h3>
                  <div>
                    <p className={`text-xl md:text-3xl font-serif ${stat.color}`}>{stat.value}</p>
                    <p className={`text-[7px] md:text-[8px] mt-0.5 ${stat.dark ? 'text-neutral-500' : 'text-neutral-400'}`}>{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RSVP Distribution - Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-200/30 transition-all duration-1000"></div>

                <div className="mb-8 md:mb-12 relative z-10">
                  <h3 className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-neutral-400 uppercase mb-1 md:mb-2">RSVP Analytics</h3>
                  <p className="text-xl md:text-3xl font-serif text-neutral-900">Response Status Distribution</p>
                </div>

                <div className="h-56 md:h-72 w-full relative z-10 flex items-center justify-center">
                  {(() => {
                    const chartData = [
                      { name: 'Attending', value: totalGroupsAttending, fill: '#10B981' },
                      { name: 'Declined', value: totalGroupsDeclined, fill: '#EF4444' },
                      { name: 'Pending', value: totalGroupsPending, fill: '#F59E0B' }
                    ];

                    const hasData = totalGroupsAttending > 0 || totalGroupsDeclined > 0 || totalGroupsPending > 0;

                    if (!hasData) return (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <p className="text-[10px] text-neutral-300 uppercase tracking-[0.4em] font-bold">No Data Available</p>
                      </div>
                    );

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-4xl font-serif text-neutral-900">{responsePercentage}%</p>
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.2em]">Response Rate</p>
                  </div>
                </div>
              </motion.div>

              {/* RSVP Details Breakdowns */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/40 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group"
              >
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/20 blur-[60px] rounded-full -ml-16 -mb-16 group-hover:bg-emerald-200/30 transition-all duration-1000"></div>

                <div className="mb-8 md:mb-12 relative z-10">
                  <h3 className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-emerald-600/60 uppercase mb-1 md:mb-2">Guest Insight</h3>
                  <p className="text-xl md:text-3xl font-serif text-neutral-900">Attendance Details</p>
                </div>

                <div className="space-y-6 relative z-10 w-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-neutral-400 text-[9px] font-black uppercase tracking-widest">
                      <span>RSVP Progress Rate</span>
                      <span className="text-neutral-900">{totalResponded} / {totalGuests} Responses</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${responsePercentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-neutral-900 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Attending (Yes)', val: `${totalGroupsAttending} Groups (${totalAttendingPax} Pax)`, color: 'bg-emerald-500' },
                      { label: 'Declined (No)', val: `${totalGroupsDeclined} Groups`, color: 'bg-rose-500' },
                      { label: 'Pending (No Response)', val: `${totalGroupsPending} Groups`, color: 'bg-amber-500' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-white/80 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-sm font-serif text-neutral-900 font-bold">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row gap-3 mt-6 mb-5"
            >
              <div className="relative flex-1 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors z-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search guest name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md px-11 py-3 text-[13px] border border-white/60 rounded-xl outline-none focus:border-neutral-900 focus:bg-white transition-all shadow-sm focus:shadow-lg focus:shadow-black/5"
                />
              </div>
              <div className="grid grid-cols-2 md:flex gap-3">
                <div className="relative group min-w-0 md:min-w-[160px]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors z-10 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <motion.select
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-white/70 backdrop-blur-md pl-11 pr-10 py-3 text-[13px] border border-white/60 rounded-xl outline-none focus:border-neutral-900 transition-all shadow-sm cursor-pointer appearance-none bg-no-repeat"
                  >
                    <option value="all">All Status</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </motion.select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none transition-transform group-focus-within:rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                {(searchTerm || filterStatus !== 'all' || sortConfig.key) && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setSortConfig({ key: null, direction: 'asc' });
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-[9px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-neutral-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    Clear Filters
                  </motion.button>
                )}
              </div>
            </motion.div>



            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 backdrop-blur-xl overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-white/60"
            >
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-neutral-50/30 text-neutral-500 border-b border-neutral-100">
                      <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase">Status</th>
                      <th
                        className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase cursor-pointer hover:text-neutral-900 transition-colors"
                        onClick={() => requestSort('name')}
                      >
                        Guest Name <SortIcon column="name" />
                      </th>
                      <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase">Phone</th>
                      <th
                        className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase text-center cursor-pointer hover:text-neutral-900 transition-colors"
                        onClick={() => requestSort('guestsCount')}
                      >
                        Pax <SortIcon column="guestsCount" />
                      </th>
                      <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase text-right">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {loading ? (
                      <tr><td colSpan={5} className="p-16 text-center text-[10px] tracking-[0.3em] uppercase font-bold text-neutral-300 animate-pulse">Synchronizing Data...</td></tr>
                    ) : filteredRsvps.length === 0 ? (
                      <tr><td colSpan={5} className="p-16 text-center text-[10px] tracking-[0.3em] uppercase font-bold text-neutral-300">No responses found</td></tr>
                    ) : (
                      paginatedRsvps.map((rsvp, idx) => {
                        return (
                          <motion.tr
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            key={rsvp.id}
                            className={`group hover:bg-white/80 transition-all duration-300`}
                          >
                            <td className="p-6">
                              <span className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-full border transition-all ${rsvp.isAttending ? 'text-emerald-600 border-emerald-100 bg-emerald-50/50' : 'text-neutral-400 border-neutral-100 bg-neutral-50'}`}>{rsvp.isAttending ? 'Attending' : 'Declined'}</span>
                            </td>
                            <td className="p-6">
                              <div className="flex flex-col">
                                <p className="text-sm font-serif font-bold text-neutral-800 group-hover:text-black transition-colors">{rsvp.name}</p>
                                <span className="text-[8px] text-neutral-400 tracking-[0.2em] uppercase mt-0.5">Guest Registry</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="text-[11px] font-mono text-neutral-500">{rsvp.phone || '—'}</span>
                            </td>
                            <td className="p-6 text-center">
                              <span className="text-sm font-serif text-neutral-700 font-medium">{rsvp.isAttending ? rsvp.guestsCount : '—'}</span>
                            </td>
                            <td className="p-6 text-right">
                              {rsvp.wishes && rsvp.wishes !== 'Walk-in registration' ? (
                                <button onClick={() => setSelectedWish(rsvp)} className="px-5 py-2 text-[9px] font-bold tracking-[0.2em] uppercase border border-neutral-200 bg-white/50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl shadow-sm active:scale-95 cursor-pointer">Read Wish</button>
                              ) : <span className="text-[9px] text-neutral-200 tracking-widest uppercase">—</span>}
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 md:p-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/30 gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 md:px-5 md:py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-xl border border-neutral-200 text-neutral-600 hover:bg-white hover:text-neutral-900 hover:border-neutral-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-3 md:h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    <span className="hidden md:inline">Prev</span>
                  </button>

                  <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
                    <div
                      className="flex gap-1 max-w-full overflow-x-auto scrollbar-hide py-1 px-2 cursor-grab active:cursor-grabbing select-none"
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                        <button
                          key={num}
                          onClick={() => setCurrentPage(num)}
                          className={`w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center text-[10px] font-bold uppercase rounded-lg border transition-all shadow-sm cursor-pointer ${currentPage === num
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-600 hover:bg-white'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 md:px-5 md:py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-xl border border-neutral-200 text-neutral-600 hover:bg-white hover:text-neutral-900 hover:border-neutral-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="hidden md:inline">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-3 md:h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Custom Questions Answers Table */}
            {(() => {
              const isLaceEnvelop = project?.template_id === 'f93ad18d-cba2-4de0-a86b-b1fadf2783a1' || project?.project_name?.includes('lace-envelop');
              if (!isLaceEnvelop) return null;

              const rsvpResponses = rsvps.filter(r => r.rsvp_id);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 backdrop-blur-xl overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-white/60 mt-8 p-8"
                >
                  <div className="border-b border-neutral-100 pb-4 mb-6">
                    <h3 className="text-xl font-serif text-neutral-800">RSVP Custom Questions Answers</h3>
                    <p className="text-sm text-neutral-400 mt-1">Detailed answers submitted by guests for custom RSVP questions.</p>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-neutral-50/30 text-neutral-500 border-b border-neutral-100">
                          <th className="p-6 w-16 text-[9px] font-bold tracking-[0.2em] uppercase">No</th>
                          <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase">Guest Name</th>
                          <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase">{project?.question01_rsvp || "Are you coming?"}</th>
                          <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase">{project?.question02_rsvp || "Dietary Restrictions"}</th>
                          <th className="p-6 text-[9px] font-bold tracking-[0.2em] uppercase">Song Nomination</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {rsvpResponses.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-16 text-center text-[10px] tracking-[0.3em] uppercase font-bold text-neutral-300">
                              No custom responses found
                            </td>
                          </tr>
                        ) : (
                          rsvpResponses.map((r, idx) => {
                            const answer1 = r.isAttending
                              ? (project?.answer01_rsvp || "Absolutely, wouldn't miss it!")
                              : (project?.answer02_rsvp || "Sadly cannot make it");

                            const parseDietary = (msg: string) => {
                              if (!msg) return "-";
                              const match = msg.match(/Dietary:\s*(.*?)(?:\s*\|\s*Song:|$)/i);
                              if (match) {
                                const val = match[1].trim();
                                return val === "-" ? "" : val;
                              }
                              return msg;
                            };

                            const parseSong = (msg: string) => {
                              if (!msg) return "-";
                              const match = msg.match(/Song:\s*(.*)/i);
                              if (match) {
                                const val = match[1].trim();
                                return val === "-" ? "" : val;
                              }
                              return "";
                            };

                            const answer2 = parseDietary(r.wishes || "");
                            const answer3 = parseSong(r.wishes || "");

                            return (
                              <tr key={r.rsvp_id} className="group hover:bg-white/80 transition-all duration-300">
                                <td className="p-6 text-neutral-400 font-medium text-xs">{idx + 1}</td>
                                <td className="p-6 font-bold text-neutral-800 text-xs">{r.name}</td>
                                <td className="p-6">
                                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-wider uppercase inline-block border ${
                                    r.isAttending
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                      : "bg-rose-50 text-rose-700 border-rose-200/80"
                                  }`}>
                                    {answer1}
                                  </span>
                                </td>
                                <td className="p-6 text-neutral-600 font-semibold text-xs">{answer2 || "-"}</td>
                                <td className="p-6 text-neutral-600 font-semibold text-xs">{answer3 || "-"}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              );
            })()}
          </>
        ) : activeTab === 'content' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100">
              <div>
                <h3 className="text-xl font-serif text-neutral-800">Content Editor</h3>
                <p className="text-sm text-neutral-400 mt-1">Edit all wedding invitation details by section that display on the live site</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Responsive Navigation Menu */}
              <div className="col-span-1 lg:col-span-1">
                {/* Mobile / Tablet Horizontal Scroll Menu */}
                <div className="lg:hidden flex overflow-x-auto pb-4 gap-2 scrollbar-none" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                  {[
                    { id: 'cover', label: 'Cover', icon: '🌐' },
                    { id: 'couple', label: 'Mempelai', icon: '👤' },
                    { id: 'events', label: 'Lokasi', icon: '📍' },
                    { id: 'verse', label: 'Ayat', icon: '📖' },
                    { id: 'rundown', label: 'Rundown', icon: '⏰' },
                    { id: 'dining', label: 'Dining', icon: '🍽️' },
                    { id: 'faq', label: 'FAQ', icon: '❓' },
                    { id: 'story', label: 'Story', icon: '💕' },
                    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
                    { id: 'video', label: 'Teaser', icon: '🎬' },
                    { id: 'cashless', label: 'Amplop', icon: '💳' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide rounded-full border transition-all whitespace-nowrap cursor-pointer shrink-0 ${activeSection === sec.id ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-600'}`}
                    >
                      <span>{sec.icon}</span>
                      <span>{sec.label}</span>
                    </button>
                  ))}
                </div>

                {/* Desktop Sticky Sidebar */}
                <div className="hidden lg:block bg-white p-5 rounded-[2rem] border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-6 space-y-1">
                  {/* Group: Utama */}
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-3 pb-1.5">Utama</p>
                  {[
                    { id: 'cover', label: 'Cover & Opening', icon: '🌐' },
                    { id: 'couple', label: 'Mempelai', icon: '👤' },
                    { id: 'events', label: 'Acara & Lokasi', icon: '📍' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-semibold tracking-wide rounded-xl transition-all text-left cursor-pointer group ${activeSection === sec.id ? 'bg-neutral-900 text-white shadow-md shadow-black/10' : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'}`}
                    >
                      <span className={`text-sm leading-none ${activeSection === sec.id ? 'scale-110' : 'opacity-60 group-hover:opacity-100'} transition-all`}>{sec.icon}</span>
                      <span className="truncate">{sec.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-neutral-100 !my-3" />

                  {/* Group: Konten */}
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-3 pb-1.5">Konten</p>
                  {[
                    { id: 'verse', label: 'Ayat & Kutipan', icon: '📖' },
                    { id: 'rundown', label: 'Rundown Acara', icon: '⏰' },
                    { id: 'dining', label: 'Dining Schedule', icon: '🍽️' },
                    { id: 'faq', label: 'FAQ', icon: '❓' },
                    { id: 'story', label: 'Love Story', icon: '💕' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-semibold tracking-wide rounded-xl transition-all text-left cursor-pointer group ${activeSection === sec.id ? 'bg-neutral-900 text-white shadow-md shadow-black/10' : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'}`}
                    >
                      <span className={`text-sm leading-none ${activeSection === sec.id ? 'scale-110' : 'opacity-60 group-hover:opacity-100'} transition-all`}>{sec.icon}</span>
                      <span className="truncate">{sec.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-neutral-100 !my-3" />

                  {/* Group: Media */}
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-3 pb-1.5">Media</p>
                  {[
                    { id: 'gallery', label: 'Gallery Photos', icon: '🖼️' },
                    { id: 'video', label: 'Video Teaser', icon: '🎬' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-semibold tracking-wide rounded-xl transition-all text-left cursor-pointer group ${activeSection === sec.id ? 'bg-neutral-900 text-white shadow-md shadow-black/10' : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'}`}
                    >
                      <span className={`text-sm leading-none ${activeSection === sec.id ? 'scale-110' : 'opacity-60 group-hover:opacity-100'} transition-all`}>{sec.icon}</span>
                      <span className="truncate">{sec.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-neutral-100 !my-3" />

                  {/* Group: Lainnya */}
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-3 pb-1.5">Lainnya</p>
                  {[
                    { id: 'cashless', label: 'Amplop Digital', icon: '💳' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-semibold tracking-wide rounded-xl transition-all text-left cursor-pointer group ${activeSection === sec.id ? 'bg-neutral-900 text-white shadow-md shadow-black/10' : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'}`}
                    >
                      <span className={`text-sm leading-none ${activeSection === sec.id ? 'scale-110' : 'opacity-60 group-hover:opacity-100'} transition-all`}>{sec.icon}</span>
                      <span className="truncate">{sec.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content Area */}
              <div className="lg:col-span-3">
                {activeSection === 'cover' && (
                  <form onSubmit={handleSaveCover} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Cover & Opening</h4>
                      <p className="text-xs text-neutral-400 mt-1">Edit wedding date, hashtag, music background and cover photos</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Wedding Date</label>
                        <input type="date" value={weddingDateForm} onChange={(e) => setWeddingDateForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Countdown Target</label>
                        <input type="datetime-local" value={countdownTargetForm ? countdownTargetForm.split('+')[0].substring(0, 16) : ""} onChange={(e) => setCountdownTargetForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Hashtag</label>
                        <input type="text" value={hashtagForm} onChange={(e) => setHashtagForm(e.target.value)} placeholder="#WeddingCouple" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Location City (displayed on cover)</label>
                        <input type="text" value={locationCityForm} onChange={(e) => setLocationCityForm(e.target.value)} placeholder="e.g. SEMARANG" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        <p className="text-[10px] text-neutral-400 mt-1 ml-1">Override the city name shown on the invitation cover</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Background Music (BGM)</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                        {musicUrlForm ? (
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M19.952 1.351a.75.75 0 0 1 .27 1.012l-6 10.5a.75.75 0 0 1-1.077.254l-3-2.25a.75.75 0 1 1 .9-1.2l2.33 1.748 5.485-9.6a.75.75 0 0 1 1.092-.264ZM20.25 18.75a.75.75 0 0 0-.75-.75h-15a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" /></svg>
                                Music Loaded
                              </span>
                              <audio src={musicUrlForm} controls className="h-8 max-w-full" />
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400 flex-1">No audio file uploaded yet.</p>
                        )}
                        <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shrink-0">
                          {isUploadingPhoto === 'music_url' ? 'Uploading...' : 'Upload Audio File'}
                          <input type="file" accept="audio/*" onChange={(e) => handleUploadPhoto(e, 'music_url')} className="hidden" disabled={isUploadingPhoto !== null} />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-neutral-100">
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Opening Cover Photo</label>
                        <div className="flex items-center gap-4">
                          {openingPhotoUrlForm && (
                            <div className="relative w-36 h-24 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                              <img src={openingPhotoUrlForm} onClick={() => setActivePreviewImage(openingPhotoUrlForm)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Opening preview" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                              {isUploadingPhoto === 'opening_photo_url' ? 'Uploading...' : 'Upload Image'}
                              <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'opening_photo_url')} className="hidden" disabled={isUploadingPhoto !== null} />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Main Cover Photo</label>
                        <div className="flex items-center gap-4">
                          {coverPhotoUrlForm && (
                            <div className="relative w-36 h-24 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                              <img src={coverPhotoUrlForm} onClick={() => setActivePreviewImage(coverPhotoUrlForm)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Cover preview" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                              {isUploadingPhoto === 'cover_photo_url' ? 'Uploading...' : 'Upload Image'}
                              <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'cover_photo_url')} className="hidden" disabled={isUploadingPhoto !== null} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Cover Section'}
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'verse' && (
                  <form onSubmit={handleSaveVerse} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Ayat & Kutipan (Quote)</h4>
                      <p className="text-xs text-neutral-400 mt-1">Configure Quranic, Biblical or other holy verses/quotes and edit section photos</p>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Quote Arabic / Original</label>
                      <textarea rows={2} value={quoteArabicForm} onChange={(e) => setQuoteArabicForm(e.target.value)} placeholder="Arabic text..." className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 text-right font-serif" />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Quote Translation</label>
                      <textarea rows={3} value={quoteTranslationForm} onChange={(e) => setQuoteTranslationForm(e.target.value)} placeholder="Translation..." className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Quote Source</label>
                      <input type="text" value={quoteSourceForm} onChange={(e) => setQuoteSourceForm(e.target.value)} placeholder="e.g. — QS. Ar-Rum: 21" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                    </div>

                    {/* Photo uploaders for Quote & Verse */}
                    <div className="border-t border-neutral-100 pt-6 space-y-6">
                      <h5 className="text-sm font-serif text-neutral-800 uppercase tracking-wide">Section Photos</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quote Section Photos */}
                        <div className="space-y-4">
                          <h6 className="text-[10px] font-bold tracking-[0.15em] text-neutral-400 uppercase">Quote Slide Photos</h6>
                          
                          {/* 1. Dance Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Top-Left Photo (Dance)</label>
                            <div className="flex items-center gap-4">
                              {photoSec2Dance && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec2Dance} onClick={() => setActivePreviewImage(photoSec2Dance)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Dance preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec2_dance' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec2_dance')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 2. Pigeons Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Top-Right Photo (Pigeons)</label>
                            <div className="flex items-center gap-4">
                              {photoSec2Pigeons && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec2Pigeons} onClick={() => setActivePreviewImage(photoSec2Pigeons)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Pigeons preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec2_pigeons' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec2_pigeons')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 3. Flowers Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Bottom-Left Photo (Feet/Shoes)</label>
                            <div className="flex items-center gap-4">
                              {photoSec2Flowers && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec2Flowers} onClick={() => setActivePreviewImage(photoSec2Flowers)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Flowers preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec2_flowers' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec2_flowers')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 4. Run Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Bottom-Right Photo (Walking Couple)</label>
                            <div className="flex items-center gap-4">
                              {photoSec2Run && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec2Run} onClick={() => setActivePreviewImage(photoSec2Run)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Run preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec2_run' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec2_run')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Verse Section Photos */}
                        <div className="space-y-4">
                          <h6 className="text-[10px] font-bold tracking-[0.15em] text-neutral-400 uppercase">Verse Slide Photos</h6>

                          {/* 5. Background Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Background Photo</label>
                            <div className="flex items-center gap-4">
                              {photoSec3Bg && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec3Bg} onClick={() => setActivePreviewImage(photoSec3Bg)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Background preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec3_bg' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec3_bg')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 6. Frame Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Silver Platter Frame</label>
                            <div className="flex items-center gap-4">
                              {photoSec3Frame && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec3Frame} onClick={() => setActivePreviewImage(photoSec3Frame)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Frame preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec3_frame' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec3_frame')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 7. Couple Photo */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Couple Photo</label>
                            <div className="flex items-center gap-4">
                              {photoSec3Couple && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                                  <img src={photoSec3Couple} onClick={() => setActivePreviewImage(photoSec3Couple)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Couple preview" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                                  {isUploadingPhoto === 'photo_sec3_couple' ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'photo_sec3_couple')} className="hidden" disabled={isUploadingPhoto !== null} />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Quote Section'}
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'couple' && (
                  <form onSubmit={handleSaveCouple} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-8">
                    {/* Bride Section */}
                    <div className="space-y-4">
                      <h4 className="text-base font-serif text-neutral-800 border-b border-neutral-100 pb-3 uppercase tracking-wider">Mempelai Wanita (Bride)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Nickname</label>
                          <input type="text" value={brideNicknameForm} onChange={(e) => setBrideNicknameForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" required />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Instagram</label>
                          <input type="text" value={brideInstagramForm} onChange={(e) => setBrideInstagramForm(e.target.value)} placeholder="@username" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Full Name</label>
                        <input type="text" value={brideNameForm} onChange={(e) => setBrideNameForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Father's Name</label>
                          <input type="text" value={brideFatherForm} onChange={(e) => setBrideFatherForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Mother's Name</label>
                          <input type="text" value={brideMotherForm} onChange={(e) => setBrideMotherForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Bride Photo</label>
                        <div className="flex items-center gap-4">
                          {bridePhotoUrlForm && (
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                              <img src={bridePhotoUrlForm} onClick={() => setActivePreviewImage(bridePhotoUrlForm)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Bride preview" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                              {isUploadingPhoto === 'bride_photo_url' ? 'Uploading...' : 'Upload Image'}
                              <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'bride_photo_url')} className="hidden" disabled={isUploadingPhoto !== null} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Groom Section */}
                    <div className="space-y-4 pt-6 border-t border-neutral-100">
                      <h4 className="text-base font-serif text-neutral-800 border-b border-neutral-100 pb-3 uppercase tracking-wider">Mempelai Pria (Groom)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Nickname</label>
                          <input type="text" value={groomNicknameForm} onChange={(e) => setGroomNicknameForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" required />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Instagram</label>
                          <input type="text" value={groomInstagramForm} onChange={(e) => setGroomInstagramForm(e.target.value)} placeholder="@username" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Full Name</label>
                        <input type="text" value={groomNameForm} onChange={(e) => setGroomNameForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Father's Name</label>
                          <input type="text" value={groomFatherForm} onChange={(e) => setGroomFatherForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Mother's Name</label>
                          <input type="text" value={groomMotherForm} onChange={(e) => setGroomMotherForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Groom Photo</label>
                        <div className="flex items-center gap-4">
                          {groomPhotoUrlForm && (
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                              <img src={groomPhotoUrlForm} onClick={() => setActivePreviewImage(groomPhotoUrlForm)} className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-all duration-300" alt="Groom preview" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                              {isUploadingPhoto === 'groom_photo_url' ? 'Uploading...' : 'Upload Image'}
                              <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, 'groom_photo_url')} className="hidden" disabled={isUploadingPhoto !== null} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Couple Section'}
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'events' && (
                  <form onSubmit={handleSaveEvents} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Events & Location</h4>
                      <p className="text-xs text-neutral-400 mt-1">Configure locations, schedules and maps for sub-events</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Main Venue Name</label>
                        <input type="text" value={venueNameForm} onChange={(e) => setVenueNameForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Religion</label>
                        <select value={religionForm} onChange={(e) => setReligionForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 cursor-pointer">
                          <option value="islam">Islam</option>
                          <option value="christian">Kristen</option>
                          <option value="catholic">Katolik</option>
                          <option value="hindu">Hindu</option>
                          <option value="buddha">Buddha</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Venue Address</label>
                        <textarea rows={3} value={venueAddressForm} onChange={(e) => setVenueAddressForm(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 resize-none" required />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Google Maps Location</label>
                          <button
                            type="button"
                            onClick={() => setVenueMapsUrlForm(getMapsEmbedUrl(venueNameForm || venueAddressForm))}
                            className="text-[9px] font-bold uppercase text-neutral-500 hover:text-neutral-900 tracking-wider bg-transparent border-0 cursor-pointer"
                          >
                            Sync with Name/Address
                          </button>
                        </div>
                        <input
                          type="text"
                          value={venueMapsUrlForm.includes("q=") ? decodeURIComponent(venueMapsUrlForm.split("q=")[1].split("&")[0]) : venueMapsUrlForm}
                          onChange={(e) => setVenueMapsUrlForm(getMapsEmbedUrl(e.target.value))}
                          placeholder="e.g. Openaire Resto Bar Market Semarang"
                          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                          required
                        />
                        {venueMapsUrlForm && (
                          <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm aspect-[21/9]">
                            <iframe
                              src={venueMapsUrlForm}
                              className="w-full h-full border-0"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specific Wedding Events list form */}
                    {weddingEvents.length > 0 && (
                      <div className="pt-6 border-t border-neutral-100 space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Sub-Events (Akad, Resepsi, dll.)</h4>
                        <div className="space-y-8 divide-y divide-neutral-100">
                          {weddingEvents.map((ev, index) => (
                            <div key={ev.id} className={`space-y-4 ${index > 0 ? 'pt-8' : ''}`}>
                              <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-neutral-900 text-white text-[8px] font-bold tracking-[0.2em] uppercase rounded-md">
                                  Event #{index + 1}: {ev.event_type.toUpperCase()}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Custom Label</label>
                                  <input 
                                    type="text" 
                                    value={ev.custom_label || ""} 
                                    onChange={(e) => {
                                      const updated = [...weddingEvents];
                                      updated[index] = { ...updated[index], custom_label: e.target.value };
                                      setWeddingEvents(updated);
                                    }} 
                                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" 
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Event Date</label>
                                  <input 
                                    type="date" 
                                    value={ev.event_date || ""} 
                                    onChange={(e) => {
                                      const updated = [...weddingEvents];
                                      updated[index] = { ...updated[index], event_date: e.target.value };
                                      setWeddingEvents(updated);
                                    }} 
                                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" 
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Start Time</label>
                                    <input 
                                      type="text" 
                                      value={ev.event_time || ""} 
                                      onChange={(e) => {
                                        const updated = [...weddingEvents];
                                        updated[index] = { ...updated[index], event_time: e.target.value };
                                        setWeddingEvents(updated);
                                      }} 
                                      placeholder="10:00:00"
                                      className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" 
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">End Time</label>
                                    <input 
                                      type="text" 
                                      value={ev.end_time || ""} 
                                      onChange={(e) => {
                                        const updated = [...weddingEvents];
                                        updated[index] = { ...updated[index], end_time: e.target.value };
                                        setWeddingEvents(updated);
                                      }} 
                                      placeholder="12:00:00"
                                      className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" 
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Venue Name</label>
                                  <input 
                                    type="text" 
                                    value={ev.venue_name || ""} 
                                    onChange={(e) => {
                                      const updated = [...weddingEvents];
                                      updated[index] = { ...updated[index], venue_name: e.target.value };
                                      setWeddingEvents(updated);
                                    }} 
                                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase ml-1">Google Maps Location</label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...weddingEvents];
                                        updated[index] = { ...updated[index], venue_maps_url: getMapsEmbedUrl(ev.venue_name || ev.venue_address || "") };
                                        setWeddingEvents(updated);
                                      }}
                                      className="text-[8px] font-bold uppercase text-neutral-500 hover:text-neutral-900 tracking-wider bg-transparent border-0 cursor-pointer"
                                    >
                                      Sync
                                    </button>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={ev.venue_maps_url && ev.venue_maps_url.includes("q=") ? decodeURIComponent(ev.venue_maps_url.split("q=")[1].split("&")[0]) : ev.venue_maps_url || ""} 
                                    onChange={(e) => {
                                      const updated = [...weddingEvents];
                                      updated[index] = { ...updated[index], venue_maps_url: getMapsEmbedUrl(e.target.value) };
                                      setWeddingEvents(updated);
                                    }} 
                                    placeholder="e.g. Openaire Resto Bar Market Semarang"
                                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" 
                                  />
                                  {ev.venue_maps_url && (
                                    <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm aspect-[21/9] mt-2">
                                      <iframe
                                        src={ev.venue_maps_url}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        loading="lazy"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Venue Address</label>
                                <textarea 
                                  rows={2} 
                                  value={ev.venue_address || ""} 
                                  onChange={(e) => {
                                    const updated = [...weddingEvents];
                                    updated[index] = { ...updated[index], venue_address: e.target.value };
                                    setWeddingEvents(updated);
                                  }} 
                                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 resize-none" 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Events Section'}
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'rundown' && (
                  <form onSubmit={handleSaveRundown} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-serif text-neutral-800">Rundown Acara (Wedding Rundown)</h4>
                        <p className="text-xs text-neutral-400 mt-1">Configure chronological wedding milestone events and schedules</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRundownItemsForm([
                            ...rundownItemsForm,
                            { time: "00.00", title: "New Event Milestone", icon: "rundown-rings.png" }
                          ]);
                        }}
                        className="px-4 py-2 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all shadow-sm cursor-pointer border-0"
                      >
                        + Add Milestone
                      </button>
                    </div>

                    <div className="space-y-4">
                      {rundownItemsForm.map((item, idx) => (
                        <div key={idx} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-150 relative space-y-4">
                          <button
                            type="button"
                            onClick={() => {
                              setRundownItemsForm(rundownItemsForm.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider font-sans border-0 bg-transparent"
                          >
                            Remove
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Time</label>
                              <input
                                type="text"
                                value={item.time}
                                onChange={(e) => {
                                  const updated = [...rundownItemsForm];
                                  updated[idx].time = e.target.value;
                                  setRundownItemsForm(updated);
                                }}
                                placeholder="e.g. 10.00 - 11.00"
                                className="w-full bg-white border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Milestone Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...rundownItemsForm];
                                  updated[idx].title = e.target.value;
                                  setRundownItemsForm(updated);
                                }}
                                placeholder="e.g. Akad Nikah"
                                className="w-full bg-white border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Icon Style</label>
                              <select
                                value={item.icon}
                                onChange={(e) => {
                                  const updated = [...rundownItemsForm];
                                  updated[idx].icon = e.target.value;
                                  setRundownItemsForm(updated);
                                }}
                                className="w-full bg-white border border-neutral-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 cursor-pointer"
                              >
                                <option value="rundown-rings.png">Cincin (Rings)</option>
                                <option value="rundown-table.png">Meja Makan (Table)</option>
                                <option value="rundown-doves.png">Burung Merpati (Doves)</option>
                                <option value="rundown-toast.png">Gelas Toast (Toast)</option>
                                <option value="rundown-camera.png">Kamera (Camera)</option>
                                <option value="rundown-hands.png">Salaman (Hands)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}

                      {rundownItemsForm.length === 0 && (
                        <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl">
                          No rundown milestones configured. Click "+ Add Milestone" to start.
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Rundown'}
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'story' && (() => {
                  const isLaceEnvelop = project?.template_id === 'f93ad18d-cba2-4de0-a86b-b1fadf2783a1' || project?.project_name?.includes('lace-envelop');
                  if (isLaceEnvelop) {
                    return (
                      <div className="w-full bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 flex flex-col gap-6">
                        <div className="border-b border-neutral-100 pb-4">
                          <h4 className="text-base font-serif text-neutral-800">Edit Love Story</h4>
                          <p className="text-xs text-neutral-400 mt-1">Update your love story description. Paragraphs will split automatically on newline.</p>
                        </div>

                        <form onSubmit={handleSaveSingleLoveStory} className="space-y-5">
                          <div>
                            <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Love Story Content</label>
                            <textarea
                              value={singleLoveStoryText}
                              onChange={(e) => setSingleLoveStoryText(e.target.value)}
                              placeholder="Write your love story here..."
                              rows={12}
                              className="w-full bg-neutral-50 border border-neutral-200 px-5 py-4 rounded-xl text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-900 resize-y leading-relaxed font-sans"
                              required
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isSavingLoveStory}
                              className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              {isSavingLoveStory ? 'Saving...' : 'Save Love Story'}
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-8">
                      {/* Form to add story */}
                      <div className="w-full bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 h-fit">
                        <h4 className="text-base font-serif text-neutral-800 mb-6">Add New Story Milestone</h4>
                        <form onSubmit={handleAddStory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Year</label>
                            <input type="text" value={newStoryYear} onChange={(e) => setNewStoryYear(e.target.value)} required placeholder="e.g. 2019" className="w-full bg-neutral-50 border border-neutral-200 px-5 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Title</label>
                            <input type="text" value={newStoryTitle} onChange={(e) => setNewStoryTitle(e.target.value)} required placeholder="e.g. First Met" className="w-full bg-neutral-50 border border-neutral-200 px-5 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                          </div>
                          <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Order (Number)</label>
                            <input type="number" value={newStoryOrder} onChange={(e) => setNewStoryOrder(e.target.value)} required placeholder="e.g. 1" className="w-full bg-neutral-50 border border-neutral-200 px-5 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900" />
                          </div>
                          <div className="md:col-span-2 lg:col-span-4">
                            <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Description</label>
                            <textarea value={newStoryDesc} onChange={(e) => setNewStoryDesc(e.target.value)} required rows={3} placeholder="Description..." className="w-full bg-neutral-50 border border-neutral-200 px-5 py-3 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 resize-none"></textarea>
                          </div>
                          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                            <button type="submit" disabled={isAddingStory} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                              {isAddingStory ? 'Adding...' : 'Add Event'}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Timeline Events list */}
                      <div className="w-full bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100">
                        <h4 className="text-base font-serif text-neutral-800 mb-6">Story Timeline Milestones</h4>
                        {storyEvents.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No story events added yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {storyEvents.map((item) => (
                              <div key={item.id} className="flex items-start justify-between p-5 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:border-neutral-200 hover:shadow-md transition-all">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold text-neutral-400">[{item.year}]</span>
                                    <span className="text-sm font-bold text-neutral-800">{item.title}</span>
                                    <span className="text-[9px] font-black text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded uppercase tracking-wider">Order {item.order}</span>
                                  </div>
                                  <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">{item.desc}</p>
                                </div>
                                <button type="button" onClick={() => handleDeleteStory(item.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {activeSection === 'gallery' && (
                  <form onSubmit={handleSaveGallery} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Gallery Photos</h4>
                      <p className="text-xs text-neutral-400 mt-1">Manage and add photos for the invitation gallery</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Photo URLs</label>
                      {galleryPhotosForm.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic bg-neutral-50 p-4 rounded-xl border border-neutral-100">No gallery photos added yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {galleryPhotosForm.map((url, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
                              <img src={url} className="object-cover w-full h-full" alt="Gallery item" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActivePreviewImage(url)}
                                  className="p-2 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors shadow-md active:scale-90 cursor-pointer border-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" /></svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...galleryPhotosForm];
                                    updated.splice(idx, 1);
                                    setGalleryPhotosForm(updated);
                                  }}
                                  className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-md active:scale-90 cursor-pointer border-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-neutral-100 space-y-4">
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Upload New Photo</label>
                      <div className="flex items-center gap-2">
                        <label className="inline-block cursor-pointer px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer">
                          {isUploadingPhoto === 'gallery' ? 'Uploading...' : 'Upload Image File'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingPhoto('gallery');
                              try {
                                const base64String = await new Promise<string>((resolve, reject) => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => resolve(reader.result as string);
                                  reader.onerror = reject;
                                  reader.readAsDataURL(file);
                                });

                                const res = await fetch('/api/admin', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    action: 'upload_image',
                                    payload: {
                                      project_id: projectId,
                                      file: base64String,
                                      fileName: file.name,
                                      fileType: file.type
                                    }
                                  })
                                });

                                if (!res.ok) throw new Error('Upload failed');
                                const data = await res.json();
                                setGalleryPhotosForm([...galleryPhotosForm, data.url]);
                                alert('Photo uploaded and added to gallery!');
                              } catch (err: any) {
                                alert('Upload failed: ' + err.message);
                              } finally {
                                setIsUploadingPhoto(null);
                              }
                            }}
                            className="hidden"
                            disabled={isUploadingPhoto !== null}
                          />
                        </label>
                        <span className="text-[8px] text-neutral-400 uppercase">Max 5MB</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Gallery Section'}
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'cashless' && (
                  <form onSubmit={handleSaveCashless} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Amplop Digital (Cashless)</h4>
                      <p className="text-xs text-neutral-400 mt-1">Configure bank accounts or digital wallets for wedding cash gifts</p>
                    </div>

                    <div className="space-y-4">
                      {paymentAccounts.map((acc, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50 relative group">
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Bank / E-Wallet Name</label>
                            <input
                              type="text"
                              value={acc.bank_name || ""}
                              placeholder="e.g. BCA / Mandiri / GoPay"
                              onChange={(e) => {
                                const next = [...paymentAccounts];
                                next[index].bank_name = e.target.value;
                                setPaymentAccounts(next);
                              }}
                              className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Account Number</label>
                            <input
                              type="text"
                              value={acc.bank_account || ""}
                              placeholder="Account number..."
                              onChange={(e) => {
                                const next = [...paymentAccounts];
                                next[index].bank_account = e.target.value;
                                setPaymentAccounts(next);
                              }}
                              className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Account Holder Name</label>
                            <input
                              type="text"
                              value={acc.owner_name || ""}
                              placeholder="Holder name..."
                              onChange={(e) => {
                                const next = [...paymentAccounts];
                                next[index].owner_name = e.target.value;
                                setPaymentAccounts(next);
                              }}
                              className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const next = [...paymentAccounts];
                              next.splice(index, 1);
                              setPaymentAccounts(next);
                            }}
                            className="absolute -top-2.5 -right-2.5 w-6 h-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 active:scale-90 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentAccounts([...paymentAccounts, { bank_name: "", bank_account: "", owner_name: "" }]);
                        }}
                        className="w-full py-3.5 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 text-[10px] font-bold uppercase tracking-wider hover:border-neutral-900 hover:text-neutral-900 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Payment Account
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Cashless Accounts'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Dining Schedule Section */}
                {activeSection === 'dining' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingDetails(true);
                    try {
                      const quotesJSON = JSON.stringify({
                        quote_arabic: quoteArabicForm, quote_translation: quoteTranslationForm, quote_source: quoteSourceForm,
                        photo_sec2_dance: photoSec2Dance, photo_sec2_pigeons: photoSec2Pigeons, photo_sec2_flowers: photoSec2Flowers, photo_sec2_run: photoSec2Run,
                        photo_sec3_bg: photoSec3Bg, photo_sec3_frame: photoSec3Frame, photo_sec3_couple: photoSec3Couple,
                        rundown: rundownItemsForm, location_city: locationCityForm, teaser_video_url: teaserVideoUrlForm,
                        dining_schedule: diningScheduleForm, faqs: faqsForm
                      });
                      const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_project_details', payload: { project_id: projectId, wedding_fields: { wishlist_note: quotesJSON } } }) });
                      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || 'Failed'); }
                      alert("Dining Schedule updated successfully!");
                      await fetchData();
                    } catch (error: any) { console.error(error); alert("Failed to save: " + (error.message || String(error))); } finally { setIsSavingDetails(false); }
                  }} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Dining Schedule</h4>
                      <p className="text-xs text-neutral-400 mt-1">Configure the dining timeline shown on the invitation</p>
                    </div>

                    <div className="space-y-4">
                      {diningScheduleForm.map((item, index) => (
                        <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50 items-center group">
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Time</label>
                            <input
                              type="text"
                              value={item.time}
                              onChange={(e) => {
                                const updated = [...diningScheduleForm];
                                updated[index] = { ...updated[index], time: e.target.value };
                                setDiningScheduleForm(updated);
                              }}
                              placeholder="e.g. 11.00 - 12.00"
                              className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Menu / Description</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...diningScheduleForm];
                                updated[index] = { ...updated[index], title: e.target.value };
                                setDiningScheduleForm(updated);
                              }}
                              placeholder="e.g. Main Course"
                              className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = diningScheduleForm.filter((_, i) => i !== index);
                              setDiningScheduleForm(updated);
                            }}
                            className="mt-4 p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setDiningScheduleForm([...diningScheduleForm, { time: "", title: "" }])}
                        className="w-full py-3.5 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 text-[10px] font-bold uppercase tracking-wider hover:border-neutral-900 hover:text-neutral-900 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Dining Item
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Dining Schedule'}
                      </button>
                    </div>
                  </form>
                )}

                {/* FAQ Section */}
                {activeSection === 'faq' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingDetails(true);
                    try {
                      const quotesJSON = JSON.stringify({
                        quote_arabic: quoteArabicForm, quote_translation: quoteTranslationForm, quote_source: quoteSourceForm,
                        photo_sec2_dance: photoSec2Dance, photo_sec2_pigeons: photoSec2Pigeons, photo_sec2_flowers: photoSec2Flowers, photo_sec2_run: photoSec2Run,
                        photo_sec3_bg: photoSec3Bg, photo_sec3_frame: photoSec3Frame, photo_sec3_couple: photoSec3Couple,
                        rundown: rundownItemsForm, location_city: locationCityForm, teaser_video_url: teaserVideoUrlForm,
                        dining_schedule: diningScheduleForm, faqs: faqsForm
                      });
                      const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_project_details', payload: { project_id: projectId, wedding_fields: { wishlist_note: quotesJSON } } }) });
                      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || 'Failed'); }
                      alert("FAQ updated successfully!");
                      await fetchData();
                    } catch (error: any) { console.error(error); alert("Failed to save: " + (error.message || String(error))); } finally { setIsSavingDetails(false); }
                  }} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Frequently Asked Questions</h4>
                      <p className="text-xs text-neutral-400 mt-1">Manage FAQ items displayed on the invitation</p>
                    </div>

                    <div className="space-y-4">
                      {faqsForm.map((item, index) => (
                        <div key={index} className="p-5 rounded-xl border border-neutral-100 bg-neutral-50 space-y-3 relative group">
                          <button
                            type="button"
                            onClick={() => setFaqsForm(faqsForm.filter((_, i) => i !== index))}
                            className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" /></svg>
                          </button>
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Question</label>
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) => {
                                const updated = [...faqsForm];
                                updated[index] = { ...updated[index], question: e.target.value };
                                setFaqsForm(updated);
                              }}
                              placeholder="e.g. Apakah boleh membawa anak kecil?"
                              className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-1.5">Answer</label>
                            <textarea
                              rows={2}
                              value={item.answer}
                              onChange={(e) => {
                                const updated = [...faqsForm];
                                updated[index] = { ...updated[index], answer: e.target.value };
                                setFaqsForm(updated);
                              }}
                              placeholder="Answer to the question..."
                              className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 transition-all text-neutral-900 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFaqsForm([...faqsForm, { question: "", answer: "" }])}
                        className="w-full py-3.5 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 text-[10px] font-bold uppercase tracking-wider hover:border-neutral-900 hover:text-neutral-900 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add FAQ Item
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save FAQ'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Video Teaser Section */}
                {activeSection === 'video' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingDetails(true);
                    try {
                      const quotesJSON = JSON.stringify({
                        quote_arabic: quoteArabicForm, quote_translation: quoteTranslationForm, quote_source: quoteSourceForm,
                        photo_sec2_dance: photoSec2Dance, photo_sec2_pigeons: photoSec2Pigeons, photo_sec2_flowers: photoSec2Flowers, photo_sec2_run: photoSec2Run,
                        photo_sec3_bg: photoSec3Bg, photo_sec3_frame: photoSec3Frame, photo_sec3_couple: photoSec3Couple,
                        rundown: rundownItemsForm, location_city: locationCityForm, teaser_video_url: teaserVideoUrlForm,
                        dining_schedule: diningScheduleForm, faqs: faqsForm
                      });
                      const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_project_details', payload: { project_id: projectId, wedding_fields: { wishlist_note: quotesJSON } } }) });
                      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || 'Failed'); }
                      alert("Video Teaser updated successfully!");
                      await fetchData();
                    } catch (error: any) { console.error(error); alert("Failed to save: " + (error.message || String(error))); } finally { setIsSavingDetails(false); }
                  }} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-6">
                    <div className="border-b border-neutral-100 pb-4">
                      <h4 className="text-base font-serif text-neutral-800">Video Teaser</h4>
                      <p className="text-xs text-neutral-400 mt-1">Upload or set the video teaser shown in the closing section of the invitation</p>
                    </div>

                    <div className="space-y-4">
                      {teaserVideoUrlForm ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M19.952 1.351a.75.75 0 0 1 .27 1.012l-6 10.5a.75.75 0 0 1-1.077.254l-3-2.25a.75.75 0 1 1 .9-1.2l2.33 1.748 5.485-9.6a.75.75 0 0 1 1.092-.264ZM20.25 18.75a.75.75 0 0 0-.75-.75h-15a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" /></svg>
                              Video Loaded
                            </span>
                          </div>
                          <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm aspect-video bg-black">
                            <video key={teaserVideoUrlForm} controls className="w-full h-full">
                              <source src={teaserVideoUrlForm} type="video/mp4" />
                            </video>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50">
                          <p className="text-xs text-neutral-400">No video uploaded yet. Upload a video file below.</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <label className="inline-block cursor-pointer px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer">
                          {isUploadingPhoto === 'teaser_video' ? 'Uploading...' : 'Upload Video File'}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 50 * 1024 * 1024) {
                                alert("Video file must be under 50MB");
                                return;
                              }
                              setIsUploadingPhoto('teaser_video');
                              try {
                                const base64String = await new Promise<string>((resolve, reject) => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => resolve(reader.result as string);
                                  reader.onerror = reject;
                                  reader.readAsDataURL(file);
                                });
                                const res = await fetch('/api/admin', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    action: 'upload_image',
                                    payload: {
                                      project_id: projectId,
                                      file: base64String,
                                      fileName: file.name,
                                      fileType: file.type
                                    }
                                  })
                                });
                                if (!res.ok) throw new Error('Upload failed');
                                const data = await res.json();
                                setTeaserVideoUrlForm(data.url);
                                alert("Video uploaded successfully!");
                              } catch (err: any) {
                                console.error(err);
                                alert("Failed to upload video: " + (err.message || String(err)));
                              } finally {
                                setIsUploadingPhoto(null);
                              }
                            }}
                            className="hidden"
                            disabled={isUploadingPhoto !== null}
                          />
                        </label>
                        {teaserVideoUrlForm && (
                          <button
                            type="button"
                            onClick={() => setTeaserVideoUrlForm("")}
                            className="px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 rounded-lg transition-all cursor-pointer"
                          >
                            Remove Video
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-100">
                      <button type="submit" disabled={isSavingDetails} className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer">
                        {isSavingDetails ? 'Saving...' : 'Save Video Teaser'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100">
              <div>
                <h3 className="text-xl font-serif text-neutral-800">Dashboard Settings</h3>
                <p className="text-sm text-neutral-400 mt-1">Manage your dashboard security and configurations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 flex flex-col gap-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h4 className="text-base font-serif text-neutral-800">Change Password</h4>
                  <p className="text-xs text-neutral-400 mt-1">Update the password required to access this management suite.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showChangePassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-neutral-50 border border-neutral-200 pl-5 pr-14 py-4 rounded-xl text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                        title={showChangePassword ? "Hide password" : "Show password"}
                      >
                        {showChangePassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-neutral-50 border border-neutral-200 pl-5 pr-14 py-4 rounded-xl text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-4 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-dashed border-white animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      "Save New Password"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Elegant Wish Modal */}
      {selectedWish && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100">
            <div className="p-8 pt-10 text-center space-y-6">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8 text-neutral-300"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase">Messages From</h2>
                <p className="text-3xl font-serif text-neutral-800 uppercase tracking-tight">{selectedWish.name}</p>
              </div>
              <div className="relative p-6 bg-neutral-50/50 rounded-[2rem] border border-neutral-100/50 max-h-[300px] overflow-y-auto space-y-4">
                <div className="text-left flex justify-between items-start gap-4">
                  <p className="text-lg text-neutral-700 leading-relaxed font-serif italic text-pretty flex-1">"{selectedWish.wishes}"</p>
                  <button
                    onClick={() => handleDeleteWish(selectedWish.id)}
                    className="shrink-0 p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-all cursor-pointer"
                    title="Delete Wish"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedWish(null)} className="w-full py-5 bg-neutral-900 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-2xl hover:bg-neutral-800 transition-all shadow-lg active:scale-[0.98] cursor-pointer">Return to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Gift Modal */}
      {showAddGiftModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h2 className="text-2xl font-serif text-neutral-800">Add Registry Item</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mt-1">Fill the details below</p>
              </div>
              <button onClick={() => setShowAddGiftModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 shadow-sm border border-neutral-100 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleAddGift} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Quick Presets (Pilih Kado Cepat)</label>
                  <div className="flex flex-wrap gap-2">
                    {GIFT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewGift({
                          name: preset.name,
                          price: preset.price,
                          image: preset.image,
                          link: "",
                          originalPrice: "",
                          discount: ""
                        })}
                        className="px-4 py-2 text-xs bg-neutral-50 border border-neutral-200 hover:border-neutral-900 rounded-xl transition-all cursor-pointer text-neutral-800"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Item Name</label>
                    <input type="text" value={newGift.name} onChange={(e) => setNewGift({ ...newGift, name: e.target.value })} className="w-full bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" required placeholder="e.g. Microwave Oven" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Original Price (Rp)</label>
                    <input type="text" value={newGift.price} onChange={(e) => setNewGift({ ...newGift, price: formatCurrencyInput(e.target.value) })} placeholder="e.g. 500.000" className="w-full bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Image URL or Upload File</label>
                    <div className="flex gap-2">
                      <input type="text" value={newGift.image} onChange={(e) => setNewGift({ ...newGift, image: e.target.value })} className="flex-1 bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" required placeholder="https://... or upload below" />
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                        id="gift-image-file-add"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="gift-image-file-add"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 text-[10px] font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                        {isUploadingImage ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    {newGift.image && (
                      <div className="mt-4 relative w-32 aspect-[4/5] rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
                        <img src={newGift.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Discount Percentage (%)</label>
                    <input type="number" min="0" max="100" value={newGift.discount} onChange={(e) => setNewGift({ ...newGift, discount: e.target.value })} placeholder="e.g. 20 (Optional)" className="w-full bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAddGiftModal(false)} className="flex-1 py-4 bg-white text-neutral-900 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isAddingGift || isUploadingImage} className="flex-1 py-4 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md cursor-pointer">{isAddingGift ? "ADDING..." : "ADD TO REGISTRY"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Gift Modal */}
      {editingGift && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h2 className="text-2xl font-serif text-neutral-800">Edit Registry Item</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mt-1">Update the details below</p>
              </div>
              <button onClick={() => setEditingGift(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 shadow-sm border border-neutral-100 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleUpdateGift} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Item Name</label>
                    <input type="text" value={editingGift.name} onChange={(e) => setEditingGift({ ...editingGift, name: e.target.value })} className="w-full bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Original Price (Rp)</label>
                    <input type="text" value={editingGift.price} onChange={(e) => setEditingGift({ ...editingGift, price: formatCurrencyInput(e.target.value) })} className="w-full bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Image URL or Upload File</label>
                    <div className="flex gap-2">
                      <input type="text" value={editingGift.image} onChange={(e) => setEditingGift({ ...editingGift, image: e.target.value })} className="flex-1 bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" required />
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                        id="gift-image-file-edit"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="gift-image-file-edit"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 text-[10px] font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                        {isUploadingImage ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    {editingGift.image && (
                      <div className="mt-4 relative w-32 aspect-[4/5] rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
                        <img src={editingGift.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Discount Percentage (%)</label>
                    <input type="number" min="0" max="100" value={editingGift.discount} onChange={(e) => setEditingGift({ ...editingGift, discount: e.target.value })} placeholder="e.g. 20 (Optional)" className="w-full bg-white px-5 py-4 text-sm border border-neutral-200 rounded-2xl outline-none focus:border-neutral-900 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setEditingGift(null)} className="flex-1 py-4 bg-white text-neutral-900 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isUpdatingGift || isUploadingImage} className="flex-1 py-4 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md cursor-pointer">{isUpdatingGift ? "SAVING..." : "SAVE CHANGES"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* Lightbox Modal Overlay for Image Zooming */}
      <AnimatePresence>
        {activePreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePreviewImage(null)}
            className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={activePreviewImage} className="object-contain max-w-full max-h-[85vh]" alt="Full size preview" />
              <button
                type="button"
                onClick={() => setActivePreviewImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all active:scale-90 cursor-pointer border-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

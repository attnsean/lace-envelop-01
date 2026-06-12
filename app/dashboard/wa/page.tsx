"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

interface ChatItem {
  id: string;
  name: string;
  unreadCount: number;
  timestamp: number;
  lastMessage?: string;
  isGroup: boolean;
  profilePicUrl?: string;
}

const Avatar = ({ chat }: { chat: ChatItem }) => {
  const [srcError, setSrcError] = React.useState(false);
  const nameInitials = chat.name ? chat.name.slice(0, 2).toUpperCase() : "WA";

  const getGradientColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "from-rose-400 to-pink-500",
      "from-amber-400 to-orange-500",
      "from-emerald-400 to-teal-500",
      "from-blue-400 to-indigo-500",
      "from-violet-400 to-purple-500",
      "from-cyan-400 to-blue-500"
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const gradient = getGradientColor(chat.name || chat.id);

  if (chat.profilePicUrl && !srcError) {
    return (
      <img
        src={chat.profilePicUrl}
        alt={chat.name || "WA"}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-neutral-100 shadow-sm"
        onError={() => setSrcError(true)}
      />
    );
  }

  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${gradient} text-white flex items-center justify-center text-xs font-bold shadow-inner flex-shrink-0`}>
      {nameInitials}
    </div>
  );
};

interface MessageItem {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  type: string;
  sender: string;
  hasMedia?: boolean;
}

export default function WhatsAppChatPage() {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "f93ad18d-cba2-4de0-a86b-b1fadf2783a2";
  
  // States
  const [botStatus, setBotStatus] = useState<{ status: string; qr?: string }>({ status: "disconnected" });
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messageLimit, setMessageLimit] = useState(50);
  const [mediaCache, setMediaCache] = useState<{ [key: string]: { dataUrl: string; filename?: string } }>({});
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: string; filename?: string } | null>(null);

  // Refs
  const channelRef = useRef<any>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevChatIdRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);
  const requestedMediaRef = useRef<Set<string>>(new Set());

  // 1. Fetch initial Bot Status and projects DB updates
  useEffect(() => {
    if (!projectId) return;

    const fetchBotStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("love_story")
          .eq("id", projectId)
          .maybeSingle();

        if (error) throw error;
        if (data && data.love_story) {
          setBotStatus(JSON.parse(data.love_story));
        }
      } catch (err) {
        console.error("Error fetching bot status:", err);
      }
    };

    fetchBotStatus();

    // Subscribe to projects table for status changes
    const statusChannel = supabase
      .channel("wa-status-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => {
          const newProj = payload.new as any;
          if (newProj && newProj.love_story) {
            try {
              setBotStatus(JSON.parse(newProj.love_story));
            } catch (e) {}
          }
        }
      )
      .subscribe();

    // Fallback polling for bot status when in transitional states
    const statusInterval = setInterval(() => {
      if (botStatus.status === "loading" || botStatus.status === "qr") {
        fetchBotStatus();
      }
    }, 4000);

    return () => {
      supabase.removeChannel(statusChannel);
      clearInterval(statusInterval);
    };
  }, [projectId, botStatus.status]);

  // 2. Subscribe to Real-time Broadcast Channel for Chats and Messages
  useEffect(() => {
    if (!projectId) return;

    // Connect to Broadcast Channel
    const broadcastChannel = supabase.channel(`wa-chats:${projectId}`, {
      config: {
        broadcast: { self: false }
      }
    });

    broadcastChannel
      .on("broadcast", { event: "response_chats" }, (payload: any) => {
        console.log("Broadcast received: response_chats", payload);
        if (payload.payload.success) {
          setChats(payload.payload.chats || []);
        } else {
          console.error("Failed to load chats:", payload.payload.error);
        }
        setLoadingChats(false);
      })
      .on("broadcast", { event: "response_messages" }, (payload: any) => {
        console.log("Broadcast received: response_messages", payload);
        if (payload.payload.success && payload.payload.chatId === activeChatId) {
          setMessages(payload.payload.messages || []);
        }
        setLoadingMessages(false);
      })
      .on("broadcast", { event: "response_media" }, (payload: any) => {
        console.log("Broadcast received: response_media", payload);
        const { messageId, success, dataUrl, filename } = payload.payload;
        if (success && dataUrl) {
          setMediaCache(prev => ({ ...prev, [messageId]: { dataUrl, filename } }));
        }
      })
      .on("broadcast", { event: "bot_new_message" }, (payload: any) => {
        console.log("Broadcast received: bot_new_message", payload);
        const { chatId, message } = payload.payload;

        // If new message belongs to current active chat, append or replace temporary message
        if (chatId === activeChatId) {
          setMessages(prev => {
            // Check if there is an optimistic temporary message with the same body
            if (message.fromMe) {
              const tempIdx = prev.findIndex(m => m.id.startsWith("temp-") && m.body === message.body);
              if (tempIdx > -1) {
                const updated = [...prev];
                updated[tempIdx] = message; // replace with official message JID and timestamp
                return updated;
              }
            }
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }

        // Trigger local chat list update and move this chat to the top
        setChats(prevChats => {
          const chatIdx = prevChats.findIndex(c => c.id === chatId);
          if (chatIdx > -1) {
            const updated = [...prevChats];
            updated[chatIdx] = {
              ...updated[chatIdx],
              lastMessage: message.body,
              timestamp: message.timestamp,
              unreadCount: chatId === activeChatId ? 0 : (updated[chatIdx].unreadCount + 1)
            };
            return updated.sort((a, b) => b.timestamp - a.timestamp);
          } else {
            // Trigger refresh from bot if the chat item isn't locally cached
            broadcastChannel.send({
              type: "broadcast",
              event: "request_chats",
              payload: {}
            });
            return prevChats;
          }
        });
      })
      .subscribe((status) => {
        console.log("Broadcast channel status:", status);
        if (status === "SUBSCRIBED" && botStatus.status === "connected") {
          // Request chat list immediately on subscription
          broadcastChannel.send({
            type: "broadcast",
            event: "request_chats",
            payload: {}
          });
        }
      });

    channelRef.current = broadcastChannel;

    return () => {
      supabase.removeChannel(broadcastChannel);
    };
  }, [projectId, botStatus.status, activeChatId]);

  // Request chats when botStatus changes to connected
  useEffect(() => {
    if (botStatus.status === "connected" && channelRef.current) {
      setLoadingChats(true);
      channelRef.current.send({
        type: "broadcast",
        event: "request_chats",
        payload: {}
      });
    }
  }, [botStatus.status]);

  // Reset states when switching chats
  useEffect(() => {
    setMessageLimit(50);
    setMediaCache({});
    requestedMediaRef.current.clear();
  }, [activeChatId]);

  // Request messages when activeChatId or messageLimit changes
  useEffect(() => {
    if (activeChatId && channelRef.current && botStatus.status === "connected") {
      if (messageLimit === 50) {
        setLoadingMessages(true);
      }
      channelRef.current.send({
        type: "broadcast",
        event: "request_messages",
        payload: { chatId: activeChatId, limit: messageLimit }
      });
      
      // Clear unread count locally
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, unreadCount: 0 } : c));
    }
  }, [activeChatId, messageLimit, botStatus.status]);

  // Focus input field when switching chats
  useEffect(() => {
    if (activeChatId && !loadingMessages) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [activeChatId, loadingMessages]);

  // Scroll to bottom handling
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [activeChatId]);

  // Close lightbox on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxMedia(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Force re-fetch messages even if clicking the same chat (robust navigation)
  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileShowChat(true);

    if (chatId === activeChatId && channelRef.current && botStatus.status === "connected") {
      setLoadingMessages(true);
      channelRef.current.send({
        type: "broadcast",
        event: "request_messages",
        payload: { chatId, limit: messageLimit }
      });
    }
  };

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !channelRef.current) return;

    // Optimistically append temp message to thread
    const tempMessageId = "temp-" + Date.now();
    const tempMsg: MessageItem = {
      id: tempMessageId,
      body: inputText,
      fromMe: true,
      timestamp: Math.floor(Date.now() / 1000),
      type: "chat",
      sender: "me"
    };
    setMessages(prev => [...prev, tempMsg]);

    channelRef.current.send({
      type: "broadcast",
      event: "send_message",
      payload: {
        chatId: activeChatId,
        text: inputText,
        limit: messageLimit
      }
    });

    // Update last message in local chat list
    setChats(prev => {
      const idx = prev.findIndex(c => c.id === activeChatId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: inputText,
          timestamp: Math.floor(Date.now() / 1000)
        };
        return updated.sort((a, b) => b.timestamp - a.timestamp);
      }
      return prev;
    });

    setInputText("");
  };

  // Helper to render media attachments on demand
  const renderMediaMessage = (msg: MessageItem) => {
    const cached = mediaCache[msg.id];
    
    // Trigger media download if not already cached and not already requested
    if (!cached && channelRef.current && botStatus.status === "connected" && !requestedMediaRef.current.has(msg.id)) {
      requestedMediaRef.current.add(msg.id);
      channelRef.current.send({
        type: "broadcast",
        event: "request_media",
        payload: { messageId: msg.id, chatId: activeChatId }
      });
    }

    if (cached) {
      const { dataUrl, filename } = cached;

      if (msg.type === "image" || msg.type === "sticker") {
        const isSticker = msg.type === "sticker";
        return (
          <div className="space-y-1.5 my-1">
            <div className="relative group overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 cursor-pointer">
              <img
                src={dataUrl}
                alt={filename || "WhatsApp Image"}
                className={`object-contain shadow-sm transition-all hover:brightness-95 ${
                  isSticker 
                    ? "max-w-[120px] max-h-[120px] p-2" 
                    : "max-w-full max-h-72"
                }`}
                onClick={() => setLightboxMedia({ url: dataUrl, type: msg.type, filename })}
              />
              {!isSticker && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                  <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">🔍 Lihat</span>
                </div>
              )}
            </div>
            {msg.body && <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{formatMessageBody(msg.body)}</p>}
          </div>
        );
      }

      if (msg.type === "video") {
        return (
          <div className="space-y-1.5 my-1">
            <div className="relative group rounded-xl overflow-hidden border border-neutral-100 bg-black max-w-sm">
              <video
                src={dataUrl}
                controls
                className="max-w-full max-h-72 object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxMedia({ url: dataUrl, type: "video", filename })}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold p-1.5 rounded-lg backdrop-blur-sm transition-all"
                title="Fullscreen"
              >
                全
              </button>
            </div>
            {msg.body && <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{formatMessageBody(msg.body)}</p>}
          </div>
        );
      }

      if (msg.type === "audio" || msg.type === "ptt") {
        return (
          <div className="py-1 min-w-[240px]">
            <audio 
              src={dataUrl} 
              controls 
              className="w-full h-8 mt-1 accent-neutral-800"
            />
            {msg.body && <p className="text-xs leading-relaxed break-words whitespace-pre-wrap mt-1">{formatMessageBody(msg.body)}</p>}
          </div>
        );
      }

      // Document / default fallback
      const displayFilename = filename || msg.body || "attachment";
      const fileExtension = displayFilename.split('.').pop()?.toUpperCase() || "FILE";

      const handleDownload = () => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = displayFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return (
        <div className="my-1 py-1.5 px-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3 max-w-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center flex-shrink-0 font-bold text-[9px] uppercase tracking-wider border border-emerald-100">
            <span>📄</span>
            <span className="text-[7px] mt-0.5 font-sans font-black">{fileExtension}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-neutral-800 truncate" title={displayFilename}>
              {displayFilename}
            </p>
            <p className="text-[9px] text-neutral-400 uppercase font-medium">Dokumen</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 hover:bg-neutral-200/60 rounded-lg text-neutral-500 hover:text-neutral-900 transition-all"
            title="Download file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
        </div>
      );
    }

    // Loading skeleton state
    const placeholderIcon = 
      msg.type === "video" ? "🎥" :
      (msg.type === "audio" || msg.type === "ptt") ? "🎵" :
      msg.type === "document" ? "📄" : "📷";

    const mediaLabel = 
      msg.type === "video" ? "Memuat video..." :
      (msg.type === "audio" || msg.type === "ptt") ? "Memuat audio..." :
      msg.type === "document" ? "Memuat dokumen..." : "Memuat gambar...";

    return (
      <div className="flex items-center gap-3.5 py-3 px-3 my-1 bg-neutral-50/50 rounded-2xl border border-neutral-100/50 animate-pulse min-w-[200px]">
        <div className="w-9 h-9 rounded-xl bg-neutral-200/80 flex items-center justify-center text-neutral-500 text-sm">
          {placeholderIcon}
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="h-2.5 bg-neutral-200/80 rounded-md w-2/3" />
          <p className="text-[10px] text-neutral-400 font-medium">{mediaLabel}</p>
        </div>
      </div>
    );
  };

  // Safe formatting for WhatsApp text bold, italic, strikethrough, and inline code
  const formatMessageBody = (text: string) => {
    if (!text) return "";
    
    // Escape HTML entities to prevent XSS injection
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: *text* -> <strong>text</strong>
    formatted = formatted.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    // Italic: _text_ -> <em>text</em>
    formatted = formatted.replace(/_(.*?)_/g, "<em>$1</em>");
    // Strikethrough: ~text~ -> <del>text</del>
    formatted = formatted.replace(/~(.*?)~/g, "<del>$1</del>");
    // Inline Code: `text` -> <code>text</code>
    formatted = formatted.replace(/`(.*?)`/g, "<code class='bg-neutral-100/80 px-1 py-0.5 rounded text-[10.5px] font-mono border border-neutral-200/50'>$1</code>");

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Helper to format timestamps
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const hrs = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  // Filtered Chats
  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.includes(searchQuery)
  );

  const activeChat = chats.find(c => c.id === activeChatId);

  // Generate color initials mapping
  const getGradientColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "from-rose-400 to-pink-500",
      "from-amber-400 to-orange-500",
      "from-emerald-400 to-teal-500",
      "from-blue-400 to-indigo-500",
      "from-violet-400 to-purple-500",
      "from-cyan-400 to-blue-500"
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-screen bg-[#faf9f6] text-neutral-800 font-sans flex flex-col antialiased overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 flex-shrink-0 px-6 py-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-xl transition-all text-neutral-500 hover:text-neutral-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-serif text-neutral-900 font-bold">WhatsApp Live Chat</h1>
            <p className="text-[10px] text-neutral-400">Pantau dan balas pesan undangan pengantin</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-neutral-150 rounded-full shadow-sm">
          <span className={`w-2 h-2 rounded-full ${
            botStatus.status === "connected" ? "bg-emerald-500 animate-pulse" :
            botStatus.status === "qr" ? "bg-amber-500 animate-pulse" :
            botStatus.status === "loading" ? "bg-blue-500 animate-pulse" :
            "bg-rose-500"
          }`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
            Robot: {
              botStatus.status === "connected" ? "Connected" :
              botStatus.status === "qr" ? "Scan QR Required" :
              botStatus.status === "loading" ? "Memuat..." :
              "Disconnected"
            }
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 min-h-0 flex relative overflow-hidden">
        {botStatus.status !== "connected" ? (
          /* Warning state when bot is offline */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto my-auto space-y-5">
            <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 text-3xl shadow-sm">
              !
            </div>
            <div>
              <h2 className="text-xl font-serif text-neutral-900 font-bold">Robot WhatsApp Offline</h2>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                Anda perlu menghubungkan robot WhatsApp Anda terlebih dahulu agar dapat melihat atau membalas pesan. Silakan hubungkan robot melalui menu utama Blaster.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
            >
              Kembali ke Dashboard Utama
            </Link>
          </div>
        ) : (
          /* Active Chat Client */
          <div className="flex-1 flex w-full h-full">
            {/* Sidebar (List of Chats) */}
            <section className={`w-full md:w-80 border-r border-neutral-100 bg-white flex flex-col h-full ${
              mobileShowChat ? "hidden md:flex" : "flex"
            }`}>
              {/* Search Bar */}
              <div className="p-4 border-b border-neutral-100">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari obrolan..."
                    className="w-full bg-neutral-50 border border-neutral-100 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-800 font-medium placeholder-neutral-400"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                  </svg>
                </div>
              </div>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 custom-scrollbar">
                {loadingChats ? (
                  // Skeleton state
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="flex gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 bg-neutral-100 rounded w-2/3" />
                          <div className="h-2 bg-neutral-100 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400 mt-10 leading-normal">
                    Tidak ada obrolan ditemukan.
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const isSelected = activeChatId === chat.id;

                    return (
                      <button
                        key={chat.id}
                        onClick={() => selectChat(chat.id)}
                        className={`w-full p-4 flex gap-3 text-left transition-all hover:bg-neutral-50 cursor-pointer ${
                          isSelected ? "bg-neutral-50 border-l-2 border-neutral-900" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <Avatar chat={chat} />

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-xs font-bold text-neutral-800 truncate pr-2">{chat.name || chat.id.split("@")[0]}</h3>
                            <span className="text-[9px] text-neutral-400 flex-shrink-0">{formatTime(chat.timestamp)}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate mt-1">
                            {chat.lastMessage || "Mulai berkirim pesan..."}
                          </p>
                        </div>

                        {/* Unread badge */}
                        {chat.unreadCount > 0 && (
                          <div className="flex items-center justify-center">
                            <span className="min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-[8px] font-bold text-white flex items-center justify-center shadow-sm">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* Chat Thread Panel */}
            <section className={`flex-1 bg-[#efeae2] flex flex-col h-full relative ${
              mobileShowChat ? "flex" : "hidden md:flex"
            }`}>
              {activeChatId ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white border-b border-neutral-100 px-6 py-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                    <button
                      onClick={() => setMobileShowChat(false)}
                      className="p-1.5 hover:bg-neutral-150 rounded-lg text-neutral-500 hover:text-neutral-900 md:hidden transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {activeChat && <Avatar chat={activeChat} />}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-neutral-800 truncate">
                          {activeChat?.name || activeChatId.split("@")[0]}
                        </h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5 truncate">{activeChatId.split("@")[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse gap-4 custom-scrollbar bg-[#efeae2]">
                    <div ref={messageEndRef} />

                    {loadingMessages ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-neutral-400 animate-spin" />
                        <p className="text-[10px] text-neutral-500">Memuat riwayat obrolan...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full py-10">
                        <p className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-neutral-150 text-[10px] text-neutral-400 shadow-sm">
                          Tidak ada riwayat pesan sebelumnya.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Messages (rendered newest-first at bottom of reverse-flex, oldest-last at top) */}
                        {messages.slice().reverse().map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                                msg.fromMe
                                  ? "bg-[#dcf8c6] text-neutral-800 rounded-tr-none"
                                  : "bg-white text-neutral-800 rounded-tl-none"
                              }`}
                            >
                              {/* Group Sender Label */}
                              {!msg.fromMe && activeChat?.isGroup && (
                                <div className="text-[9px] font-bold text-emerald-600 mb-1 select-none">
                                  {msg.sender.split("@")[0]}
                                </div>
                              )}

                              <div className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                                {msg.hasMedia || ["image", "sticker", "video", "audio", "ptt", "document"].includes(msg.type) ? (
                                  renderMediaMessage(msg)
                                ) : msg.body ? (
                                  formatMessageBody(msg.body)
                                ) : (
                                  <span className="italic text-neutral-400">Pesan kosong</span>
                                )}
                              </div>
                              <div className="text-[8px] text-neutral-400 text-right mt-1.5 flex justify-end items-center gap-1 leading-none select-none">
                                {formatTime(msg.timestamp)}
                                {msg.fromMe && (
                                  <span className="text-emerald-500 text-[10px] font-bold">✓✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Load previous messages button (renders at top) */}
                        {messages.length >= messageLimit && (
                          <div className="flex justify-center my-2">
                            <button
                              type="button"
                              onClick={() => {
                                isLoadingMoreRef.current = true;
                                setMessageLimit(prev => prev + 50);
                              }}
                              className="px-4 py-2 bg-white/80 hover:bg-white text-[10px] text-neutral-500 font-bold hover:text-neutral-900 border border-neutral-150 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              Muat Pesan Sebelumnya
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Text Composer */}
                  <form
                    onSubmit={handleSendMessage}
                    className="bg-white border-t border-neutral-100 px-6 py-4 flex gap-3 items-center shadow-[0_-2px_10px_rgba(0,0,0,0.01)]"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ketik pesan..."
                      className="flex-1 bg-neutral-50 border border-neutral-150 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-800 font-medium placeholder-neutral-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    </button>
                  </form>
                </>
              ) : (
                /* Empty thread state */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300 text-2xl shadow-sm mb-4">
                    💬
                  </div>
                  <h3 className="text-sm font-bold text-neutral-700">Mulai Obrolan</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mt-1.5 leading-relaxed">
                    Pilih salah satu kontak di bilah samping untuk melihat riwayat pesan dan mulai bertukar pesan secara instan.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300"
          onClick={() => setLightboxMedia(null)}
        >
          {/* Top Action Bar */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-10">
            <div className="text-white text-xs font-medium truncate max-w-[70%]">
              {lightboxMedia.filename || (lightboxMedia.type === "sticker" ? "Sticker" : "WhatsApp Image")}
            </div>
            <div className="flex items-center gap-3">
              {/* Download button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement("a");
                  link.href = lightboxMedia.url;
                  link.download = lightboxMedia.filename || (lightboxMedia.type === "sticker" ? "sticker.webp" : "image.jpg");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center border-none outline-none"
                title="Download"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              {/* Close button */}
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center border-none outline-none"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Media Display Container */}
          <div 
            className="w-full max-w-4xl max-h-[85vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxMedia.type === "video" ? (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            ) : (
              <img
                src={lightboxMedia.url}
                alt="Zoomed Attachment"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

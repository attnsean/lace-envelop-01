"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const defaultImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519225495810-7517c24a2ed3?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop"
];

interface SlideshowProps {
  images?: (string | any)[];
  intervalMs?: number;
  overlayClassName?: string;
}

export default function Slideshow({ 
  images = defaultImages,
  intervalMs = 4000, 
  overlayClassName = "bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-[2px]" 
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Safeguard if images array is empty or undefined
  const activeImages = images && images.length > 0 ? images : defaultImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, activeImages.length]);

  return (
    <>
      {activeImages.map((img, index) => (
        <Image
          key={index}
          src={img}
          alt={`Background slide ${index + 1}`}
          fill
          unoptimized={typeof img === 'string'}
          sizes="(max-width: 768px) 100vw, 30vw"
          className={`object-cover object-[center_35%] transition-opacity duration-1000 ease-in-out absolute inset-0 ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
          priority={index === 0}
        />
      ))}
      {/* Dark Overlay */}
      <div className={`absolute inset-0 z-10 pointer-events-none ${overlayClassName}`}></div>
    </>
  );
}


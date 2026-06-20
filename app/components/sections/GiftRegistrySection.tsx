"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DbProject } from "../../../lib/resolveProject";
import FadeIn from "../FadeIn";

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

interface Props {
  project?: DbProject | null;
}

export default function GiftRegistrySection({ project }: Props) {
  if (project?.subscriptions?.packages?.has_amplop_digital === false) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Account number copied!");
  };

  const paymentAccounts = (project?.payment_accounts && Array.isArray(project.payment_accounts) && project.payment_accounts.length > 0
    ? project.payment_accounts
    : [
        { bank_name: "BRI", bank_account: "125101001997509", owner_name: "M LUQMAN FIKRI" },
        { bank_name: "BCA", bank_account: "0131800826", owner_name: "JOVITA LOLA EDRIA" }
      ]) as PaymentAccount[];

  return (
    <section id="gift-registry" className="relative w-full min-h-[100dvh] snap-start shrink-0 overflow-hidden flex flex-col items-center justify-center bg-[#E1D8CC] text-[#4A3E3D] select-none py-10 md:py-0">
      {/* Desktop: side-by-side layout */}
      <div className="hidden md:flex w-full h-[100dvh] flex-row">
        {/* Left Column (Registry title and bird) - Desktop */}
        <div className="w-[40%] xl:w-[45%] h-full flex flex-col items-center justify-center p-8 xl:p-12 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-parfumerie text-[#4A3E3D] text-[clamp(100px,8vw,140px)] leading-none italic font-light z-10 -mb-6">
              Hadiah
            </span>
            <h3 className="font-seasons text-[#4A3E3D] text-[clamp(55px,5vw,85px)] font-normal uppercase leading-none tracking-[0.08em] mb-8">
              PERNIKAHAN
            </h3>
            
            {/* Bird illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="relative w-[360px] h-[200px] mt-3 select-none pointer-events-none"
            >
              <Image
                src={`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf'}/${project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'}/gift-bird.png`}
                alt="Bird Illustration"
                fill
                sizes="360px"
                className="object-contain"
                unoptimized
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column (Message and Doily bank details card) - Desktop */}
        <div className="w-[60%] xl:w-[55%] h-full flex flex-col items-start justify-center pt-8 pb-8 pr-8 pl-2 xl:pt-12 xl:pb-12 xl:pr-12 xl:pl-4 text-left space-y-6 xl:space-y-8">
          <div className="space-y-4 max-w-md lg:max-w-lg">
            <FadeIn delay={0.3}>
              <h4 className="font-seasons text-[clamp(24px,2vw,32px)] leading-[1.3] text-[#4A3E3D] font-normal">
                Kehadiran Anda merupakan kebahagiaan terbesar bagi kami.
              </h4>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="font-lekton text-[#4A3E3D]/90 text-[clamp(13px,1.1vw,15px)] leading-relaxed font-light text-left">
                Bagi keluarga dan sahabat yang berkenan memberikan tanda kasih untuk pernikahan kami, kami mengucapkan terima kasih atas segala doa, perhatian, dan kebaikan yang diberikan. Apabila Anda ingin memberikan hadiah, kami dengan senang hati menerima melalui informasi berikut:
              </p>
            </FadeIn>
          </div>

          <div className="w-full flex justify-start">
            <div className="flex flex-row gap-2 xl:gap-2.5 w-full justify-start">
              {paymentAccounts.map((acc, i) => {
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
                    className="relative w-[304px] xl:w-[330px] flex-none"
                  >
                    <motion.div
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative w-full aspect-[560/345] flex items-center justify-center text-[#4A3E3D] font-seasons cursor-pointer"
                    >
                      <Image
                        src={`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf'}/${project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'}/gift-lace.png`}
                        alt="Lace Card Frame"
                        fill
                        sizes="(max-width: 1280px) 400px, 480px"
                        className="object-contain pointer-events-none select-none"
                        unoptimized
                      />
                      <div 
                        className="relative z-10 flex flex-col items-center justify-center text-center p-4 -mt-2 w-[85%] h-[80%] origin-center"
                        style={{ transform: "rotate(-3.5deg)" }}
                      >
                        <span className="text-[clamp(10px,1.1vw,13px)] tracking-[0.2em] font-light uppercase text-[#4A3E3D]/80">
                          {bankName}
                        </span>
                        <span className="text-[clamp(11px,1.2vw,15px)] font-normal text-[#4A3E3D] mt-[clamp(1px,0.2vw,4px)] mb-[clamp(1px,0.2vw,4px)] tracking-wide text-center w-full whitespace-normal break-words px-2 leading-tight">
                          {ownerName}
                        </span>
                        <span className="font-lekton italic text-[clamp(11px,1.2vw,14px)] text-[#4A3E3D] tracking-[0.12em] mb-[clamp(2px,0.4vw,8px)] select-text">
                          {accountNo}
                        </span>
                        <button
                          onClick={() => copyToClipboard(accountNo)}
                          className="font-lekton text-white text-[clamp(7px,0.75vw,10px)] tracking-[0.2em] uppercase px-[clamp(10px,1.5vw,22px)] py-[clamp(1.5px,0.25vw,4px)] bg-[#4A2511] hover:bg-[#3D1E0E] active:scale-95 rounded-full transition-all duration-300 cursor-pointer shadow-sm mt-0.5"
                        >
                          Copy
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked vertical layout */}
      <div className="flex md:hidden flex-col items-center w-full px-5 gap-6">
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="flex flex-col items-center select-none"
        >
          <span className="font-parfumerie text-[#4A3E3D] text-[56px] leading-none italic font-light z-10 -mb-2">
            Hadiah
          </span>
          <h3 className="font-seasons text-[#4A3E3D] text-[32px] font-normal uppercase leading-none tracking-[0.08em]">
            PERNIKAHAN
          </h3>
        </motion.div>

        {/* Bird illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="relative w-[140px] h-[80px] select-none pointer-events-none -mt-1"
        >
          <Image
            src={`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf'}/${project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'}/gift-bird.png`}
            alt="Bird Illustration"
            fill
            sizes="140px"
            className="object-contain"
            unoptimized
          />
        </motion.div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full max-w-[280px]">
          <div className="flex-1 h-[0.5px] bg-[#4A3E3D]/20"></div>
          <span className="text-[#4A3E3D]/30 text-[10px]">✦</span>
          <div className="flex-1 h-[0.5px] bg-[#4A3E3D]/20"></div>
        </div>

        {/* Message */}
        <div className="space-y-3 max-w-xs text-center">
          <FadeIn delay={0.3}>
            <h4 className="font-seasons text-[18px] leading-[1.35] text-[#4A3E3D] font-normal">
              Kehadiran Anda merupakan kebahagiaan terbesar bagi kami.
            </h4>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="font-lekton text-[#4A3E3D]/80 text-[12px] leading-[1.7] font-light text-justify">
              Bagi keluarga dan sahabat yang berkenan memberikan tanda kasih untuk pernikahan kami, kami mengucapkan terima kasih atas segala doa, perhatian, dan kebaikan yang diberikan. Apabila Anda ingin memberikan hadiah, kami dengan senang hati menerima melalui informasi berikut.
            </p>
          </FadeIn>
        </div>

        {/* Doily Card */}
        <div className="w-full flex justify-center mt-2">
          <div className="flex flex-col gap-5 w-full items-center">
            {paymentAccounts.map((acc, i) => {
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
                  className="relative"
                >
                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-[340px] h-[210px] flex items-center justify-center text-[#4A3E3D] font-seasons cursor-pointer"
                  >
                    <Image
                      src={`https://xnruifsptjsafctjwqdh.supabase.co/storage/v1/object/public/undangan/${project?.user_id || 'a3e99edc-aab7-4a84-b0c6-986a2fd0b0bf'}/${project?.id || 'f93ad18d-cba2-4de0-a86b-b1fadf2783a2'}/gift-lace.png`}
                      alt="Lace Card Frame"
                      fill
                      sizes="340px"
                      className="object-contain pointer-events-none select-none"
                      unoptimized
                    />
                    <div 
                      className="relative z-10 flex flex-col items-center justify-center text-center p-3 -mt-1 w-[80%] h-[75%] origin-center"
                      style={{ transform: "rotate(-3.5deg)" }}
                    >
                      <span className="text-[13px] tracking-[0.2em] font-light uppercase text-[#4A3E3D]/80">
                        {bankName}
                      </span>
                      <span className="text-[18px] font-normal text-[#4A3E3D] mt-0.5 mb-1 tracking-wide text-center w-full truncate px-2">
                        {ownerName}
                      </span>
                      <span className="font-lekton italic text-[15px] text-[#4A3E3D] tracking-[0.12em] mb-2 select-text">
                        {accountNo}
                      </span>
                      <button
                        onClick={() => copyToClipboard(accountNo)}
                        className="font-lekton text-white text-[11px] tracking-[0.2em] uppercase px-7 py-1.5 bg-[#4A2511] hover:bg-[#3D1E0E] active:scale-95 rounded-full transition-all duration-300 cursor-pointer shadow-md"
                      >
                        Copy
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="flex items-center gap-3 w-full max-w-[200px] mt-2 mb-4">
          <div className="flex-1 h-[0.5px] bg-[#4A3E3D]/15"></div>
          <span className="text-[#4A3E3D]/25 text-[8px] tracking-[0.3em] font-lekton uppercase">with love</span>
          <div className="flex-1 h-[0.5px] bg-[#4A3E3D]/15"></div>
        </div>
      </div>
    </section>
  );
}

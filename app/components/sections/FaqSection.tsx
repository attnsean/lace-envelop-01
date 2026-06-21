"use client";

import React from "react";
import FadeIn from "../FadeIn";
import { DbProject } from "../../../lib/resolveProject";

interface Props {
  project?: DbProject | null;
}

export default function FaqSection({ project }: Props) {
  const defaultFaqs = [
    {
      question: "Can I arrive in the middle of the event?",
      answer: "We kindly recommend arriving on time, as the celebration will feature a seated set-menu dining experience served at specific times throughout the evening. Arriving late may result in missed courses."
    },
    {
      question: "Can I bring a plus one?",
      answer: "This is an intimate destination wedding with limited seating. Kindly note that only named guests in the invitation are included."
    },
    {
      question: "Can children attend the wedding?",
      answer: "To maintain the atmosphere and seating arrangements, attendance is limited to guests listed on the invitation."
    },
    {
      question: "Is there a dress code?",
      answer: "Guests are welcome to wear any style or color they feel comfortable in, as long as it is appropriate for the occasion. We kindly ask guests to avoid white, cream, or overly bright/light colors, and encourage darker tones instead."
    },
    {
      question: "Can I choose my seat/table?",
      answer: "Seating has been thoughtfully arranged by the couple and families. Your assigned table information will be available upon arrival."
    }
  ];

  const rawFaqs = project?.faqs;
  const faqs = Array.isArray(rawFaqs) && rawFaqs.length > 0
    ? rawFaqs.map((f: any) => ({
        question: f.question || f.q || "",
        answer: f.answer || f.a || ""
      })).filter(f => f.question && f.answer)
    : defaultFaqs;

  return (
    <section id="faq" className="relative w-full h-auto min-h-[100dvh] snap-start shrink-0 bg-[#363D22] text-white flex flex-col justify-start items-center select-none pt-24 pb-16">
      <div className="w-full max-w-2xl px-6 md:px-8 flex flex-col items-center justify-start text-center space-y-6 md:space-y-8">
        {/* Header */}
        <FadeIn delay={0.1}>
          <h2 className="font-seasons text-[clamp(44px,9vw,64px)] md:text-[clamp(56px,5vw,78px)] font-normal tracking-wide text-white leading-none">
            FAQs
          </h2>
        </FadeIn>

        {/* FAQ Q&A Container */}
        <div className="flex flex-col space-y-6 md:space-y-8 w-full py-2">
          {faqs.map((faq, idx) => (
            <FadeIn key={idx} delay={0.2 + idx * 0.1} className="w-full">
              <div className="space-y-1.5 md:space-y-2.5">
                <h4 className="font-seasons italic text-[#E1D8CC] text-[clamp(16.5px,3.2vw,21px)] md:text-[clamp(19px,1.6vw,24px)] font-medium tracking-wide">
                  {faq.question}
                </h4>
                <p className="font-seasons text-[#D2CFC7]/90 text-[clamp(13px,2.4vw,15.5px)] md:text-[clamp(14.5px,1.25vw,17px)] leading-relaxed max-w-xl mx-auto font-light">
                  {faq.answer}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

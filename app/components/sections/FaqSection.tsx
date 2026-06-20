"use client";

import React from "react";
import FadeIn from "../FadeIn";

export default function FaqSection() {
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
  );
}

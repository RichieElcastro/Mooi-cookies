import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import heroCookiesImg from '../assets/images/mooi_hero_cookies_1790400508412.jpg';

interface HeroBannerProps {
  onPreOrderClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onPreOrderClick }) => {
  return (
    <div className="relative bg-[#F3E9DD] overflow-hidden pt-6 pb-12 sm:py-16 border-b border-[#E7D5C4]">
      {/* Decorative background doodles */}
      <div className="absolute top-6 left-8 pointer-events-none opacity-20 text-[#633F35]">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M12 24C16 12 32 12 36 24C32 36 16 36 12 24Z" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-6 text-[#633F35] z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9F2] border border-[#E7D5C4] text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#8A5A4D] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A5A4D] animate-pulse"></span>
              <span>HOMEMADE COOKIES • SMALL BATCH</span>
            </div>

            {/* Massive Groovy Editorial Headline */}
            <div className="relative">
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tight uppercase text-[#633F35]">
                MOOI<br />
                BITES<br />
                COOKIE
              </h1>

              {/* Hand-drawn tiny decorative doodles */}
              <div className="absolute -top-3 right-8 sm:right-16 text-[#8A5A4D] opacity-70">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z" />
                </svg>
              </div>
              <div className="absolute top-1/2 -right-4 text-[#633F35] opacity-50 hidden sm:block">
                <Heart className="w-5 h-5 fill-[#8A5A4D]/20 text-[#8A5A4D]" />
              </div>
            </div>

            {/* Tagline */}
            <p className="font-display italic text-xl sm:text-2xl text-[#8A5A4D]">
              &ldquo;A little bite, a lot of love.&rdquo;
            </p>

            {/* Indonesian Brand Description */}
            <p className="text-sm sm:text-base text-[#633F35]/85 leading-relaxed max-w-xl font-medium">
              Cookies homemade dengan bahan premium, tekstur chewy di dalam, crispy di luar, dan rasa yang bikin nagih.
            </p>

            {/* CTA Button & Hand-drawn arrow */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={onPreOrderClick}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#633F35] text-[#FFF9F2] hover:bg-[#4E3129] active:scale-[0.98] transition-all shadow-lg shadow-[#633F35]/15 font-semibold text-base"
              >
                <span>Pre-Order Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              {/* Hand drawn arrow pointing from text to button/cookies */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#8A5A4D] italic pl-2">
                <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="text-[#8A5A4D]">
                  <path d="M2 15C12 17 24 15 36 6M36 6L28 4M36 6L33 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Fresh batch 21 April 2025</span>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Cookie Photography Dominating Hero */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            {/* Cream decorative circle container behind cookies */}
            <div className="relative mx-auto max-w-[500px]">
              <div className="absolute inset-0 bg-[#FFF9F2] rounded-[2.5rem] rotate-3 transform scale-95 border border-[#E7D5C4]/80 shadow-md"></div>
              
              {/* Main Cookie Image Container */}
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-[#E7D5C4] shadow-2xl shadow-[#633F35]/10 bg-[#FFF9F2] aspect-[4/3] group">
                <img
                  src={heroCookiesImg}
                  alt="Mooi Bites Cookie - Stack of Freshly Baked Chunky Cookies"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#FFF9F2]/95 backdrop-blur-xs rounded-xl p-3 border border-[#E7D5C4] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#633F35] text-[#FFF9F2] flex items-center justify-center font-display font-bold text-sm">
                      MB
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-[#633F35] text-xs sm:text-sm">Small Batch Artisan</h4>
                      <p className="text-[10px] text-[#8A5A4D]">100% Real French Butter & Belgian Choc</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#633F35] bg-[#E7D5C4]/60 px-2.5 py-1 rounded-md">
                    Fresh Oven
                  </span>
                </div>
              </div>

              {/* Hand-drawn decorative heart & sparkles stickers around photo */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FFF9F2] rounded-full border border-[#E7D5C4] flex items-center justify-center shadow-md rotate-12">
                <Heart className="w-6 h-6 text-[#8A5A4D] fill-[#8A5A4D]" />
              </div>

              <div className="absolute -bottom-3 -left-3 px-3 py-1.5 bg-[#FFF9F2] rounded-full border border-[#E7D5C4] flex items-center gap-1.5 shadow-sm -rotate-6">
                <Sparkles className="w-3.5 h-3.5 text-[#8A5A4D]" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#633F35]">Gooey & Soft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

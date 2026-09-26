import React from 'react';
import { Heart, MessageCircle, Instagram, Phone, MapPin, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavClick: (view: 'catalog' | 'how-to-order' | 'track-order' | 'contact') => void;
  onKitchenAccessClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onKitchenAccessClick }) => {
  const WHATSAPP_NUMBER = '0857 4882 9148';
  const WHATSAPP_LINK = 'https://wa.me/6285748829148?text=Halo%20Mooi%20Bites%20Cookie,%20saya%20ingin%20tanya%20seputar%20preorder%20cookie%20batch%20ini';

  return (
    <footer className="bg-[#633F35] text-[#FFF9F2] pt-14 pb-24 sm:pb-14 border-t-4 border-[#8A5A4D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[#FFF9F2]">
              MOOI BITES COOKIE
            </h3>

            <p className="font-display italic text-lg sm:text-xl text-[#E7D5C4]">
              &ldquo;A little bite, a lot of love.&rdquo;
            </p>

            <p className="text-xs sm:text-sm text-[#FFF9F2]/75 leading-relaxed max-w-sm">
              Artisan handcrafted cookies, freshly baked per preorder batch dengan resep otentik, butter Prancis, dan lelehan cokelat premium.
            </p>

            {/* WhatsApp CTA as specified */}
            <div className="pt-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FFF9F2] text-[#633F35] font-bold text-xs sm:text-sm hover:bg-[#F3E9DD] transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Chat via WhatsApp ({WHATSAPP_NUMBER})</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-base text-[#FFF9F2] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FFF9F2]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('catalog')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('catalog')}
                  className="hover:text-white transition-colors"
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('how-to-order')}
                  className="hover:text-white transition-colors"
                >
                  How to Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('track-order')}
                  className="hover:text-white transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Location & Social Media */}
          <div className="md:col-span-4 space-y-3 text-xs sm:text-sm text-[#FFF9F2]/80">
            <h4 className="font-display font-bold text-base text-[#FFF9F2] uppercase tracking-wider">
              Bake Studio & Info
            </h4>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-[#FFF9F2]/75">
              <MapPin className="w-4 h-4 shrink-0 text-[#E7D5C4] mt-0.5" />
              <span>Jl. Darmo Permai Timur No. 18, Dukuh Pakis, Surabaya, Jawa Timur 60226</span>
            </p>
            <p className="flex items-center gap-2 text-xs text-[#FFF9F2]/75">
              <Phone className="w-4 h-4 shrink-0 text-[#E7D5C4]" />
              <span>WhatsApp: 0857 4882 9148</span>
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#8A5A4D] text-[#FFF9F2] flex items-center justify-center hover:bg-[#4E3129] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#8A5A4D] text-[#FFF9F2] flex items-center justify-center hover:bg-[#4E3129] transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            {/* Secret / Staff quick access */}
            {onKitchenAccessClick && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onKitchenAccessClick}
                  className="text-[11px] text-[#E7D5C4]/70 hover:text-white underline decoration-dotted transition-colors"
                >
                  Portal Admin & Dapur Dapur Mooi Bites →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#8A5A4D]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF9F2]/60">
          <p>© 2025 Mooi Bites Cookie. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Baked with</span>
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
            <span>in Surabaya, Indonesia</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Plus, Minus, Package, Gift, Sparkles, Check, ArrowRight } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import boxCookiesImg from '../assets/images/mooi_box_cookies_1790400527017.jpg';

interface BuildYourBoxSectionProps {
  menuItems: MenuItem[];
  onAddBoxToCart: (
    boxItems: { item: MenuItem; count: number }[],
    hasPremiumPackaging: boolean,
    totalPrice: number,
  ) => void;
}

export const BuildYourBoxSection: React.FC<BuildYourBoxSectionProps> = ({
  menuItems,
  onAddBoxToCart,
}) => {
  // Pre-seed with the exact example from the spec: 2 Classic OG, 2 Double Choco, 1 Red Velvet, 1 Brownies
  const [flavorCounts, setFlavorCounts] = useState<Record<string, number>>({
    'mooi-classic-og': 2,
    'mooi-double-choco': 2,
    'mooi-red-velvet': 1,
    'mooi-brownies-cookie': 1,
  });

  const [hasPremiumPackaging, setHasPremiumPackaging] = useState<boolean>(true);
  const PREMIUM_BOX_PRICE = 8000;

  const totalCookies: number = (Object.values(flavorCounts) as number[]).reduce(
    (acc: number, count: number) => acc + count,
    0,
  );
  const minRequired = 6;

  const handleIncrement = (itemId: string) => {
    setFlavorCounts((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleDecrement = (itemId: string) => {
    setFlavorCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1),
    }));
  };

  // Calculate total price of all cookies chosen + packaging
  const cookiesPrice: number = (Object.entries(flavorCounts) as [string, number][]).reduce(
    (acc: number, [id, count]: [string, number]) => {
      const item = menuItems.find((m) => m.id === id);
      return acc + (item ? item.price * count : 0);
    },
    0,
  );

  const grandTotal = cookiesPrice + (hasPremiumPackaging ? PREMIUM_BOX_PRICE : 0);

  const handleCreateBox = () => {
    if (totalCookies < minRequired) return;

    const chosenItems = (Object.entries(flavorCounts) as [string, number][])
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const item = menuItems.find((m) => m.id === id)!;
        return { item, count };
      });

    onAddBoxToCart(chosenItems, hasPremiumPackaging, grandTotal);
  };

  return (
    <section id="build-your-box" className="py-12 sm:py-16 bg-[#FFF9F2] border-y-2 border-[#E7D5C4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E9DD] border border-[#E7D5C4] text-xs font-bold uppercase tracking-wider text-[#633F35]">
            <Package className="w-3.5 h-3.5 text-[#8A5A4D]" />
            <span>Mix & Match Custom Assortment</span>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-5xl text-[#633F35] tracking-tight">
            Build Your Box
          </h2>

          <p className="text-sm sm:text-base text-[#8A5A4D] font-medium">
            Mix your favorite flavors and make it extra special. Minimum 6 cookies per box.
          </p>
        </div>

        {/* Main Box Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Visual Gift Box Image & Slot Visualizer */}
          <div className="lg:col-span-5 space-y-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#E7D5C4] bg-[#F3E9DD] aspect-[4/3] shadow-md group">
              <img
                src={boxCookiesImg}
                alt="Mooi Bites Custom Cookie Gift Box"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#FFF9F2]/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#E7D5C4] text-xs font-bold text-[#633F35] flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#8A5A4D]" />
                <span>Gift-Ready Box</span>
              </div>
            </div>

            {/* Visual 6 Slots Grid */}
            <div className="bg-[#F3E9DD] rounded-2xl p-5 border border-[#E7D5C4] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#633F35]">
                <span>Status Isi Box:</span>
                <span className={totalCookies >= minRequired ? 'text-emerald-700' : 'text-[#8A5A4D]'}>
                  {totalCookies} / {minRequired} Cookies {totalCookies >= minRequired && '✓ Lengkap'}
                </span>
              </div>

              {/* 6 Circular Cookie Visual Slots */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const isFilled = idx < totalCookies;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                        isFilled
                          ? 'bg-[#633F35] border-[#633F35] text-[#FFF9F2] shadow-xs'
                          : 'bg-[#FFF9F2] border-dashed border-[#8A5A4D]/50 text-[#8A5A4D]/40'
                      }`}
                    >
                      {isFilled ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalCookies < minRequired && (
                <p className="text-[11px] text-[#8A5A4D] text-center italic">
                  Pilih {minRequired - totalCookies} cookies lagi untuk melengkapi box
                </p>
              )}
            </div>
          </div>

          {/* Right Side: Flavor Selectors & Packaging Option */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#F3E9DD] rounded-3xl p-5 sm:p-7 border-2 border-[#E7D5C4] space-y-4">
              <h3 className="font-display font-bold text-xl text-[#633F35]">
                Pilih Varian Rasa Favorit:
              </h3>

              {/* Flavor Selector List */}
              <div className="space-y-3">
                {menuItems.map((item) => {
                  const count = flavorCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-[#FFF9F2] rounded-2xl p-3.5 sm:p-4 border border-[#E7D5C4] flex items-center justify-between gap-3 shadow-2xs hover:border-[#633F35]/40 transition-all"
                    >
                      {/* Flavor Info */}
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E7D5C4]"
                        />
                        <div>
                          <h4 className="font-display font-bold text-base text-[#633F35]">
                            {item.name}
                          </h4>
                          <span className="text-xs font-semibold text-[#8A5A4D]">
                            {formatRupiah(item.price)} / pcs
                          </span>
                        </div>
                      </div>

                      {/* +/- Counter */}
                      <div className="flex items-center gap-2 border-2 border-[#E7D5C4] rounded-xl bg-[#F3E9DD] p-1">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.id)}
                          disabled={count <= 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#633F35] hover:bg-[#FFF9F2] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-display font-bold text-sm text-[#633F35]">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#633F35] hover:bg-[#FFF9F2] transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Premium Packaging Option */}
              <div
                onClick={() => setHasPremiumPackaging(!hasPremiumPackaging)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  hasPremiumPackaging
                    ? 'bg-[#FFF9F2] border-[#633F35] shadow-xs'
                    : 'bg-[#FFF9F2]/60 border-[#E7D5C4] opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      hasPremiumPackaging
                        ? 'bg-[#633F35] border-[#633F35] text-[#FFF9F2]'
                        : 'border-[#8A5A4D] bg-[#FFF9F2]'
                    }`}
                  >
                    {hasPremiumPackaging && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-[#633F35]">
                      Packaging Box Eksklusif & Kartu Ucapan
                    </h5>
                    <p className="text-[11px] text-[#8A5A4D]">
                      Hardbox kokoh food-grade, pita satin cokelat Mooi, dan kartu ucapan kado.
                    </p>
                  </div>
                </div>

                <span className="font-display font-bold text-sm text-[#633F35] shrink-0">
                  +{formatRupiah(PREMIUM_BOX_PRICE)}
                </span>
              </div>

              {/* Total & CTA */}
              <div className="pt-3 border-t border-[#E7D5C4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-[#8A5A4D] tracking-wider block">
                    Total Box ({totalCookies} Cookies)
                  </span>
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#633F35]">
                    {formatRupiah(grandTotal)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateBox}
                  disabled={totalCookies < minRequired}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#633F35] hover:bg-[#4E3129] active:scale-[0.98] text-[#FFF9F2] font-bold text-sm sm:text-base shadow-lg shadow-[#633F35]/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Create Your Box</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

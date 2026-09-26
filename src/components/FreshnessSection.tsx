import React from 'react';
import { Sparkles, Calendar, Box, ThermometerSnowflake, Flame } from 'lucide-react';

export const FreshnessSection: React.FC = () => {
  const cards = [
    {
      title: 'Best Enjoyed',
      highlight: 'Within 3 Days',
      detail: 'Untuk mendapatkan tekstur chewy di dalam & renyah di luar yang paling maksimal.',
      icon: Calendar,
    },
    {
      title: 'Store Properly',
      highlight: 'Room Temperature',
      detail: 'Simpan di dalam wadah kedap udara atau box asli pada suhu ruang normal.',
      icon: Box,
    },
    {
      title: 'Keep Chilled',
      highlight: 'Up to 7 Days',
      detail: 'Bisa disimpan di chiller kulkas hingga satu minggu untuk kesegaran tahan lama.',
      icon: ThermometerSnowflake,
    },
    {
      title: 'Warm It Up',
      highlight: '10–15 Seconds',
      detail: 'Panaskan di microwave selama 10–15 detik atau oven 160°C selama 3 menit agar melted.',
      icon: Flame,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#FFF9F2] border-b-2 border-[#E7D5C4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E9DD] border border-[#E7D5C4] text-xs font-bold uppercase tracking-wider text-[#633F35]">
            <Sparkles className="w-3.5 h-3.5 text-[#8A5A4D]" />
            <span>Artisan Care Guide</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#633F35] tracking-tight">
            Freshness You Can Taste
          </h2>

          <p className="text-sm sm:text-base text-[#8A5A4D] font-medium leading-relaxed">
            Kami menggunakan bahan premium tanpa pengawet, untuk rasa terbaik di setiap gigitan.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-[#F3E9DD] rounded-3xl p-6 border-2 border-[#E7D5C4] hover:border-[#633F35]/40 transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5A4D]">
                    {card.title}
                  </span>
                  <h3 className="font-display font-bold text-2xl text-[#633F35]">
                    {card.highlight}
                  </h3>
                  <p className="text-xs text-[#633F35]/75 leading-relaxed pt-1">
                    {card.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Cookie, Calendar, CreditCard, Flame, Truck } from 'lucide-react';

export const HowToOrderSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Cookies',
      desc: 'Pilih varian favorit atau build custom box isi 6.',
      icon: Cookie,
    },
    {
      num: '02',
      title: 'Select Preorder Date',
      desc: 'Tentukan tanggal produksi batch dan slot jam pickup/antar.',
      icon: Calendar,
    },
    {
      num: '03',
      title: 'Complete Payment',
      desc: 'Bayar mudah melalui QRIS instan, Transfer BCA/Mandiri, atau E-wallet.',
      icon: CreditCard,
    },
    {
      num: '04',
      title: 'We Bake Fresh',
      desc: 'Cookies dipanggang tepat di hari H demi tekstur gooey terbaik.',
      icon: Flame,
    },
    {
      num: '05',
      title: 'Pickup / Delivery',
      desc: 'Ambil langsung di outlet kami atau kami kirim aman ke alamatmu.',
      icon: Truck,
    },
  ];

  return (
    <section id="how-to-order" className="py-14 sm:py-20 bg-[#F3E9DD] border-b-2 border-[#E7D5C4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A5A4D] bg-[#FFF9F2] px-3.5 py-1.5 rounded-full border border-[#E7D5C4]">
            Cara Pesan Mudah & Praktis
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#633F35] tracking-tight">
            How to Order
          </h2>
          <p className="text-sm sm:text-base text-[#8A5A4D]">
            5 langkah sederhana menikmati kelezatan freshly-baked cookies dari oven kami.
          </p>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-[#FFF9F2] rounded-3xl p-6 border-2 border-[#E7D5C4] hover:border-[#633F35]/40 transition-all flex flex-col justify-between shadow-2xs group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-extrabold text-3xl text-[#8A5A4D]/60 group-hover:text-[#633F35] transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#F3E9DD] text-[#633F35] flex items-center justify-center border border-[#E7D5C4]">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#633F35] leading-snug mb-1.5">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#8A5A4D] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#8A5A4D]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

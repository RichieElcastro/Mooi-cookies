import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Flame, Sparkles } from 'lucide-react';

interface PreorderStatusCardProps {
  batchNumber?: string;
  productionDate?: string;
  remainingSlots?: number;
  totalSlots?: number;
  onOrderClick?: () => void;
}

export const PreorderStatusCard: React.FC<PreorderStatusCardProps> = ({
  batchNumber = 'Batch #12',
  productionDate = '21 April 2025',
  remainingSlots = 42,
  totalSlots = 100,
  onOrderClick,
}) => {
  // Countdown timer initialized to 21 hours, 47 minutes, 32 seconds as specified
  const [secondsLeft, setSecondsLeft] = useState(21 * 3600 + 47 * 60 + 32);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  const filledSlots = totalSlots - remainingSlots;
  const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#E7D5C4] p-5 sm:p-7 shadow-xl shadow-[#633F35]/5 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Col 1: Preorder Batch info */}
          <div className="md:col-span-4 space-y-1.5 border-b md:border-b-0 md:border-r border-[#E7D5C4] pb-4 md:pb-0 md:pr-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E9DD] text-[#633F35] text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#8A5A4D]" />
              <span>Preorder {batchNumber}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#8A5A4D] font-semibold">Next production:</p>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#633F35] tracking-tight">
                {productionDate}
              </h3>
            </div>
            <p className="text-xs text-[#8A5A4D] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Pengiriman & Pickup mulai pukul 09:00 WIB</span>
            </p>
          </div>

          {/* Col 2: Live Countdown Timer */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E7D5C4] pb-4 md:pb-0 md:px-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A5A4D] uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Slot PO Ditutup Dalam:</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#633F35] text-[#FFF9F2] flex items-center justify-center font-display font-bold text-2xl sm:text-3xl shadow-sm">
                  {padZero(hours)}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8A5A4D] uppercase tracking-wider mt-1.5">
                  Hours
                </span>
              </div>

              <span className="text-[#633F35] font-display font-bold text-2xl pb-4">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#633F35] text-[#FFF9F2] flex items-center justify-center font-display font-bold text-2xl sm:text-3xl shadow-sm">
                  {padZero(minutes)}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8A5A4D] uppercase tracking-wider mt-1.5">
                  Minutes
                </span>
              </div>

              <span className="text-[#633F35] font-display font-bold text-2xl pb-4">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#633F35] text-[#FFF9F2] flex items-center justify-center font-display font-bold text-2xl sm:text-3xl shadow-sm">
                  {padZero(seconds)}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8A5A4D] uppercase tracking-wider mt-1.5">
                  Seconds
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Slot Progress Bar & Quick Order */}
          <div className="md:col-span-4 space-y-3 md:pl-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-[#633F35]">
                  {remainingSlots}
                </span>
                <span className="text-[#8A5A4D] font-bold text-lg"> / {totalSlots}</span>
              </div>
              <span className="text-xs font-bold text-[#633F35] bg-[#E7D5C4]/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Remaining slots
              </span>
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#E7D5C4]/70 overflow-hidden p-0.5 border border-[#E7D5C4]">
              <div
                className="h-full rounded-full bg-[#633F35] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8A5A4D] font-medium">
              <span>{filledSlots} slot telah terpesan</span>
              <span className="font-bold text-[#633F35]">{remainingSlots} slot tersisa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

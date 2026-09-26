import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Flame,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { Order } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialOrderNumber?: string;
  initialPhone?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialOrderNumber = '',
  initialPhone = '',
}) => {
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumberInput(initialOrderNumber);
      const match = orders.find(
        (o) => o.id.toLowerCase() === initialOrderNumber.toLowerCase(),
      );
      if (match) {
        setFoundOrder(match);
        setHasSearched(true);
      }
    } else if (orders.length > 0 && !foundOrder) {
      // Default to the first order for instant preview
      setOrderNumberInput(orders[0].id);
      setPhoneInput(orders[0].customerPhone);
      setFoundOrder(orders[0]);
    }
  }, [initialOrderNumber, isOpen, orders]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    const cleanOrderNumber = orderNumberInput.trim().toLowerCase();
    const cleanPhone = phoneInput.trim();

    const match = orders.find((o) => {
      const matchId = o.id.toLowerCase() === cleanOrderNumber || o.id.toLowerCase() === `#${cleanOrderNumber}`;
      if (cleanPhone) {
        return matchId || o.customerPhone.includes(cleanPhone);
      }
      return matchId;
    });

    setFoundOrder(match || null);
  };

  // Timeline Step Status Mapping
  const getTimelineStatus = (order: Order) => {
    const status = order.orderStatus;
    const isPaid = order.paymentStatus === 'lunas';

    // 1. Order Placed: always done
    // 2. Payment Confirmed: done if isPaid or status beyond 'menunggu_konfirmasi'
    // 3. Being Prepared: done if 'diproses_dapur', 'siap', 'selesai'
    // 4. Ready: done if 'siap', 'selesai'
    // 5. Picked Up / Delivered: done if 'selesai'

    const steps = [
      {
        id: 'placed',
        title: 'Order Placed',
        detail: 'Pesanan berhasil terdaftar dalam sistem preorder Mooi Bites.',
        timestamp: formatDateIndo(order.createdAt),
        state: 'done' as const,
      },
      {
        id: 'payment',
        title: 'Payment Confirmed',
        detail: isPaid
          ? 'Pembayaran telah kami terima & diverifikasi.'
          : 'Menunggu transfer / konfirmasi admin.',
        timestamp: isPaid ? 'Lunas (Otomatis)' : 'Menunggu',
        state: isPaid ? ('done' as const) : ('current' as const),
      },
      {
        id: 'prepared',
        title: 'Being Prepared',
        detail: 'Cookies sedang dipersiapkan dan dipanggang fresh di oven utama.',
        timestamp: `Batch ${order.poDate}`,
        state:
          status === 'diproses_dapur'
            ? ('current' as const)
            : ['siap', 'selesai'].includes(status)
            ? ('done' as const)
            : ('pending' as const),
      },
      {
        id: 'ready',
        title: 'Ready',
        detail:
          order.orderType === 'pickup'
            ? 'Kotak cookies siap diambil di studio outlet.'
            : 'Dikemas rapi siap diserahkan ke kurir pengantar.',
        timestamp: order.poSlot,
        state:
          status === 'siap'
            ? ('current' as const)
            : status === 'selesai'
            ? ('done' as const)
            : ('pending' as const),
      },
      {
        id: 'completed',
        title: order.orderType === 'pickup' ? 'Picked Up' : 'Delivered',
        detail:
          order.orderType === 'pickup'
            ? 'Telah diambil oleh pelanggan. Selamat menikmati!'
            : 'Telah sampai di alamat tujuan.',
        timestamp: status === 'selesai' ? 'Selesai' : 'Estimasi hari H',
        state: status === 'selesai' ? ('done' as const) : ('pending' as const),
      },
    ];

    return steps;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#633F35]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF9F2] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border-2 border-[#E7D5C4] shadow-2xl flex flex-col relative text-[#633F35]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-[#E7D5C4] flex items-center justify-between bg-[#F3E9DD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#633F35] text-[#FFF9F2] flex items-center justify-center shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#633F35]">
                Track Order
              </h2>
              <p className="text-xs text-[#8A5A4D] font-medium">
                Pantau proses baking dan status pengiriman cookies Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] flex items-center justify-center hover:bg-[#E7D5C4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Tracking Form */}
          <form onSubmit={handleSearch} className="bg-[#F3E9DD] rounded-2xl p-4 sm:p-5 border border-[#E7D5C4] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="Contoh: #MB-1024"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D5C4] bg-[#FFF9F2] text-xs font-bold text-[#633F35] focus:outline-hidden focus:border-[#633F35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D5C4] bg-[#FFF9F2] text-xs font-medium text-[#633F35] focus:outline-hidden focus:border-[#633F35]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#633F35] hover:bg-[#4E3129] text-[#FFF9F2] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Lacak Pesanan</span>
            </button>
          </form>

          {/* Sample quick order clickers for effortless demo checking */}
          {orders.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8A5A4D]">
              <span className="font-semibold">Coba contoh pesanan aktif:</span>
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setOrderNumberInput(o.id);
                    setPhoneInput(o.customerPhone);
                    setFoundOrder(o);
                    setHasSearched(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#F3E9DD] hover:bg-[#E7D5C4] font-bold text-[#633F35] border border-[#E7D5C4]"
                >
                  {o.id}
                </button>
              ))}
            </div>
          )}

          {/* Timeline Display */}
          {foundOrder ? (
            <div className="space-y-6">
              {/* Order Info Card */}
              <div className="bg-[#FFF9F2] rounded-2xl p-4 sm:p-5 border-2 border-[#E7D5C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F3E9DD] text-[10px] font-bold text-[#633F35] uppercase mb-1">
                    Preorder Batch {foundOrder.poDate}
                  </div>
                  <h3 className="font-display font-black text-2xl text-[#633F35]">
                    {foundOrder.id}
                  </h3>
                  <p className="text-xs text-[#8A5A4D]">
                    {foundOrder.customerName} • {foundOrder.orderType.toUpperCase()} ({foundOrder.poSlot})
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] text-[#8A5A4D] font-bold uppercase block">Total Nilai</span>
                  <span className="font-display font-black text-xl text-[#633F35]">
                    {formatRupiah(foundOrder.total)}
                  </span>
                </div>
              </div>

              {/* Exact Timeline Structure as Requested */}
              <div className="bg-[#F3E9DD] rounded-3xl p-6 border-2 border-[#E7D5C4] space-y-6">
                <h4 className="font-display font-bold text-base text-[#633F35]">
                  Status Pengerjaan Pesanan
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7D5C4]">
                  {getTimelineStatus(foundOrder).map((step) => {
                    const isDone = step.state === 'done';
                    const isCurrent = step.state === 'current';
                    return (
                      <div key={step.id} className="relative group">
                        {/* Status Icon */}
                        <div
                          className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-[#633F35] text-[#FFF9F2] ring-4 ring-[#633F35]/20 animate-pulse'
                              : 'bg-[#FFF9F2] border-2 border-[#8A5A4D]/40 text-transparent'
                          }`}
                        >
                          {isDone ? '✓' : isCurrent ? '●' : '○'}
                        </div>

                        {/* Step Details */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className={`font-display font-bold text-sm ${
                                isDone || isCurrent ? 'text-[#633F35]' : 'text-[#8A5A4D]'
                              }`}
                            >
                              {step.title}
                            </h5>
                            <span className="text-[11px] font-semibold text-[#8A5A4D]">
                              {step.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-[#8A5A4D] leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Need help WhatsApp CTA */}
              <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E7D5C4] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-[#633F35]">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ada pertanyaan tentang pesananmu? Hubungi tim dapur via WhatsApp.</span>
                </div>
                <a
                  href={`https://wa.me/6285748829148?text=Halo%20Mooi%20Bites,%20saya%20ingin%20cek%20pesanan%20${foundOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#633F35] text-[#FFF9F2] font-bold shrink-0 hover:bg-[#4E3129]"
                >
                  Chat Dapur
                </a>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="bg-[#FFF9F2] rounded-2xl p-6 border border-[#E7D5C4] text-center space-y-2">
              <p className="font-display font-bold text-[#633F35]">
                Pesanan Tidak Ditemukan
              </p>
              <p className="text-xs text-[#8A5A4D]">
                Pastikan nomor pesanan benar (contoh: #MB-1024) atau gunakan nomor WhatsApp yang terdaftar saat checkout.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

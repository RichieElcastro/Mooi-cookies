import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  CheckCircle2,
  Share2,
  Printer,
  Copy,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  QrCode,
  Sparkles,
  Star,
  ReceiptText,
  User,
  Phone,
  Maximize2,
  Minimize2,
  ShoppingBag,
  ExternalLink,
  Check,
  XCircle,
} from 'lucide-react';
import { MenuItem, Order, StoreProfile } from '../types';
import {
  formatDateIndo,
  formatRupiah,
  generateWhatsAppOrderMessage,
  getStatusDetails,
  getWhatsAppLink,
} from '../utils/formatters';

interface OrderReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
  onSubmitRating?: (orderId: string, menuItemId: string, rating: number, comment?: string) => void;
  initialTab?: 'pickup_pass' | 'full_receipt';
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  storeProfile,
  onSubmitRating,
  initialTab = 'pickup_pass',
}) => {
  const [activeTab, setActiveTab] = useState<'pickup_pass' | 'full_receipt'>(initialTab);
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [draftRatings, setDraftRatings] = useState<
    Record<string, { rating: number; hoverRating: number; comment: string }>
  >({});
  const [submittingItemId, setSubmittingItemId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (order?.id) {
      QRCode.toDataURL(order.id, {
        width: 320,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const statusInfo = getStatusDetails(order.orderStatus);
  const waMessage = generateWhatsAppOrderMessage(order, storeProfile.name);
  const waUrl = getWhatsAppLink(storeProfile.whatsapp, waMessage);
  const isReady = order.orderStatus === 'siap';
  const isCompleted = order.orderStatus === 'selesai';
  const isCancelled = order.orderStatus === 'dibatalkan';
  const totalPorsi = order.items.reduce((acc, it) => acc + it.quantity, 0);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(order.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySummary = () => {
    navigator.clipboard?.writeText(waMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSetRating = (menuItemId: string, rating: number) => {
    setDraftRatings((prev) => ({
      ...prev,
      [menuItemId]: {
        rating,
        hoverRating: 0,
        comment: prev[menuItemId]?.comment || '',
      },
    }));
  };

  const handleHoverRating = (menuItemId: string, hoverRating: number) => {
    setDraftRatings((prev) => ({
      ...prev,
      [menuItemId]: {
        rating: prev[menuItemId]?.rating || 5,
        hoverRating,
        comment: prev[menuItemId]?.comment || '',
      },
    }));
  };

  const handleCommentChange = (menuItemId: string, comment: string) => {
    setDraftRatings((prev) => ({
      ...prev,
      [menuItemId]: {
        rating: prev[menuItemId]?.rating || 5,
        hoverRating: prev[menuItemId]?.hoverRating || 0,
        comment,
      },
    }));
  };

  const handleSendRating = (menuItemId: string, rating: number, comment?: string) => {
    if (!onSubmitRating) return;
    setSubmittingItemId(menuItemId);
    onSubmitRating(order.id, menuItemId, rating, comment);
    setTimeout(() => {
      setSubmittingItemId(null);
    }, 600);
  };

  const uniqueMenuItems: MenuItem[] = [];
  order.items.forEach((it) => {
    if (!uniqueMenuItems.some((m) => m.id === it.menuItem.id)) {
      uniqueMenuItems.push(it.menuItem);
    }
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div
        id="order-receipt-card"
        className={`relative bg-white w-full rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col transition-all ${
          isEnlarged ? 'max-w-2xl max-h-[96vh]' : 'max-w-xl max-h-[92vh]'
        }`}
      >
        {/* Top Header Banner */}
        <div
          className={`p-4 sm:p-5 relative overflow-hidden shrink-0 transition-colors ${
            isCancelled
              ? 'bg-rose-900 text-white'
              : isReady
              ? 'bg-emerald-800 text-white'
              : 'bg-amber-800 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                {isCancelled ? (
                  <XCircle className="w-6 h-6 text-rose-300" />
                ) : isReady ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                ) : (
                  <QrCode className="w-6 h-6 text-amber-200" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  {isCancelled
                    ? 'Pesanan Dibatalkan (Kuota Dikembalikan)'
                    : isReady
                    ? 'Pesanan Siap Diambil'
                    : 'Bukti Pemesanan Pre-Order'}
                </span>
                <h2 className="text-lg sm:text-xl font-black font-serif">
                  Resi #{order.id}
                </h2>
              </div>
            </div>

            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher: Resi Pengambilan vs Nota Biaya */}
          <div className="mt-4 grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-xl text-xs font-bold">
            <button
              type="button"
              id="tab-pickup-pass-btn"
              onClick={() => setActiveTab('pickup_pass')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pickup_pass'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4 text-amber-800" />
              <span>Resi Pengambilan (Tunjukkan ke Penjual)</span>
            </button>
            <button
              type="button"
              id="tab-full-receipt-btn"
              onClick={() => setActiveTab('full_receipt')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'full_receipt'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ReceiptText className="w-4 h-4 text-amber-800" />
              <span>Rincian Nota Biaya</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: RESI PENGAMBILAN (Tunjukkan ke Penjual Saat Ambil) */}
          {activeTab === 'pickup_pass' && (
            <div className="space-y-4">
              {/* Ready / Status Callout */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isCancelled
                    ? 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-400/40'
                    : isReady
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-400/40'
                    : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCancelled
                        ? 'bg-rose-600 text-white'
                        : isReady
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isCancelled ? (
                      <XCircle className="w-6 h-6" />
                    ) : isReady ? (
                      <CheckCircle2 className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold">
                        {isCancelled
                          ? 'PESANAN TELAH DIBATALKAN'
                          : isReady
                          ? 'PESANAN SIAP DIAMBIL SEKARANG'
                          : `Status: ${statusInfo.label}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      {isCancelled
                        ? 'Pesanan ini telah dibatalkan oleh dapur/admin. Kuota menu telah otomatis dikembalikan ke kuota slot PO.'
                        : isReady
                        ? 'Tunjukkan tiket resi ini kepada staf dapur untuk serah terima hidangan.'
                        : statusInfo.description}
                    </p>
                  </div>
                </div>

                {/* Toggle Enlarge view */}
                <button
                  type="button"
                  onClick={() => setIsEnlarged(!isEnlarged)}
                  className="p-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Perbesar tampilan agar mudah dibaca penjual"
                >
                  {isEnlarged ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isEnlarged ? 'Kecilkan' : 'Perbesar'}
                  </span>
                </button>
              </div>

              {/* TICKET / PICK-UP PASS CARD (High contrast for kitchen verification) */}
              <div
                id="pickup-verification-ticket"
                className="bg-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5 border-2 border-stone-700"
              >
                {/* Background watermark deco */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Pass Header */}
                <div className="flex items-start justify-between border-b border-stone-800 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                      Tiket Pengambilan Resmi Pre-Order
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      {storeProfile.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        order.paymentStatus === 'lunas'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {order.paymentStatus === 'lunas' ? 'LUNAS' : 'BAYAR SAAT AMBIL (COD)'}
                    </span>
                  </div>
                </div>

                {/* Big Booking Code & Visual QR/Barcode */}
                <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[11px] text-stone-400 font-medium">
                    KODE BOOKING PENGAMBILAN
                  </span>

                  {/* Big Code with Copy Button */}
                  <div className="flex items-center gap-2">
                    <span
                      id="pickup-booking-code"
                      className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-amber-400 selection:bg-amber-400 selection:text-black"
                    >
                      #{order.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                      title="Salin Kode Booking"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Authentic Scannable QR Code & Barcode Pattern */}
                  <div className="bg-white p-3 rounded-xl shadow-md border border-stone-300 flex flex-col items-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code Order #${order.id}`}
                        className={`${isEnlarged ? 'w-48 h-48' : 'w-36 h-36'} object-contain rounded-lg`}
                      />
                    ) : (
                      <div
                        className={`${
                          isEnlarged ? 'w-48 h-48' : 'w-36 h-36'
                        } flex items-center justify-center bg-stone-100 rounded-lg text-xs text-stone-500 font-mono`}
                      >
                        Memuat QR...
                      </div>
                    )}

                    {/* Barcode Lines Below */}
                    <div className="flex items-center gap-0.5 mt-2 h-5 text-stone-800">
                      {[4, 2, 6, 2, 8, 3, 5, 2, 7, 3, 2, 6, 4, 3, 8, 2, 4, 6, 3, 2, 7, 3].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${h * 2.5}px` }}
                            className={`w-0.5 sm:w-1 ${idx % 2 === 0 ? 'bg-stone-900' : 'bg-stone-700'}`}
                          />
                        )
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-stone-500 font-bold tracking-widest mt-1">
                      SCAN VERIFIKASI PENGAMBILAN
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400">
                    Tunjukkan barcode/QR ini ke kasir atau koki dapur saat mengambil makanan
                  </p>
                </div>

                {/* Customer Identity & Pick-up Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <div className="space-y-1">
                    <span className="text-stone-400 text-[11px] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nama Pemesan:</span>
                    </span>
                    <p className="text-white font-bold text-sm">{order.customerName}</p>
                    <p className="text-stone-400 text-[11px]">{order.customerPhone}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Jadwal Pengambilan:</span>
                    </span>
                    <p className="text-white font-bold text-sm">{formatDateIndo(order.poDate)}</p>
                    <p className="text-amber-300 font-medium text-[11px]">{order.poSlot}</p>
                  </div>
                </div>

                {/* SERAH TERIMA CHECKLIST (What kitchen staff must hand over) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Daftar Hidangan Serah Terima ({totalPorsi} Porsi):</span>
                    </span>
                    <span className="text-stone-400 text-[11px]">Cek porsi sebelum serah</span>
                  </div>

                  <div className="divide-y divide-stone-800 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-bold text-white text-xs sm:text-sm block">
                              {item.menuItem.name}
                            </span>
                            {item.selectedCustomizations.length > 0 && (
                              <p className="text-[11px] text-stone-400">
                                {item.selectedCustomizations.map((c) => c.selectedLabel).join(', ')}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-amber-300 italic mt-0.5">
                                Catatan: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="font-mono font-bold text-stone-400 text-xs shrink-0">
                          {formatRupiah(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Location Address */}
                <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800/80 text-xs flex items-start gap-2.5 text-stone-400">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-300 block">Titik Ambil Dapur:</span>
                    <span>{storeProfile.address}</span>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Link to Kitchen */}
              <div className="flex gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Pesan ke Dapur Penjual</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: RINCIAN NOTA LENGKAP & RATING */}
          {activeTab === 'full_receipt' && (
            <div className="space-y-5">
              {/* Stepper Dots */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500">Status Pesanan:</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {statusInfo.description}
                </p>

                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[
                    { step: 1, label: 'Masuk' },
                    { step: 2, label: 'Kunci Slot' },
                    { step: 3, label: 'Dimasak' },
                    { step: 4, label: 'Siap' },
                  ].map((s) => {
                    const isActive = statusInfo.stepIndex >= s.step;
                    return (
                      <div key={s.step} className="space-y-1 text-center">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isActive ? 'bg-amber-700' : 'bg-stone-200'
                          }`}
                        />
                        <span className="text-[10px] text-stone-500 font-medium">
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1.5">
                <div className="font-bold text-stone-900">Data Pemesan:</div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Nama:</span>
                  <span className="font-bold text-stone-800">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Nomor WhatsApp:</span>
                  <span className="font-bold text-stone-800">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode:</span>
                  <span className="font-bold text-stone-800">
                    {order.orderType === 'pickup'
                      ? order.pickupLocationType === 'titik_kumpul_affiliate'
                        ? `Titik Kumpul PIC (${order.affiliateCode || 'Affiliate'})`
                        : 'Ambil di Dapur Utama'
                      : 'Diantar (Delivery)'}
                  </span>
                </div>
                {order.affiliatePickupLocation && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Lokasi Ambil PIC:</span>
                    <span className="font-bold text-stone-800 text-right">{order.affiliatePickupLocation}</span>
                  </div>
                )}
                {order.affiliateName && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">PIC Koordinator:</span>
                    <span className="font-bold text-amber-900 text-right">{order.affiliateName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                  <span className="text-stone-500">Reward Stempel:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                    +{totalPorsi} Stempel (1 per Porsi)
                  </span>
                </div>
                {order.deliveryAddress && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Alamat Kirim:</span>
                    <span className="font-bold text-stone-800 text-right">{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Ordered Items Breakdown */}
              <div className="space-y-2">
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                  Rincian Item Hidangan:
                </h3>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-3 text-xs flex justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900">
                          {item.menuItem.name} <span className="text-stone-400">x{item.quantity}</span>
                        </span>
                        {item.selectedCustomizations.length > 0 && (
                          <p className="text-[11px] text-stone-500">
                            {item.selectedCustomizations.map((c) => c.selectedLabel).join(', ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-amber-800 italic">
                            Catatan: {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-extrabold text-stone-900 shrink-0">
                        {formatRupiah(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating & Review Section for Completed Orders */}
              {order.orderStatus === 'selesai' ? (
                <div
                  id="order-rating-section"
                  className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-amber-50/90 via-orange-50/70 to-amber-100/50 border-2 border-amber-300 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm font-serif">
                          Nilai & Review Hidangan PO
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          Bagikan kepuasan rasa & porsi kepada koki dan pelanggan lain
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {uniqueMenuItems.map((menuItem) => {
                      const existingReview = order.reviews?.[menuItem.id];
                      const draft = draftRatings[menuItem.id] || {
                        rating: 5,
                        hoverRating: 0,
                        comment: '',
                      };
                      const currentActiveRating = draft.hoverRating || draft.rating;
                      const isSubmitting = submittingItemId === menuItem.id;

                      const ratingLabels: Record<number, string> = {
                        1: 'Kurang Puas',
                        2: 'Cukup',
                        3: 'Lumayan',
                        4: 'Enak & Mantap',
                        5: 'Sangat Lezat!',
                      };

                      if (existingReview) {
                        return (
                          <div
                            key={menuItem.id}
                            className="p-3 bg-white/90 rounded-xl border border-amber-200 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-stone-800">
                                {menuItem.name}
                              </span>
                              <div className="flex items-center gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= existingReview.rating
                                        ? 'fill-amber-400 text-amber-500'
                                        : 'text-stone-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {existingReview.comment && (
                              <p className="text-xs text-stone-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                "{existingReview.comment}"
                              </p>
                            )}
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ulasan Anda Telah Tersimpan
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={menuItem.id}
                          className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={menuItem.image}
                              alt={menuItem.name}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-stone-900 text-xs block truncate">
                                {menuItem.name}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                Beri ulasan rasa & porsi:
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 bg-stone-50 p-2 rounded-xl border border-stone-200/80">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleSetRating(menuItem.id, star)}
                                    onMouseEnter={() => handleHoverRating(menuItem.id, star)}
                                    onMouseLeave={() => handleHoverRating(menuItem.id, 0)}
                                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                                  >
                                    <Star
                                      className={`w-5 h-5 ${
                                        star <= currentActiveRating
                                          ? 'fill-amber-400 text-amber-500'
                                          : 'text-stone-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                                {ratingLabels[currentActiveRating] || 'Pilih Bintang'}
                              </span>
                            </div>

                            <input
                              type="text"
                              placeholder="Tulis ulasan rasa/kemasan (opsional)..."
                              value={draft.comment}
                              onChange={(e) => handleCommentChange(menuItem.id, e.target.value)}
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSendRating(menuItem.id, draft.rating, draft.comment)}
                            disabled={isSubmitting}
                            className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                            <span>
                              {isSubmitting ? 'Menyimpan...' : `Kirim Penilaian (${draft.rating} Bintang)`}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center gap-2.5 text-stone-500">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Penilaian bintang & ulasan rasa menu dapat diberikan setelah status pesanan{' '}
                    <strong className="text-stone-700">Selesai</strong>.
                  </span>
                </div>
              )}

              {/* Total & Payment Summary */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ongkos Kirim</span>
                  <span>{order.deliveryFee === 0 ? 'GRATIS' : formatRupiah(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Kupon</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-2 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-stone-900">Total Akhir:</span>
                  <span className="font-black text-amber-900 text-base font-serif">
                    {formatRupiah(order.total)}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 pt-1 flex justify-between">
                  <span>Metode Bayar:</span>
                  <span className="font-bold uppercase text-stone-700">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Teks Tersalin!' : 'Salin Teks Struk'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-3.5 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShoppingBag,
  CreditCard,
  QrCode,
  CheckCircle2,
  Copy,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Truck,
  Store,
  Sparkles,
  AlertCircle,
  Check,
  Heart,
} from 'lucide-react';
import { CartItem, Order, OrderType, PaymentMethod, POBatchSchedule, StoreProfile } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  storeProfile: StoreProfile;
  hasPremiumBox?: boolean;
  onOrderCreated: (order: Order) => void;
  onTrackOrder: (orderId: string, phone: string) => void;
}

type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 'confirmed';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  storeProfile,
  hasPremiumBox = false,
  onOrderCreated,
  onTrackOrder,
}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Step 1: Customer Information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Step 2: Delivery Info
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [pickupLocation, setPickupLocation] = useState(
    'Studio Dapur Mooi Bites • Jl. Darmo Permai Timur No. 18, Dukuh Pakis, Surabaya',
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Step 3: Preorder Date & Time
  const [selectedDate, setSelectedDate] = useState('2025-04-21');
  const [selectedSlot, setSelectedSlot] = useState('12:00 – 15:00');

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [paymentStatus, setPaymentStatus] = useState<
    'waiting' | 'confirmed' | 'failed' | 'expired'
  >('waiting');
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // Completed Order State for Confirmation View
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const timeSlots = [
    '09:00 – 12:00',
    '12:00 – 15:00',
    '15:00 – 18:00',
    '18:00 – 21:00',
  ];

  const availableDates = [
    { date: '2025-04-21', label: '21 April 2025 (Batch #12)' },
    { date: '2025-04-24', label: '24 April 2025 (Batch #13)' },
    { date: '2025-04-27', label: '27 April 2025 (Batch #14)' },
  ];

  const PREMIUM_BOX_PRICE = 8000;
  const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const boxTotal = hasPremiumBox ? PREMIUM_BOX_PRICE : 0;
  const subtotal = itemsSubtotal + boxTotal;
  const deliveryFee = orderType === 'delivery' ? 15000 : 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setPaymentStatus('waiting');
      setCreatedOrder(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleCreateOrder = (autoConfirm = false) => {
    // Generate order number like #MB-1024
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `#MB-${randomDigits}`;

    const newOrder: Order = {
      id: orderNumber,
      createdAt: new Date().toISOString(),
      customerName: customerName || 'Pelanggan Mooi Bites',
      customerPhone: customerPhone || '085748829148',
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      deliveryNotes: orderType === 'delivery' ? deliveryNotes : `Ambil di: ${pickupLocation}`,
      poDate: selectedDate,
      poSlot: selectedSlot,
      items: cartItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: autoConfirm ? 'lunas' : 'menunggu_pembayaran',
      orderStatus: autoConfirm ? 'diproses_dapur' : 'menunggu_konfirmasi',
      adminNotes: hasPremiumBox ? 'Pakai Kotak Eksklusif Mooi Bites + Pita Satin' : undefined,
    };

    setCreatedOrder(newOrder);
    onOrderCreated(newOrder);
    if (autoConfirm) {
      setPaymentStatus('confirmed');
    }
    setCurrentStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#633F35]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF9F2] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border-2 border-[#E7D5C4] shadow-2xl flex flex-col relative text-[#633F35]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-[#E7D5C4] flex items-center justify-between bg-[#F3E9DD]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5A4D]">
              {currentStep === 'confirmed' ? 'Order Selesai' : `Langkah ${currentStep} dari 5`}
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#633F35]">
              {currentStep === 1 && 'Customer Information'}
              {currentStep === 2 && 'Delivery & Pickup Method'}
              {currentStep === 3 && 'Select Preorder Date & Time'}
              {currentStep === 4 && 'Order Summary'}
              {currentStep === 5 && 'Payment'}
              {currentStep === 'confirmed' && 'Konfirmasi Pesanan'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] flex items-center justify-center hover:bg-[#E7D5C4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        {currentStep !== 'confirmed' && (
          <div className="px-6 py-2.5 bg-[#FFF9F2] border-b border-[#E7D5C4] flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s
                      ? 'bg-[#633F35] text-[#FFF9F2]'
                      : currentStep > s
                      ? 'bg-[#8A5A4D] text-[#FFF9F2]'
                      : 'bg-[#E7D5C4] text-[#8A5A4D]'
                  }`}
                >
                  {s}
                </div>
                <span className="hidden sm:inline text-[11px] font-semibold text-[#8A5A4D]">
                  {s === 1 && 'Info'}
                  {s === 2 && 'Pengiriman'}
                  {s === 3 && 'Jadwal'}
                  {s === 4 && 'Ringkasan'}
                  {s === 5 && 'Bayar'}
                </span>
                {s < 5 && <div className="hidden sm:block w-4 h-0.5 bg-[#E7D5C4] mx-1"></div>}
              </div>
            ))}
          </div>
        )}

        {/* Body content based on step */}
        <div className="p-5 sm:p-7 space-y-6 flex-1">
          {/* STEP 1: Customer Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1.5">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A5A4D]" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Clarissa Amanda"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E7D5C4] bg-[#F3E9DD]/50 text-sm font-medium text-[#633F35] focus:outline-hidden focus:border-[#633F35] focus:bg-[#FFF9F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1.5">
                  WhatsApp Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A5A4D]" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E7D5C4] bg-[#F3E9DD]/50 text-sm font-medium text-[#633F35] focus:outline-hidden focus:border-[#633F35] focus:bg-[#FFF9F2]"
                  />
                </div>
                <p className="text-[11px] text-[#8A5A4D] mt-1">
                  Nomor ini akan digunakan untuk konfirmasi status baking dan penjemputan/pengiriman.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1.5">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A5A4D]" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Contoh: clarissa@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E7D5C4] bg-[#F3E9DD]/50 text-sm font-medium text-[#633F35] focus:outline-hidden focus:border-[#633F35] focus:bg-[#FFF9F2]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Info */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-2">
                  Metode Pengambilan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      orderType === 'pickup'
                        ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35] shadow-sm'
                        : 'bg-[#F3E9DD]/60 hover:bg-[#F3E9DD] border-[#E7D5C4] text-[#633F35]'
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span className="font-bold text-sm">Pickup</span>
                    <span className="text-[10px] opacity-80 text-center">
                      Ambil di outlet kami
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      orderType === 'delivery'
                        ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35] shadow-sm'
                        : 'bg-[#F3E9DD]/60 hover:bg-[#F3E9DD] border-[#E7D5C4] text-[#633F35]'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-bold text-sm">Delivery</span>
                    <span className="text-[10px] opacity-80 text-center">
                      Antar ke alamatmu
                    </span>
                  </button>
                </div>
              </div>

              {orderType === 'pickup' ? (
                <div className="bg-[#F3E9DD] p-4 rounded-2xl border border-[#E7D5C4] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#633F35]">
                    <Store className="w-4 h-4 text-[#8A5A4D]" />
                    <span>Lokasi Pickup:</span>
                  </div>
                  <p className="text-xs text-[#633F35]/90 font-medium">
                    {pickupLocation}
                  </p>
                  <p className="text-[11px] text-[#8A5A4D]">
                    Pickup dibuka sesuai slot jam yang kamu pilih. Gratis biaya pengiriman.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1.5">
                      Alamat Lengkap Pengiriman <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota Surabaya / Sekitarnya, Kode Pos..."
                      className="w-full p-3.5 rounded-2xl border border-[#E7D5C4] bg-[#F3E9DD]/50 text-xs font-medium text-[#633F35] focus:outline-hidden focus:border-[#633F35] focus:bg-[#FFF9F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1.5">
                      Catatan Patokan untuk Kurir (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Contoh: Pagar hitam depan musholla / titip di resepsionis..."
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E7D5C4] bg-[#F3E9DD]/50 text-xs font-medium text-[#633F35] focus:outline-hidden focus:border-[#633F35] focus:bg-[#FFF9F2]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preorder Date & Time */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-2">
                  Production Date
                </label>
                <div className="space-y-2">
                  {availableDates.map((d) => (
                    <div
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        selectedDate === d.date
                          ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35]'
                          : 'bg-[#F3E9DD]/60 hover:bg-[#F3E9DD] border-[#E7D5C4] text-[#633F35]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4" />
                        <span className="font-display font-bold text-sm">{d.label}</span>
                      </div>
                      {selectedDate === d.date && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-2">
                  Pickup / Delivery Time Slots
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3.5 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-display font-bold text-sm transition-all ${
                          isSelected
                            ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35] shadow-sm'
                            : 'bg-[#F3E9DD]/60 hover:bg-[#F3E9DD] border-[#E7D5C4] text-[#633F35]'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#8A5A4D] mt-2 text-center">
                  Slot yang dipilih disorot dengan warna chocolate brown (#633F35).
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Order Summary */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-[#F3E9DD] rounded-2xl p-4 border border-[#E7D5C4] space-y-3">
                <div className="flex justify-between items-center text-xs text-[#8A5A4D] font-bold uppercase border-b border-[#E7D5C4] pb-2">
                  <span>Item Dipesan</span>
                  <span>Subtotal</span>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-[#633F35]">{item.menuItem.name}</span>
                        <span className="text-[#8A5A4D] ml-1.5">x{item.quantity}</span>
                        {item.selectedCustomizations.length > 0 && (
                          <p className="text-[10px] text-[#8A5A4D]">
                            {item.selectedCustomizations.map((c) => c.selectedLabel).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-[#633F35]">{formatRupiah(item.totalPrice)}</span>
                    </div>
                  ))}

                  {hasPremiumBox && (
                    <div className="flex justify-between items-start text-xs pt-1 border-t border-[#E7D5C4]/60">
                      <div>
                        <span className="font-bold text-[#633F35]">Premium Box Packaging + Pita</span>
                      </div>
                      <span className="font-bold text-[#633F35]">{formatRupiah(PREMIUM_BOX_PRICE)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E7D5C4] space-y-1.5 text-xs text-[#633F35]">
                  <div className="flex justify-between">
                    <span className="text-[#8A5A4D]">Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A5A4D]">Biaya Pengiriman ({orderType})</span>
                    <span>{deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-display font-black text-base text-[#633F35] pt-1">
                    <span>Total Pembayaran</span>
                    <span>{formatRupiah(total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Schedule Recap */}
              <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#E7D5C4] text-xs space-y-1.5 text-[#633F35]">
                <p>
                  <strong>Penerima:</strong> {customerName} ({customerPhone})
                </p>
                <p>
                  <strong>Metode:</strong> {orderType === 'pickup' ? 'Pickup Outlet' : 'Delivery ke Alamat'}
                </p>
                <p>
                  <strong>Jadwal PO:</strong> {selectedDate} • {selectedSlot}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Payment */}
          {currentStep === 5 && (
            <div className="space-y-5">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-2">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35]'
                        : 'bg-[#F3E9DD]/60 border-[#E7D5C4] text-[#633F35]'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-bold">QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bca')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'bca'
                        ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35]'
                        : 'bg-[#F3E9DD]/60 border-[#E7D5C4] text-[#633F35]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-bold">Transfer Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gopay')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'gopay'
                        ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35]'
                        : 'bg-[#F3E9DD]/60 border-[#E7D5C4] text-[#633F35]'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-bold">E-Wallet</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Details */}
              {paymentMethod === 'qris' && (
                <div className="bg-[#F3E9DD] rounded-2xl p-5 border border-[#E7D5C4] flex flex-col items-center text-center space-y-3">
                  <div className="bg-[#FFF9F2] p-3 rounded-2xl border border-[#E7D5C4] shadow-sm">
                    <img
                      src={storeProfile.qrisImageUrl || 'https://images.unsplash.com/photo-1595079672139-5470805056e7?w=400&auto=format&fit=crop&q=80'}
                      alt="QRIS Mooi Bites"
                      className="w-48 h-48 object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#633F35]">
                      Scan QRIS Semua Pembayaran
                    </h4>
                    <p className="text-xs text-[#8A5A4D]">
                      BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana
                    </p>
                  </div>
                  <div className="font-display font-black text-2xl text-[#633F35]">
                    {formatRupiah(total)}
                  </div>
                </div>
              )}

              {paymentMethod === 'bca' && (
                <div className="space-y-2.5">
                  {storeProfile.bankAccounts.map((acc) => (
                    <div
                      key={acc.bank}
                      className="bg-[#F3E9DD] rounded-2xl p-4 border border-[#E7D5C4] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs uppercase bg-[#FFF9F2] px-2 py-0.5 rounded-md border border-[#E7D5C4]">
                          {acc.bank}
                        </span>
                        <div className="font-display font-bold text-base text-[#633F35] mt-1">
                          {acc.accountNumber}
                        </div>
                        <span className="text-xs text-[#8A5A4D]">a.n {acc.accountName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(acc.accountNumber, acc.bank)}
                        className="p-2 rounded-xl bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] hover:bg-[#E7D5C4] transition-colors"
                      >
                        {copiedBank === acc.bank ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {paymentMethod === 'gopay' && (
                <div className="bg-[#F3E9DD] rounded-2xl p-4 border border-[#E7D5C4] space-y-2 text-xs">
                  <h4 className="font-bold text-[#633F35]">Instruksi E-Wallet</h4>
                  <p className="text-[#8A5A4D]">
                    Transfer saldo via GoPay / ShopeePay / OVO ke nomor admin:{' '}
                    <strong className="text-[#633F35]">0857 4882 9148</strong> (a.n Mooi Bites Cookie).
                  </p>
                </div>
              )}

              {/* Payment Status Indicator */}
              <div className="bg-[#FFF9F2] rounded-2xl p-4 border border-[#E7D5C4] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5A4D] block">
                  Status Pembayaran:
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-800">
                    Waiting for payment
                  </span>
                </div>
                <p className="text-[11px] text-[#8A5A4D]">
                  Setelah transfer, klik tombol &quot;Konfirmasi Sudah Bayar&quot; di bawah untuk menyelesaikan pesanan.
                </p>
              </div>
            </div>
          )}

          {/* STEP CONFIRMED: Order Confirmation */}
          {currentStep === 'confirmed' && createdOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <Heart className="w-8 h-8 fill-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-black text-3xl sm:text-4xl text-[#633F35]">
                  Order Confirmed ♡
                </h3>
                <p className="text-base text-[#8A5A4D] font-medium">
                  Thank you for your order!
                </p>
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#F3E9DD] border border-[#E7D5C4] font-display font-black text-lg text-[#633F35]">
                  Order ID: {createdOrder.id}
                </div>
              </div>

              {/* Order Specs Recap */}
              <div className="bg-[#F3E9DD] rounded-2xl p-5 border border-[#E7D5C4] text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-[#E7D5C4] pb-2">
                  <span className="text-[#8A5A4D]">Preorder Date:</span>
                  <span className="font-bold text-[#633F35]">{createdOrder.poDate}</span>
                </div>
                <div className="flex justify-between border-b border-[#E7D5C4] pb-2">
                  <span className="text-[#8A5A4D]">Pickup / Delivery:</span>
                  <span className="font-bold text-[#633F35] uppercase">{createdOrder.orderType}</span>
                </div>
                <div className="flex justify-between border-b border-[#E7D5C4] pb-2">
                  <span className="text-[#8A5A4D]">Time Slot:</span>
                  <span className="font-bold text-[#633F35]">{createdOrder.poSlot}</span>
                </div>
                <div className="flex justify-between border-b border-[#E7D5C4] pb-2">
                  <span className="text-[#8A5A4D]">Payment Status:</span>
                  <span className="font-bold text-emerald-700">Payment Confirmed ✓</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-[#633F35]">Total:</span>
                  <span className="font-display font-black text-base text-[#633F35]">
                    {formatRupiah(createdOrder.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTrackOrder(createdOrder.id, createdOrder.customerPhone);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#633F35] hover:bg-[#4E3129] text-[#FFF9F2] font-bold text-sm shadow-md"
                >
                  Track My Order
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F3E9DD] hover:bg-[#E7D5C4] text-[#633F35] font-bold text-sm border border-[#E7D5C4]"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Buttons (Steps 1 to 5) */}
        {currentStep !== 'confirmed' && (
          <div className="p-4 sm:p-6 bg-[#F3E9DD] border-t-2 border-[#E7D5C4] flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => (s - 1) as CheckoutStep)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] font-bold text-xs hover:bg-[#E7D5C4] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !customerName.trim()) {
                    alert('Mohon isi nama lengkap Anda.');
                    return;
                  }
                  if (currentStep === 1 && !customerPhone.trim()) {
                    alert('Mohon isi nomor WhatsApp Anda.');
                    return;
                  }
                  if (currentStep === 2 && orderType === 'delivery' && !deliveryAddress.trim()) {
                    alert('Mohon lengkapi alamat pengiriman.');
                    return;
                  }
                  setCurrentStep((s) => (s + 1) as CheckoutStep);
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#633F35] hover:bg-[#4E3129] text-[#FFF9F2] font-bold text-sm shadow-md shadow-[#633F35]/20 active:scale-95 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={() => handleCreateOrder(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Konfirmasi Pembayaran →</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

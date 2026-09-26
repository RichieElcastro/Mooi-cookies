import React, { useState } from 'react';
import {
  User,
  ChefHat,
  Phone,
  Mail,
  ReceiptText,
  MapPin,
  Clock,
  LogOut,
  ArrowRightLeft,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Gift,
  Award,
  Check,
  Tag,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  RotateCcw,
  ShoppingBag,
  Users,
  Flame,
  ScanLine,
  SlidersHorizontal,
  Calendar,
  Eye,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { AuthUser, Order, StoreProfile, VoucherReward, UserRole } from '../types';
import { formatRupiah, getWhatsAppLink } from '../utils/formatters';

interface HomeProfileSectionProps {
  currentUser: AuthUser | null;
  storeProfile: StoreProfile;
  orders: Order[];
  myOrderIds: string[];
  vouchers: VoucherReward[];
  onClaimVoucher: () => void;
  onOpenRedeemModal: (voucher: VoucherReward) => void;
  bonusStamps: number;
  onAddBonusStamp: (amount?: number) => void;
  onResetBonusStamps: () => void;
  onOpenAuth: (role?: UserRole) => void;
  onLogout: () => void;
  onSwitchToKitchen: () => void;
  onSwitchKitchenTab?: (tab: 'rekap' | 'orders' | 'menu' | 'dates') => void;
  onOpenQRScanner?: () => void;
  onSwitchToAffiliate?: () => void;
  onGoToOrders: () => void;
  onGoToCatalog: () => void;
  totalMenuItemsCount?: number;
  totalAffiliateCount?: number;
}

export const HomeProfileSection: React.FC<HomeProfileSectionProps> = ({
  currentUser,
  storeProfile,
  orders,
  myOrderIds,
  vouchers,
  onClaimVoucher,
  onOpenRedeemModal,
  bonusStamps,
  onAddBonusStamp,
  onResetBonusStamps,
  onOpenAuth,
  onLogout,
  onSwitchToKitchen,
  onSwitchKitchenTab,
  onOpenQRScanner,
  onSwitchToAffiliate,
  onGoToOrders,
  onGoToCatalog,
  totalMenuItemsCount = 8,
  totalAffiliateCount = 3,
}) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);

  const isKitchen = currentUser?.role === 'dapur' || currentUser?.role === 'admin';

  // =========================================================================
  // RENDER DEDICATED ADMIN KITCHEN PROFILE & OPERATIONS HUB
  // =========================================================================
  if (isKitchen) {
    const activeKitchenOrders = orders.filter(
      (o) => o.orderStatus !== 'selesai' && o.orderStatus !== 'dibatalkan'
    );
    const readyOrders = orders.filter((o) => o.orderStatus === 'siap');
    const completedOrders = orders.filter((o) => o.orderStatus === 'selesai');
    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'dibatalkan')
      .reduce((sum, o) => sum + o.total, 0);

    return (
      <div id="section-admin-dapur" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 1. Admin Identity Card */}
        <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-7 border border-stone-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-600/20 shrink-0">
                <ChefHat className="w-8 h-8 text-amber-100" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white font-serif">
                    {currentUser?.name || 'Head Chef & Admin Dapur'}
                  </h2>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase tracking-wider shadow-2xs">
                    Admin Pengelola Pesanan
                  </span>
                </div>

                <div className="text-xs text-stone-300 mt-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Akses Penuh: Manajemen Pesanan Customer, Kuota PO, & Rekap Oven</span>
                  </div>
                  {currentUser?.email && (
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{currentUser.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                id="kitchen-profile-switch-account-btn"
                onClick={() => onOpenAuth()}
                className="px-3 py-2 rounded-xl border border-stone-700 hover:border-stone-600 text-stone-200 bg-stone-800 hover:bg-stone-750 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Ganti ke Akun Pelanggan atau PIC Affiliate"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Ganti Akun</span>
              </button>
              <button
                type="button"
                id="kitchen-profile-logout-btn"
                onClick={onLogout}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Keluar dari Akun Dapur"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics of Kitchen & Store Management */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-stone-800">
            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('orders');
              }}
              className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/80 cursor-pointer hover:bg-stone-800 transition-colors"
            >
              <span className="text-[10px] sm:text-[11px] text-stone-400 block font-medium">Antrean Aktif:</span>
              <span className="text-base sm:text-xl font-black text-amber-400 font-serif">
                {activeKitchenOrders.length} Pesanan
              </span>
            </div>

            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('orders');
              }}
              className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/80 cursor-pointer hover:bg-stone-800 transition-colors"
            >
              <span className="text-[10px] sm:text-[11px] text-stone-400 block font-medium">Siap Diambil:</span>
              <span className="text-base sm:text-xl font-black text-emerald-400 font-serif">
                {readyOrders.length} Pesanan
              </span>
            </div>

            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('orders');
              }}
              className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/80 cursor-pointer hover:bg-stone-800 transition-colors"
            >
              <span className="text-[10px] sm:text-[11px] text-stone-400 block font-medium">Pesanan Selesai:</span>
              <span className="text-base sm:text-xl font-black text-stone-200 font-serif">
                {completedOrders.length} Pesanan
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/80">
              <span className="text-[10px] sm:text-[11px] text-stone-400 block font-medium">Total Omzet PO:</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 font-serif truncate block pt-1">
                {formatRupiah(totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Admin Operation Actions Hub */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base sm:text-lg font-serif">
                Pusat Kontrol Pengelolaan Dapur & Pesanan
              </h3>
              <p className="text-xs text-stone-500">
                Pilih menu tindakan di bawah untuk mengelola alur operasional pre-order
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Action 1: Antrean Pesanan Customer */}
            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('orders');
              }}
              className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/60 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                    Kelola Antrean Pesanan
                  </h4>
                  {activeKitchenOrders.length > 0 && (
                    <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {activeKitchenOrders.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Update status pesanan customer, cetak resi, konfirmasi pembayaran, dan kirim notifikasi WhatsApp.
                </p>
              </div>
            </div>

            {/* Action 2: Rekap Oven & Checklist Produksi */}
            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('rekap');
              }}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                  Rekap Oven & Checklist Produksi
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Rekap total loyang dan kebutuhan bahan per stasiun pemanggangan untuk hari H pengambilan.
                </p>
              </div>
            </div>

            {/* Action 3: Scan QR Tiket Resi */}
            <div
              onClick={() => onOpenQRScanner?.()}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <ScanLine className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                  Pemindai QR Tiket Pengambilan
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Buka kamera untuk memindai kode QR resi customer saat serah terima pesanan di dapur.
                </p>
              </div>
            </div>

            {/* Action 4: Kelola Menu & Kuota Harian */}
            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('menu');
              }}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                    Menu & Kuota Slot Harian
                  </h4>
                  <span className="text-[11px] font-bold text-stone-500">
                    {totalMenuItemsCount} Menu
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Tambah varian baru, ubah harga, foto hidangan, dan batasi kuota porsi harian.
                </p>
              </div>
            </div>

            {/* Action 5: Tanggal Batch PO */}
            <div
              onClick={() => {
                onSwitchToKitchen();
                onSwitchKitchenTab?.('dates');
              }}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                  Jadwal Tanggal & Cutoff PO
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Buka/tutup tanggal PO, atur batas jam pemesanan (cutoff H-1), dan kelola catatan batch.
                </p>
              </div>
            </div>

            {/* Action 6: Manajemen PIC Affiliate */}
            {onSwitchToAffiliate && (
              <div
                onClick={onSwitchToAffiliate}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-emerald-900 transition-colors">
                      Titik Kumpul PIC & Komisi
                    </h4>
                    <span className="text-[11px] font-bold text-stone-500">
                      {totalAffiliateCount} PIC
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Manajemen koordinator titik kumpul (kampus/kantor), hitung komisi 5%, dan aktivasi akun.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Pratinjau Toko Pelanggan Link */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-900 via-stone-900 to-stone-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Pratinjau Tampilan Toko Pelanggan</h3>
              <p className="text-xs text-stone-300">
                Lihat katalog dessert sebagaimana yang disaksikan oleh pembeli di perangkat mereka.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="kitchen-preview-catalog-btn"
            onClick={onGoToCatalog}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Buka Pratinjau Toko</span>
          </button>
        </div>

        {/* 4. Kitchen Operational Details */}
        <div className="bg-stone-50/80 rounded-3xl p-5 border border-stone-200/80 text-xs text-stone-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Alamat Dapur Utama (Pusat Produksi):</span>
          </div>
          <p className="text-stone-600 pl-6">{storeProfile.address}</p>
          <div className="flex items-center gap-2 font-bold text-stone-800 pt-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Jadwal Operasional Baking & Pengambilan:</span>
          </div>
          <p className="text-stone-600 pl-6">{storeProfile.operationalHours}</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER CUSTOMER (PELANGGAN) PROFILE & LOYALTY STAMPS SECTION
  // =========================================================================
  const myOrders = orders.filter((o) => myOrderIds.includes(o.id));
  const activeOrders = myOrders.filter(
    (o) => o.orderStatus !== 'selesai' && o.orderStatus !== 'dibatalkan'
  );
  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);

  // Calculate stamps earned from products/portions purchased (NOT transactions)
  const validOrders = myOrders.filter((o) => o.orderStatus !== 'dibatalkan');

  const orderPortionsDetails = validOrders.map((order) => {
    const portionsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      orderId: order.id,
      date: order.createdAt,
      poDate: order.poDate,
      portionsCount,
      items: order.items,
      affiliateCode: order.affiliateCode,
      affiliatePickupLocation: order.affiliatePickupLocation,
    };
  });

  const totalPortionsFromOrders = orderPortionsDetails.reduce(
    (sum, item) => sum + item.portionsCount,
    0
  );

  const totalEarnedStamps = totalPortionsFromOrders + (bonusStamps || 0);
  const usedStamps = vouchers.length * 10;
  const availableStamps = Math.max(0, totalEarnedStamps - usedStamps);

  // Stamps for the current 10-slot card display
  const stampsOnCard = Math.min(10, availableStamps);
  const canClaimVoucher = availableStamps >= 10;
  const neededStamps = Math.max(0, 10 - availableStamps);

  const activeVouchers = vouchers.filter((v) => !v.isUsed);
  const usedVouchers = vouchers.filter((v) => v.isUsed);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedVoucherCode(code);
    setTimeout(() => setCopiedVoucherCode(null), 2500);
  };

  return (
    <div id="section-saya" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Customer Profile Identity Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-800 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md shadow-amber-900/10 shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : <User className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 font-serif">
                  {currentUser?.name || 'Pelanggan Tamu'}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  Member Loyalitas PO
                </span>
              </div>

              <div className="text-xs text-stone-500 mt-1 space-y-0.5">
                {currentUser?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                {currentUser?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{currentUser.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              id="profile-switch-account-btn"
              onClick={() => onOpenAuth()}
              className="px-3 py-2 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50 hover:bg-stone-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Ganti Akun</span>
            </button>
            <button
              type="button"
              id="profile-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-100">
          <div
            onClick={onGoToOrders}
            className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80 cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <span className="text-[11px] text-stone-500 block">Pesanan Aktif:</span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-900 font-serif">
              {activeOrders.length} Pesanan
            </span>
          </div>

          <div
            onClick={onGoToOrders}
            className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 cursor-pointer hover:bg-stone-100/70 transition-colors"
          >
            <span className="text-[11px] text-stone-500 block">Total Porsi Dipesan:</span>
            <span className="text-lg sm:text-xl font-extrabold text-stone-800 font-serif">
              {totalPortionsFromOrders} Porsi
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-500 block">Total Transaksi PO:</span>
            <span className="text-sm sm:text-base font-extrabold text-stone-800 font-serif truncate block">
              {formatRupiah(totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. LOYALTY STAMP CARD SECTION (10 STEMPEL = 1 MENU GRATIS) */}
      <div
        id="loyalty-stamp-card-section"
        className="bg-linear-to-br from-amber-50 via-orange-50/50 to-stone-50 rounded-3xl p-5 sm:p-7 border-2 border-amber-200/90 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold tracking-wide uppercase">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Kartu Stempel Dapur</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 font-serif mt-1">
              Kumpulkan 10 Stempel = 1 Menu Gratis
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Setiap <strong>1 porsi produk</strong> yang dibeli bernilai <strong>1 stempel</strong> (berdasarkan jumlah produk yang dipesan, bukan jumlah transaksi).
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-white/80 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl border sm:border-0 border-amber-200/60">
            <div className="text-[11px] text-stone-500 font-medium">Stempel Tersedia</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 font-serif">
              {availableStamps} <span className="text-xs font-sans text-stone-500">/ 10 Stempel</span>
            </div>
          </div>
        </div>

        {/* The 10-Stamp Visual Grid */}
        <div className="mt-5">
          <div className="grid grid-cols-5 gap-2 sm:gap-3.5">
            {Array.from({ length: 10 }).map((_, idx) => {
              const slotNum = idx + 1;
              const isStamped = slotNum <= stampsOnCard;
              const isGrandReward = slotNum === 10;

              return (
                <div
                  key={slotNum}
                  className={`relative rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center transition-all ${
                    isStamped
                      ? 'bg-amber-800 text-white shadow-xs scale-102 border border-amber-900'
                      : isGrandReward
                      ? 'bg-amber-100/70 border-2 border-dashed border-amber-400 text-amber-800'
                      : 'bg-white border-2 border-dashed border-stone-200 text-stone-400'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1">
                    {isStamped ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-200" />
                    ) : isGrandReward ? (
                      <Gift className="w-4 h-4 text-amber-700 animate-bounce" />
                    ) : (
                      <span className="text-xs font-bold">{slotNum}</span>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-center leading-tight truncate w-full">
                    {isGrandReward ? 'Menu Gratis' : `Porsi #${slotNum}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim Reward Button */}
        <div className="mt-5 pt-4 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 text-center sm:text-left">
            {canClaimVoucher ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                Selamat! Anda memiliki cukup stempel untuk ditukarkan sekarang.
              </span>
            ) : (
              <span>
                Kurang <strong>{neededStamps} porsi lagi</strong> untuk klaim 1 Menu Gratis pilihan Anda.
              </span>
            )}
          </div>

          <button
            type="button"
            id="claim-loyalty-voucher-btn"
            onClick={onClaimVoucher}
            disabled={!canClaimVoucher}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              canClaimVoucher
                ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-amber-800/20 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Tukarkan 10 Stempel = Voucher Menu</span>
          </button>
        </div>

        {/* Collapsible Portion Breakdown */}
        <div className="mt-4 pt-3 border-t border-amber-200/50">
          <button
            type="button"
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-amber-900 hover:text-amber-950 cursor-pointer"
          >
            <span>Rincian Perhitungan Stempel ({totalPortionsFromOrders} Porsi dari {validOrders.length} Pesanan)</span>
            {isBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isBreakdownOpen && (
            <div className="mt-3 space-y-2 text-xs text-stone-600 animate-fadeIn">
              <div className="bg-white/90 rounded-xl p-3 border border-amber-200/70 space-y-2">
                <div className="font-semibold text-stone-800 pb-1 border-b border-stone-100 flex items-center justify-between">
                  <span>Daftar Pesanan & Jumlah Porsi Produk:</span>
                  <span className="text-[11px] text-amber-800 font-bold">1 Porsi = 1 Stempel</span>
                </div>
                {orderPortionsDetails.length === 0 ? (
                  <p className="text-stone-400 italic">Belum ada pesanan aktif. Mulai pre-order untuk mengumpulkan stempel!</p>
                ) : (
                  orderPortionsDetails.map((det) => (
                    <div key={det.orderId} className="flex items-center justify-between text-[11px] py-1 border-b border-stone-50 last:border-0">
                      <div>
                        <span className="font-mono font-bold text-stone-900">{det.orderId}</span>
                        <span className="text-stone-400 ml-1.5">(Batch {det.poDate})</span>
                      </div>
                      <div className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">
                        +{det.portionsCount} Stempel ({det.portionsCount} Porsi)
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Simulation Controls */}
              <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-stone-500">Uji Coba Demo:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAddBonusStamp(1)}
                    className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+1 Stempel Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddBonusStamp(5)}
                    className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+5 Stempel Demo</span>
                  </button>
                  {bonusStamps > 0 && (
                    <button
                      type="button"
                      onClick={onResetBonusStamps}
                      className="px-2 py-1 rounded-lg text-stone-500 hover:text-stone-800 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. VOUCHER SAYA (VOUCHERS EARNED FROM 10 STAMPS) */}
      <div id="customer-vouchers-section" className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base font-serif">Voucher Menu Gratis Saya</h3>
              <p className="text-xs text-stone-500">Gunakan voucher saat checkout atau pilih menu langsung</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
            {activeVouchers.length} Siap Pakai
          </span>
        </div>

        {vouchers.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-stone-200 rounded-2xl space-y-2">
            <Gift className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-700">Belum Ada Voucher Reward</p>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
              Kumpulkan 10 stempel dari pesanan Anda untuk menukarkan voucher 1 menu gratis apa saja di katalog!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeVouchers.map((v) => (
              <div
                key={v.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs sm:text-sm text-stone-900">{v.title}</span>
                    <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{v.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded-md border border-amber-300 text-amber-900">
                      {v.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(v.code)}
                      className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedVoucherCode === v.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVoucherCode === v.code ? 'Tersalin' : 'Salin Kode'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id={`redeem-voucher-btn-${v.id}`}
                  onClick={() => onOpenRedeemModal(v)}
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs shadow-xs transition-all shrink-0 cursor-pointer text-center"
                >
                  Pilih Menu Gratis Sekarang
                </button>
              </div>
            ))}

            {usedVouchers.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-400 block pb-1.5">Voucher Telah Digunakan:</span>
                <div className="space-y-1.5">
                  {usedVouchers.map((uv) => (
                    <div
                      key={uv.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-400 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="line-through font-mono font-medium">{uv.code}</span>
                        <span className="ml-2 text-[11px]">
                          {uv.freeMenuItemName ? `(Klaim: ${uv.freeMenuItemName})` : '(Telah Terpakai)'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">Terpakai</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Affiliate / PIC Drop Point Banner */}
      <div className="bg-linear-to-r from-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base font-serif">Punya Komunitas atau Kantor?</h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                Komisi 5%
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Jadilah koordinator titik kumpul di kantor, kampus, atau komplek Anda. Teman Anda tetap menikmati <strong>100% stempel loyalitas</strong> dan bebas ongkir!
            </p>
          </div>
        </div>
        {onSwitchToAffiliate && (
          <button
            type="button"
            id="profile-goto-affiliate-portal-btn"
            onClick={onSwitchToAffiliate}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Portal PIC & Komisi</span>
          </button>
        )}
      </div>

      {/* 5. Navigation & Help Links */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">
          Layanan & Bantuan Pelanggan
        </h3>

        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={onGoToOrders}
            className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center justify-between transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <ReceiptText className="w-4 h-4 text-amber-700" />
              <span className="font-semibold">Cek Status & Resi Pesanan Saya</span>
            </div>
            <span className="text-stone-400">→</span>
          </button>

          <button
            type="button"
            onClick={onGoToCatalog}
            className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center justify-between transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="font-semibold">Pilih Menu Pre-Order Lainnya</span>
            </div>
            <span className="text-stone-400">→</span>
          </button>

          <a
            href={getWhatsAppLink(
              storeProfile.whatsapp,
              `Halo ${storeProfile.name}, saya ${currentUser?.name || 'pelanggan'}, ingin bertanya mengenai pre-order batch dan stempel loyalitas.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 flex items-center justify-between transition-colors cursor-pointer text-left font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>Hubungi WhatsApp Bakery ({storeProfile.whatsapp})</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </a>
        </div>
      </div>

      {/* 6. Store Information */}
      <div className="bg-stone-50/80 rounded-3xl p-5 border border-stone-200/80 text-xs text-stone-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-stone-800">
          <MapPin className="w-4 h-4 text-amber-700" />
          <span>Lokasi Dapur & Pengambilan Pesanan:</span>
        </div>
        <p className="text-stone-600 pl-6">{storeProfile.address}</p>
        <div className="flex items-center gap-2 font-bold text-stone-800 pt-2">
          <Clock className="w-4 h-4 text-amber-700" />
          <span>Jam Buka & Pengambilan Fresh Batch:</span>
        </div>
        <p className="text-stone-600 pl-6">{storeProfile.operationalHours}</p>
      </div>
    </div>
  );
};

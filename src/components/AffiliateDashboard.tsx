import React, { useState, useMemo } from 'react';
import {
  Users,
  MapPin,
  Share2,
  Copy,
  CheckCircle2,
  DollarSign,
  Package,
  Calendar,
  Phone,
  MessageCircle,
  Plus,
  Clock,
  Info,
  Search,
  Check,
  AlertCircle,
  ArrowLeft,
  Store,
  Sparkles,
  Award,
  FileSpreadsheet,
  ScanLine,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { AffiliatePIC, AuthUser, Order, POBatchSchedule, StoreProfile } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface AffiliateDashboardProps {
  affiliatePICs: AffiliatePIC[];
  onUpdatePICs: (pics: AffiliatePIC[]) => void;
  orders: Order[];
  batchSchedules: POBatchSchedule[];
  currentUser: AuthUser | null;
  onBackToCatalog: () => void;
  onShowToast: (msg: string) => void;
  storeProfile: StoreProfile;
  onOpenQRScanner?: () => void;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({
  affiliatePICs,
  onUpdatePICs,
  orders,
  batchSchedules,
  currentUser,
  onBackToCatalog,
  onShowToast,
  storeProfile,
  onOpenQRScanner,
}) => {
  // Determine initial selected PIC code (from currentUser if affiliate, or first available)
  const [selectedPicCode, setSelectedPicCode] = useState<string>(() => {
    if (currentUser?.affiliateCode) {
      const match = affiliatePICs.find(
        (p) => p.code.toLowerCase() === currentUser.affiliateCode?.toLowerCase()
      );
      if (match) return match.code;
    }
    return affiliatePICs[0]?.code || 'KAMPUS-UNESA';
  });

  const [selectedBatchDate, setSelectedBatchDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab navigation: 'orders' (batch operation & manifest) vs 'manage_affiliates' (admin management)
  const [activeTab, setActiveTab] = useState<'orders' | 'manage_affiliates'>('orders');

  // Admin filter state for affiliate list
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all');

  // New PIC form state (for admin creation)
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState<number>(5);
  const [newBankAccount, setNewBankAccount] = useState('');
  const [formError, setFormError] = useState('');

  // Modal success state when a new affiliate is created
  const [createdPICSuccess, setCreatedPICSuccess] = useState<AffiliatePIC | null>(null);

  // Active PIC details
  const activePIC = useMemo(() => {
    return (
      affiliatePICs.find((p) => p.code.toUpperCase() === selectedPicCode.toUpperCase()) ||
      affiliatePICs[0]
    );
  }, [affiliatePICs, selectedPicCode]);

  // Orders linked to active PIC
  const picOrders = useMemo(() => {
    if (!activePIC) return [];
    return orders.filter(
      (o) =>
        o.affiliateCode?.toUpperCase() === activePIC.code.toUpperCase() &&
        o.orderStatus !== 'dibatalkan'
    );
  }, [orders, activePIC]);

  // Filtered orders for table/manifest
  const filteredOrders = useMemo(() => {
    return picOrders.filter((order) => {
      // Date filter
      if (selectedBatchDate !== 'all' && order.poDate !== selectedBatchDate) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = order.customerName.toLowerCase().includes(q);
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesPhone = order.customerPhone.toLowerCase().includes(q);
        return matchesName || matchesId || matchesPhone;
      }
      return true;
    });
  }, [picOrders, selectedBatchDate, statusFilter, searchQuery]);

  // Aggregates
  const totalPortions = useMemo(() => {
    return picOrders.reduce((sum, order) => {
      return sum + order.items.reduce((iSum, it) => iSum + it.quantity, 0);
    }, 0);
  }, [picOrders]);

  const totalRevenue = useMemo(() => {
    return picOrders.reduce((sum, o) => sum + o.subtotal, 0);
  }, [picOrders]);

  const totalCommission = useMemo(() => {
    return picOrders.reduce((sum, o) => {
      if (o.affiliateCommission !== undefined) return sum + o.affiliateCommission;
      // Fallback calculation using PIC's rate
      const rate = activePIC?.commissionRatePercent || 5;
      return sum + Math.round(o.subtotal * (rate / 100));
    }, 0);
  }, [picOrders, activePIC]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    onShowToast(`Berhasil disalin: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // WhatsApp Broadcast Helper
  const handleShareWhatsApp = () => {
    if (!activePIC) return;
    const batchList = batchSchedules
      .filter((s) => s.isActive)
      .map((s) => `• ${formatDateIndo(s.date)} (${s.label || 'Batch PO'})`)
      .join('\n');

    const msg = `📢 *PRE-ORDER DESSERT ARTISAN BARENGAN DI ${activePIC.pickupLocationName.toUpperCase()}!* 🍪✨\n\n` +
      `Halo teman-teman! Sekarang kita bisa pesan aneka *Basque Cheesecake lumer & Gourmet Cookies* dari *${storeProfile.name}* dengan *BEBAS ONGKIR* karena diambil bareng di titik kumpul kita!\n\n` +
      `📍 *Titik Pengambilan:* ${activePIC.pickupLocationName}\n` +
      `🏠 *Alamat:* ${activePIC.pickupAddress}\n` +
      `👤 *PIC Koordinator:* ${activePIC.name} (${activePIC.phone})\n\n` +
      `📅 *Jadwal Batch PO Terbuka:*\n${batchList}\n\n` +
      `🎁 *KEUNTUNGAN KELUARGA & KOMUNITAS:*\n` +
      `✅ Ongkir Rp 0 (Pesanan diantar satu armada ke titik kumpul)\n` +
      `✅ *Tetap Dapat 1 Stempel per Porsi*: Kumpulkan 10 stempel untuk 1 Menu Gratis!\n` +
      `✅ Jaminan Fresh Baked di hari pengiriman\n\n` +
      `🛒 *Cara Pesan:*\n` +
      `1. Buka katalog pemesanan: ${window.location.origin}\n` +
      `2. Pilih menu favoritmu & klik Checkout\n` +
      `3. Pilih *Ambil di Titik Kumpul PIC* dan pilih kode *${activePIC.code}*\n` +
      `4. Pesananmu akan otomatis digabungkan di batch pengambilan kita!\n\n` +
      `Yuk amankan slot PO sebelum kuota oven dapur penuh! 🧁`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Claim commission via WhatsApp to Kitchen
  const handleClaimCommissionWA = () => {
    if (!activePIC) return;
    const msg = `Halo Tim Dapur ${storeProfile.name},\n\n` +
      `Saya *${activePIC.name}*, PIC Pengumpul Titik Kumpul *${activePIC.pickupLocationName}* (Kode: ${activePIC.code}).\n\n` +
      `Berikut rekap pesanan batch PO yang telah terkumpul melalui titik kumpul kami:\n` +
      `• Total Pesanan Valid: ${picOrders.length} Pesanan\n` +
      `• Total Porsi Dessert: ${totalPortions} Porsi\n` +
      `• Total Nilai PO: ${formatRupiah(totalRevenue)}\n` +
      `• *Total Komisi PIC (5%): ${formatRupiah(totalCommission)}*\n\n` +
      `Mohon verifikasi untuk pencairan komisi ke rekening saya:\n` +
      `💳 *${activePIC.bankAccount}*\n\n` +
      `Terima kasih atas kerja samanya! Salam manis dari tim titik kumpul.`;

    const targetWA = storeProfile.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${targetWA}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Copy batch pickup manifest to clipboard
  const handleCopyManifest = () => {
    if (filteredOrders.length === 0) {
      onShowToast('Tidak ada pesanan pada filter ini untuk dibuat manifest.');
      return;
    }

    const batchTitle = selectedBatchDate === 'all' ? 'Semua Batch' : formatDateIndo(selectedBatchDate);
    const lines = filteredOrders.map((o, idx) => {
      const itemsStr = o.items.map((it) => `${it.quantity}x ${it.menuItem.name}`).join(', ');
      const statusBadge = o.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM LUNAS';
      return `${idx + 1}. [${o.id}] ${o.customerName} (${o.customerPhone}) - [${statusBadge}]\n   Menu: ${itemsStr}\n   Total: ${formatRupiah(o.total)}`;
    });

    const manifestText = `📋 *MANIFEST CHECKLIST PENGAMBILAN PO BATCH*\n` +
      `📍 Titik Kumpul: ${activePIC?.pickupLocationName}\n` +
      `📅 Jadwal: ${batchTitle}\n` +
      `👤 PIC Koordinator: ${activePIC?.name} (${activePIC?.phone})\n` +
      `📦 Total: ${filteredOrders.length} Pesanan (${filteredOrders.reduce((sum, o) => sum + o.items.reduce((i, it) => i + it.quantity, 0), 0)} Porsi)\n\n` +
      `----------------------------------------\n` +
      lines.join('\n\n') +
      `\n----------------------------------------\n` +
      `Mohon pelanggan menunjukkan nama & No. PO saat pengambilan.`;

    navigator.clipboard?.writeText(manifestText);
    onShowToast('📋 Lembar manifest berhasil disalin ke clipboard!');
  };

  // Admin filtered PICs
  const filteredPICsForAdmin = useMemo(() => {
    return affiliatePICs.filter((pic) => {
      const curStatus = pic.status || 'active';
      if (adminStatusFilter !== 'all' && curStatus !== adminStatusFilter) {
        return false;
      }
      if (adminSearchQuery.trim()) {
        const q = adminSearchQuery.toLowerCase();
        const matchName = pic.name.toLowerCase().includes(q);
        const matchCode = pic.code.toLowerCase().includes(q);
        const matchPhone = pic.phone.toLowerCase().includes(q);
        const matchLoc = pic.pickupLocationName.toLowerCase().includes(q);
        const matchEmail = (pic.email || '').toLowerCase().includes(q);
        return matchName || matchCode || matchPhone || matchLoc || matchEmail;
      }
      return true;
    });
  }, [affiliatePICs, adminStatusFilter, adminSearchQuery]);

  // Handle update status (active / suspended / inactive) by admin
  const handleUpdateStatus = (picId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
    const target = affiliatePICs.find((p) => p.id === picId);
    if (!target) return;

    const updated = affiliatePICs.map((pic) => {
      if (pic.id === picId) {
        return {
          ...pic,
          status: newStatus,
          isActive: newStatus === 'active',
        };
      }
      return pic;
    });

    onUpdatePICs(updated);
    const statusLabels: Record<string, string> = {
      active: 'Aktif',
      suspended: 'Ditangguhkan (Suspend)',
      inactive: 'Nonaktif',
    };
    onShowToast(`Status akun PIC "${target.name}" (${target.code}) diubah menjadi: ${statusLabels[newStatus]}.`);
  };

  // Handle register new PIC by Admin with auto-generated code and temp password
  const handleRegisterPIC = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim()) {
      setFormError('Nama lengkap PIC Koordinator wajib diisi.');
      return;
    }
    if (!newPhone.trim() || newPhone.replace(/\D/g, '').length < 9) {
      setFormError('Nomor WhatsApp aktif wajib diisi (minimal 9 digit).');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@') || !newEmail.includes('.')) {
      setFormError('Email PIC wajib diisi dengan format yang benar.');
      return;
    }
    if (!newLocationName.trim()) {
      setFormError('Nama Titik Kumpul / Lokasi Pengambilan wajib diisi.');
      return;
    }
    if (!newAddress.trim()) {
      setFormError('Alamat lengkap lokasi pengambilan wajib diisi.');
      return;
    }
    const commissionVal = Number(newCommissionRate);
    if (isNaN(commissionVal) || commissionVal < 1 || commissionVal > 50) {
      setFormError('Persentase komisi harus berupa angka antara 1% sampai 50%.');
      return;
    }

    // Auto-generate Unique Affiliate Code: AFF_${CLEAN_NAME_PREFIX}${RANDOM_4_DIGIT}
    const cleanPrefix = newName
      .trim()
      .split(' ')[0]
      .replace(/[^A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, 4) || 'MITRA';

    let generatedCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      attempts++;
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const candidate = `AFF_${cleanPrefix}${randNum}`;
      if (!affiliatePICs.some((p) => p.code.toUpperCase() === candidate)) {
        generatedCode = candidate;
        isUnique = true;
      }
    }
    if (!generatedCode) {
      generatedCode = `AFF_${Date.now().toString().slice(-6)}`;
    }

    // Auto-generate Secure Temporary Password: AFF#${4_DIGITS}${2_LETTERS}
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randLetters =
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)];
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedTempPassword = `AFF#${randDigits}${randLetters}`;

    const newPIC: AffiliatePIC = {
      id: `pic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: generatedCode,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      status: 'active',
      pickupLocationName: newLocationName.trim(),
      pickupAddress: newAddress.trim(),
      pickupNotes: newNotes.trim() || undefined,
      commissionRatePercent: commissionVal,
      bankAccount: newBankAccount.trim() || 'Akan dilengkapi PIC',
      isActive: true,
      tempPassword: generatedTempPassword,
      mustChangePassword: true,
      registeredAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin Crumb & Cream',
    };

    const updated = [newPIC, ...affiliatePICs];
    onUpdatePICs(updated);
    setSelectedPicCode(generatedCode);
    setIsRegisterModalOpen(false);
    setCreatedPICSuccess(newPIC);

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewLocationName('');
    setNewAddress('');
    setNewNotes('');
    setNewBankAccount('');
    setNewCommissionRate(5);

    onShowToast(`🎉 Akun Affiliate baru "${newPIC.name}" (${newPIC.code}) berhasil didaftarkan!`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-stone-200 sticky top-14 sm:top-16 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="back-to-catalog-btn"
              onClick={onBackToCatalog}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Katalog</span>
            </button>
            <div className="h-5 w-[1px] bg-stone-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-stone-900 font-serif">
                  Portal PIC Affiliate & Titik Kumpul
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300 uppercase">
                  Hub Pengumpul PO
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Kelola pesanan batch kolektif, pantau komisi 5%, dan koordinasi pengambilan per lokasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQRScanner && (
              <button
                type="button"
                id="affiliate-scan-qr-btn"
                onClick={onOpenQRScanner}
                className="px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Buka kamera untuk scan QR tiket resi pengambilan pesanan di titik kumpul ini"
              >
                <ScanLine className="w-3.5 h-3.5 text-stone-950" />
                <span>Scan QR Ambil</span>
              </button>
            )}
            <button
              type="button"
              id="open-register-pic-btn"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1.5 sm:py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Akun Affiliate Baru</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs between Orders Operation & Admin PIC Management */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 flex-wrap">
          <button
            type="button"
            id="tab-orders-manifest"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Operasional & Manifest Batch</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-amber-900/60 text-amber-100' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {picOrders.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-manage-affiliates"
            onClick={() => setActiveTab('manage_affiliates')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'manage_affiliates'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kelola Mitra Affiliate & PIC (Admin)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'manage_affiliates'
                  ? 'bg-amber-900/60 text-amber-100'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {affiliatePICs.length} Mitra
            </span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
        {/* Banner Penegasan Stempel Pelanggan */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-xs text-emerald-950 flex-1 leading-relaxed">
            <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5 mb-1">
              <span>Jaminan Benefit Pelanggan Tetap Berlaku Penuh</span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                100% Hak Stempel
              </span>
            </h3>
            <p>
              Setiap pesanan yang masuk melalui kode atau titik kumpul PIC <strong>tetap dihitung otomatis sebagai 1 stempel per porsi</strong> bagi pelanggan pembeli (10 Stempel = 1 Menu Gratis Pilihan). Komisi 5% PIC diberikan langsung oleh Dapur sebagai apresiasi pengumpulan pesanan tanpa mengurangi manfaat loyalitas pembeli sedikitpun.
            </p>
          </div>
        </div>

        {/* PIC Profile Selector & Identity Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Pilih Titik Kumpul Aktif
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {affiliatePICs.map((pic) => {
                  const isSelected = pic.code === activePIC?.code;
                  return (
                    <button
                      key={pic.id}
                      type="button"
                      onClick={() => setSelectedPicCode(pic.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{pic.code}</span>
                      <span className="text-[10px] font-normal opacity-85">({pic.name.split(' ')[0]})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Share to WA */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="share-wa-broadcast-btn"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Bagikan teks ajakan PO ke WhatsApp grup"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bagikan ke WhatsApp Grup</span>
              </button>
            </div>
          </div>

          {activePIC && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Info PIC & Kode */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">
                    Profil PIC Koordinator
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                    Komisi 5%
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">{activePIC.name}</h3>
                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{activePIC.phone}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-500">Kode Referral / PO:</span>
                    <span className="font-mono font-black text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                      {activePIC.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(activePIC.code, 'code')}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'code' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'code' ? 'Tersalin' : 'Salin Kode'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `${window.location.origin}/?pic=${activePIC.code}`,
                          'link'
                        )
                      }
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'link' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'link' ? 'Tersalin' : 'Salin Link PO'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Titik Kumpul & Lokasi Pengambilan */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Lokasi Titik Pengambilan (Drop Point)</span>
                </div>
                <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
                  {activePIC.pickupLocationName}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {activePIC.pickupAddress}
                </p>
                {activePIC.pickupNotes && (
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-normal">
                    <strong>Catatan:</strong> {activePIC.pickupNotes}
                  </div>
                )}
              </div>

              {/* Box 3: Rekening Pencairan Komisi */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Rekening Transfer Komisi</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 font-mono text-xs text-stone-800 font-bold">
                    {activePIC.bankAccount}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                    Dapur mentransfer komisi setelah batch PO ditutup dan pesanan selesai diserahkan.
                  </p>
                </div>

                <button
                  type="button"
                  id="claim-commission-wa-btn"
                  onClick={handleClaimCommissionWA}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Klaim Pencairan ke Dapur</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metrik Performa & Finansial PIC */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Komisi Terkumpul */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Total Komisi PIC</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-serif">
              {formatRupiah(totalCommission)}
            </div>
            <p className="text-[10px] text-stone-400">5% dari pesanan valid</p>
          </div>

          {/* Card 2: Total Porsi Terkumpul */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Porsi PO Terkumpul</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 font-serif">
              {totalPortions} <span className="text-xs font-sans font-bold text-stone-500">Porsi</span>
            </div>
            <p className="text-[10px] text-stone-400">= {totalPortions} Stempel pelanggan</p>
          </div>

          {/* Card 3: Total Pesanan */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Total Pesanan PO</span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
              {picOrders.length} <span className="text-xs font-sans font-bold text-stone-500">Pesanan</span>
            </div>
            <p className="text-[10px] text-stone-400">Siap diambil di titik kumpul</p>
          </div>

          {/* Card 4: Total Omset PO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Total Nilai PO</span>
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
              {formatRupiah(totalRevenue)}
            </div>
            <p className="text-[10px] text-stone-400">Subtotal transaksi batch</p>
          </div>
        </div>

        {/* Section Manifest Pengambilan Batch PO */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-serif flex items-center gap-2">
                <span>Manifest Pengambilan Pesanan PO</span>
                <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {filteredOrders.length} Pesanan
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Daftar pelanggan yang mengambil pesanan di {activePIC?.pickupLocationName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="copy-manifest-btn"
                onClick={handleCopyManifest}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Salin checklist pengambilan untuk dicetak atau di-share"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Salin Lembar Checklist</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Batch Date filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 block">Filter Jadwal Batch:</label>
              <select
                value={selectedBatchDate}
                onChange={(e) => setSelectedBatchDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              >
                <option value="all">Semua Jadwal Batch</option>
                {batchSchedules.map((schedule) => (
                  <option key={schedule.date} value={schedule.date}>
                    {formatDateIndo(schedule.date)} {schedule.label ? `(${schedule.label})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 block">Status Dapur:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              >
                <option value="all">Semua Status Dapur</option>
                <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                <option value="dikonfirmasi">Dikonfirmasi</option>
                <option value="diproses_dapur">Diproses Dapur</option>
                <option value="siap">Siap Diambil</option>
                <option value="selesai">Selesai / Sudah Diambil</option>
              </select>
            </div>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 block">Cari Pemesan:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nama, No. PO, atau No. HP..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-800/30"
                />
              </div>
            </div>
          </div>

          {/* Orders Table / Cards */}
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 space-y-2">
              <Package className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500 font-bold">
                Belum ada pesanan PO yang terdaftar untuk filter ini.
              </p>
              <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                Bagikan kode <strong>{activePIC?.code}</strong> ke teman, grup kampus, atau tetangga agar pesanan mereka masuk ke titik kumpul Anda!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
              {filteredOrders.map((order) => {
                const orderPortions = order.items.reduce((s, it) => s + it.quantity, 0);
                const commissionVal =
                  order.affiliateCommission ??
                  Math.round(order.subtotal * ((activePIC?.commissionRatePercent || 5) / 100));

                const cleanPhone = order.customerPhone.replace(/\D/g, '');
                const waChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Halo Kak ${order.customerName}, saya ${activePIC?.name} (PIC Titik Kumpul ${activePIC?.pickupLocationName}). Pesanan PO ${order.id} untuk batch ${formatDateIndo(order.poDate)} (${order.poSlot}) sedang dikoordinasikan ya!`
                )}`;

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {order.id}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {order.customerName}
                        </h4>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            order.paymentStatus === 'lunas'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {order.paymentStatus === 'lunas' ? 'Lunas' : 'Menunggu Bayar'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          {order.orderStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="text-xs text-stone-600">
                        <span className="font-semibold text-stone-900">{orderPortions} Porsi:</span>{' '}
                        {order.items.map((it) => `${it.quantity}x ${it.menuItem.name}`).join(', ')}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>Batch: {formatDateIndo(order.poDate)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{order.poSlot}</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          Komisi: +{formatRupiah(commissionVal)}
                        </span>
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <div className="text-right mr-1">
                        <div className="text-xs font-black text-stone-900 font-serif">
                          {formatRupiah(order.total)}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          +{orderPortions} Stempel Pembeli
                        </div>
                      </div>

                      <a
                        href={waChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Chat WhatsApp Pemesan"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat WA</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Admin PIC & Affiliate Management View */}
    {activeTab === 'manage_affiliates' && (
      <div className="space-y-6">
        {/* Banner Admin Overview */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                Fitur Admin
              </span>
              <h2 className="text-base sm:text-lg font-black font-serif">
                Manajemen Mitra Affiliate & Koordinator PIC
              </h2>
            </div>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Daftarkan akun koordinator baru dengan kode unik & password sementara otomatis, kelola status keaktifan (aktif, suspend, nonaktif), dan pantau performa komisi titik kumpul.
            </p>
          </div>

          <button
            type="button"
            id="admin-create-pic-btn"
            onClick={() => {
              setFormError('');
              setIsRegisterModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Buat Akun Affiliate Baru</span>
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Total Mitra
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
              {affiliatePICs.length}
            </div>
            <span className="text-[10px] text-stone-500 font-medium">Koordinator terdaftar</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mitra Aktif
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 font-serif">
              {affiliatePICs.filter((p) => (p.status === 'active' || p.status === undefined) && p.isActive !== false).length}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Dapat menerima PO</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Ditangguhkan (Suspend)
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-800 font-serif">
              {affiliatePICs.filter((p) => p.status === 'suspended').length}
            </div>
            <span className="text-[10px] text-amber-600 font-medium">Sementara ditutup</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Nonaktif
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-800 font-serif">
              {affiliatePICs.filter((p) => p.status === 'inactive' || p.isActive === false).length}
            </div>
            <span className="text-[10px] text-rose-600 font-medium">Kode ditolak checkout</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="admin-search-affiliate-input"
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              placeholder="Cari nama koordinator, kode affiliate, WhatsApp, lokasi..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-800/30"
            />
            {adminSearchQuery && (
              <button
                type="button"
                onClick={() => setAdminSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              id="filter-all-btn"
              onClick={() => setAdminStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                adminStatusFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              Semua ({affiliatePICs.length})
            </button>
            <button
              type="button"
              id="filter-active-btn"
              onClick={() => setAdminStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                adminStatusFilter === 'active'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Aktif ({affiliatePICs.filter((p) => (p.status === 'active' || p.status === undefined) && p.isActive !== false).length})</span>
            </button>
            <button
              type="button"
              id="filter-suspended-btn"
              onClick={() => setAdminStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                adminStatusFilter === 'suspended'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Suspend ({affiliatePICs.filter((p) => p.status === 'suspended').length})</span>
            </button>
            <button
              type="button"
              id="filter-inactive-btn"
              onClick={() => setAdminStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                adminStatusFilter === 'inactive'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Nonaktif ({affiliatePICs.filter((p) => p.status === 'inactive' || p.isActive === false).length})</span>
            </button>
          </div>
        </div>

        {/* Affiliate Cards Grid */}
        {filteredPICsForAdmin.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-700">Tidak ada mitra affiliate yang sesuai kriteria</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Coba ganti filter status atau kata kunci pencarian, atau buat akun mitra baru dengan tombol di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPICsForAdmin.map((pic) => {
              const currentStatus = pic.status || 'active';
              const cardOrders = orders.filter(
                (o) => o.affiliateCode?.toUpperCase() === pic.code.toUpperCase() && o.orderStatus !== 'dibatalkan'
              );
              const cardSubtotal = cardOrders.reduce((sum, o) => sum + o.subtotal, 0);
              const cardCommission = Math.round(cardSubtotal * ((pic.commissionRatePercent || 5) / 100));

              const waCredentialMsg = encodeURIComponent(
                `Halo kak ${pic.name},\n\nBerikut rincian akun Koordinator PIC Titik Kumpul Anda di Crumb & Cream:\n\n` +
                  `📌 Lokasi: ${pic.pickupLocationName}\n` +
                  `🏷️ Kode Affiliate: ${pic.code}\n` +
                  `🔑 Password Sementara: ${pic.tempPassword || 'Sudah diatur permanen'}\n` +
                  `💰 Komisi: ${pic.commissionRatePercent || 5}%\n\n` +
                  (pic.mustChangePassword
                    ? `Silakan login di Portal Crumb & Cream. Anda akan langsung diminta mengatur password permanen baru saat login pertama.\n\nTerima kasih!`
                    : `Gunakan password permanen yang telah Anda atur sebelumnya.\n\nTerima kasih!`)
              );
              const waCredentialUrl = `https://wa.me/${pic.phone.replace(/\D/g, '')}?text=${waCredentialMsg}`;

              return (
                <div
                  key={pic.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Badges & Code */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        {currentStatus === 'active' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        )}
                        {currentStatus === 'suspended' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            <span>Ditangguhkan (Suspend)</span>
                          </span>
                        )}
                        {currentStatus === 'inactive' && (
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-black border border-stone-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                            <span>Nonaktif</span>
                          </span>
                        )}

                        {/* Commission Rate Badge */}
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-amber-700" />
                          <span>Komisi {pic.commissionRatePercent || 5}%</span>
                        </span>
                      </div>

                      {/* Unique Code Pill with Copy */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pic.code);
                          setCopiedField(`code-${pic.id}`);
                          onShowToast(`Kode affiliate "${pic.code}" disalin!`);
                          setTimeout(() => setCopiedField(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-mono text-xs font-black border border-stone-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Klik untuk salin kode affiliate"
                      >
                        <span>{pic.code}</span>
                        {copiedField === `code-${pic.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                        )}
                      </button>
                    </div>

                    {/* Coordinator Details */}
                    <div>
                      <h3 className="text-base font-black text-stone-900 font-serif">
                        {pic.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                        <a
                          href={`https://wa.me/${pic.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-700 flex items-center gap-1 transition-colors font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{pic.phone}</span>
                        </a>
                        {pic.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            <span>{pic.email}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-stone-900 block">
                            {pic.pickupLocationName}
                          </span>
                          <span className="text-[11px] text-stone-600 block leading-relaxed">
                            {pic.pickupAddress}
                          </span>
                          {pic.pickupNotes && (
                            <span className="text-[10px] text-stone-500 italic block mt-0.5">
                              Petunjuk: {pic.pickupNotes}
                            </span>
                          )}
                        </div>
                      </div>

                      {pic.bankAccount && (
                        <div className="pt-1.5 border-t border-stone-200 text-[11px] text-stone-600 flex items-center gap-1.5">
                          <span className="font-bold text-stone-700">Rekening Pencairan:</span>
                          <span>{pic.bankAccount}</span>
                        </div>
                      )}
                    </div>

                    {/* Security & Login Credentials Status */}
                    <div className="space-y-1.5">
                      {pic.mustChangePassword ? (
                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-amber-900 flex items-center gap-1.5 text-[11px]">
                              <Key className="w-3.5 h-3.5 text-amber-700" />
                              <span>Password Sementara (Wajib Ganti saat Login Pertama)</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[9px] font-black uppercase">
                              Belum Ganti
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-amber-200">
                            <div className="font-mono font-bold text-stone-800 text-xs tracking-wider">
                              {pic.tempPassword || '(Tidak tersedia)'}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (pic.tempPassword) {
                                    navigator.clipboard.writeText(pic.tempPassword);
                                    setCopiedField(`pass-${pic.id}`);
                                    onShowToast(`Password sementara ${pic.code} disalin!`);
                                    setTimeout(() => setCopiedField(null), 2000);
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {copiedField === `pass-${pic.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>Salin</span>
                              </button>

                              <a
                                href={waCredentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Kirim WA</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-emerald-900 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Password permanen telah dibuat oleh PIC</span>
                          </div>
                          {pic.lastLoginAt && (
                            <span className="text-[10px] text-stone-400">
                              Login: {formatDateIndo(pic.lastLoginAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order Performance Snapshot */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Pesanan Terkumpul</span>
                        <span className="font-extrabold text-stone-900">{cardOrders.length} Pesanan</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200">
                        <span className="text-[10px] text-amber-800 block">Total Komisi 5%</span>
                        <span className="font-extrabold text-amber-900 font-serif">
                          {formatRupiah(cardCommission)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Status Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPicCode(pic.code);
                        setActiveTab('orders');
                      }}
                      className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Buka Manifest Pesanan →</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Set Active */}
                      {currentStatus !== 'active' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(pic.id, 'active')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Aktifkan</span>
                        </button>
                      )}

                      {/* Set Suspend */}
                      {currentStatus !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(pic.id, 'suspended')}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          title="Tangguhkan sementara, kode tidak bisa dipakai checkout"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Suspend</span>
                        </button>
                      )}

                      {/* Set Inactive */}
                      {currentStatus !== 'inactive' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(pic.id, 'inactive')}
                          className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          title="Nonaktifkan akun sepenuhnya"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Nonaktifkan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}
    </div>

    {/* Modal Form: Buat Akun Affiliate Baru (Admin) */}
    {isRegisterModalOpen && (
      <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                Admin Panel
              </span>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h3 className="text-lg font-black text-stone-900 font-serif mt-1">
              Buat Akun Affiliate / PIC Baru
            </h3>
            <p className="text-xs text-stone-500">
              Daftarkan koordinator titik kumpul baru. Sistem akan otomatis men-generate Kode Affiliate Unik dan Password Sementara yang wajib diganti saat login pertama.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterPIC} className="space-y-3.5 text-xs">
            {/* Nama Koordinator */}
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Nama Lengkap Koordinator PIC *</label>
              <input
                type="text"
                id="admin-form-pic-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Siti Rahmawati / Budi Prasetyo"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
                required
              />
            </div>

            {/* Kontak: WhatsApp & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Nomor WhatsApp Aktif *</label>
                <input
                  type="tel"
                  id="admin-form-pic-phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Email Koordinator *</label>
                <input
                  type="email"
                  id="admin-form-pic-email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Contoh: siti.rahma@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
                  required
                />
              </div>
            </div>

            {/* Nama Titik Kumpul & Komisi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-700 block">Nama Titik Kumpul / Lokasi *</label>
                <input
                  type="text"
                  id="admin-form-pic-location"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Contoh: Titik Kumpul Kampus C UNAIR"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Komisi (%) *</label>
                <input
                  type="number"
                  id="admin-form-pic-commission"
                  min="1"
                  max="50"
                  step="0.5"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-bold"
                  required
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Alamat Lengkap Titik Pengambilan *</label>
              <textarea
                id="admin-form-pic-address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                rows={2}
                placeholder="Contoh: Jl. Mulyorejo, Gedung Perpustakaan Kampus C, Surabaya"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
                required
              />
            </div>

            {/* Petunjuk Pengambilan */}
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Petunjuk Pengambilan (Opsional)</label>
              <input
                type="text"
                id="admin-form-pic-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Contoh: Paket diambil di lobi utama jam 12:00 - 15:00 WIB"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
              />
            </div>

            {/* Rekening Bank */}
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Rekening Bank untuk Pencairan (Opsional)</label>
              <input
                type="text"
                id="admin-form-pic-bank"
                value={newBankAccount}
                onChange={(e) => setNewBankAccount(e.target.value)}
                placeholder="Contoh: BCA 829-192-3849 a.n Siti Rahmawati"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 font-medium"
              />
            </div>

            {/* Automatic Security Info */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1.5 leading-normal">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span>Otomatisasi Kredensial & Keamanan Akun:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-stone-700">
                <li>Sistem otomatis membuat <strong>Kode Affiliate Unik</strong> (contoh: <code>AFF_SITI3821</code>).</li>
                <li>Sistem otomatis membuat <strong>Password Sementara</strong> (contoh: <code>AFF#9284KP</code>).</li>
                <li>Status akun langsung <strong>Aktif</strong> dan ditandai <code>mustChangePassword = true</code>, sehingga saat koordinator login pertama kali, sistem akan mewajibkan pembuatan password baru yang aman.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="admin-submit-create-pic-btn"
                className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-black shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Buat Akun Affiliate</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal Success: Kredensial Baru Berhasil Dibuat */}
    {createdPICSuccess && (
      <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-emerald-300 space-y-4">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900 font-serif">
              Akun Affiliate Berhasil Dibuat!
            </h3>
            <p className="text-xs text-stone-500">
              Kredensial login berikut telah dibuat. Bagikan informasi ini kepada koordinator untuk login pertama kali.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Nama Koordinator</span>
              <span className="font-extrabold text-stone-900 text-sm">{createdPICSuccess.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Kode Affiliate</span>
                <span className="font-mono font-black text-amber-900 text-xs">{createdPICSuccess.code}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Password Sementara</span>
                <span className="font-mono font-black text-emerald-800 text-xs">{createdPICSuccess.tempPassword}</span>
              </div>
            </div>

            <div className="text-[11px] text-stone-600 space-y-1">
              <div>📍 <strong>Lokasi:</strong> {createdPICSuccess.pickupLocationName}</div>
              <div>📱 <strong>WhatsApp:</strong> {createdPICSuccess.phone}</div>
              <div>✉️ <strong>Email:</strong> {createdPICSuccess.email || '-'}</div>
              <div>💰 <strong>Komisi:</strong> {createdPICSuccess.commissionRatePercent}%</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
              🔒 <strong>Keamanan:</strong> Akun ini telah diset <em>wajib ganti password</em> saat login pertama kali.
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {/* Tombol Salin Kredensial */}
            <button
              type="button"
              id="copy-success-credentials-btn"
              onClick={() => {
                const credText =
                  `Akun Koordinator PIC Titik Kumpul Crumb & Cream:\n\n` +
                  `Nama: ${createdPICSuccess.name}\n` +
                  `Titik Kumpul: ${createdPICSuccess.pickupLocationName}\n` +
                  `Kode Affiliate: ${createdPICSuccess.code}\n` +
                  `Password Sementara: ${createdPICSuccess.tempPassword}\n` +
                  `Komisi: ${createdPICSuccess.commissionRatePercent}%\n\n` +
                  `Silakan login di web Crumb & Cream dan ganti password Anda saat pertama kali masuk.`;
                navigator.clipboard.writeText(credText);
                onShowToast('📋 Rincian kredensial akun berhasil disalin ke clipboard!');
              }}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Semua Rincian Kredensial</span>
            </button>

            {/* Tombol Kirim ke WhatsApp */}
            <a
              id="send-success-wa-btn"
              href={`https://wa.me/${createdPICSuccess.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Halo kak ${createdPICSuccess.name},\n\nAkun Koordinator PIC Titik Kumpul Anda di Crumb & Cream telah selesai didaftarkan!\n\n` +
                  `📍 Titik Kumpul: ${createdPICSuccess.pickupLocationName}\n` +
                  `🏷️ Kode Affiliate: ${createdPICSuccess.code}\n` +
                  `🔑 Password Sementara: ${createdPICSuccess.tempPassword}\n` +
                  `💰 Komisi: ${createdPICSuccess.commissionRatePercent}%\n\n` +
                  `Silakan login melalui menu Login Affiliate di website. Pada login pertama, Anda akan langsung diarahkan untuk membuat password baru milik Anda sendiri.\n\nTerima kasih!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kirim Kredensial via WhatsApp</span>
            </a>

            {/* Tombol Selesai */}
            <button
              type="button"
              id="close-success-credentials-modal-btn"
              onClick={() => {
                setCreatedPICSuccess(null);
                setActiveTab('manage_affiliates');
              }}
              className="w-full py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

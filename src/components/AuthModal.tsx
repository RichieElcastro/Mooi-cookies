import React, { useState } from 'react';
import {
  X,
  ChefHat,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Phone,
  KeyRound,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AffiliatePIC, AuthUser, UserRole } from '../types';
import { signInWithGoogleAuth } from '../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  initialRole?: UserRole;
  allowClose?: boolean;
  affiliatePICs?: AffiliatePIC[];
  onUpdateAffiliate?: (affiliate: AffiliatePIC) => void;
}

export const DEMO_USERS = {
  pelanggan1: {
    id: 'cust-maya-01',
    name: 'Bu Maya',
    phone: '0812-3456-7890',
    role: 'pelanggan' as UserRole,
    title: 'Pelanggan Setia PO Dessert',
  },
  pelanggan2: {
    id: 'cust-ahmad-02',
    name: 'Pak Ahmad',
    phone: '0857-1122-3344',
    role: 'pelanggan' as UserRole,
    title: 'Penikmat Cheesecake & Cookies',
  },
  dapurChef: {
    id: 'kitchen-chef-01',
    name: 'Pastry Chef Sarah',
    role: 'admin' as UserRole,
    email: 'admin@crumbandcream.com',
    title: 'Head Pastry Chef & Admin Dapur',
  },
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  initialRole = 'pelanggan',
  allowClose = true,
  affiliatePICs = [],
  onUpdateAffiliate,
}) => {
  // Normalize initialRole
  const mappedInitial = initialRole === 'dapur' ? 'admin' : initialRole;
  const [selectedRole, setSelectedRole] = useState<'pelanggan' | 'affiliate' | 'admin'>(mappedInitial);

  // Pelanggan Form State
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custError, setCustError] = useState<string>('');

  // Affiliate Form State
  const [affiliateIdentifier, setAffiliateIdentifier] = useState<string>('');
  const [affiliatePassword, setAffiliatePassword] = useState<string>('');
  const [affiliateError, setAffiliateError] = useState<string>('');
  
  // First-time password change requirement state
  const [pendingChangePasswordPIC, setPendingChangePasswordPIC] = useState<AffiliatePIC | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changePasswordError, setChangePasswordError] = useState<string>('');

  // Admin / Dapur Form State
  const [kitchenPin, setKitchenPin] = useState<string>('');
  const [kitchenError, setKitchenError] = useState<string>('');

  // Google sign in loading state
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Login as Pelanggan
  const handleCustomerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!custName.trim()) {
      setCustError('Silakan masukkan nama lengkap Anda');
      return;
    }
    if (!custPhone.trim() || custPhone.length < 9) {
      setCustError('Silakan masukkan nomor WhatsApp yang valid (min. 9 digit)');
      return;
    }

    setCustError('');
    const user: AuthUser = {
      id: `cust-${Date.now()}`,
      name: custName.trim(),
      phone: custPhone.trim(),
      role: 'pelanggan',
      title: 'Pelanggan PO',
      lastLoginAt: new Date().toISOString(),
    };
    onLogin(user);
    if (onClose) onClose();
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const user = await signInWithGoogleAuth();
      onLogin(user);
      if (onClose) onClose();
    } catch (err: any) {
      setCustError('Gagal masuk dengan Google: ' + (err.message || 'Coba lagi'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Quick Login
  const handleQuickLogin = (demoUser: AuthUser) => {
    onLogin({
      ...demoUser,
      lastLoginAt: new Date().toISOString(),
    });
    if (onClose) onClose();
  };

  // Handle Login as Affiliate / PIC
  const handleAffiliateLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAffiliateError('');

    const query = affiliateIdentifier.trim().toLowerCase();
    if (!query) {
      setAffiliateError('Silakan masukkan Kode Affiliate, No. WhatsApp, atau Email PIC.');
      return;
    }

    // Match affiliate in database
    const matched = affiliatePICs.find(
      (pic) =>
        pic.code.toLowerCase() === query ||
        pic.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '') ||
        (pic.email && pic.email.toLowerCase() === query)
    );

    if (!matched) {
      setAffiliateError('Akun Affiliate tidak ditemukan. Akun resmi hanya dapat dibuat oleh Admin.');
      return;
    }

    // Security Check: Status inactive or suspended
    if (matched.status === 'suspended' || matched.status === 'inactive') {
      setAffiliateError(
        `Akses Ditolak: Akun Affiliate "${matched.code}" sedang ${
          matched.status === 'suspended' ? 'DITANGGUHKAN (SUSPEND)' : 'NONAKTIF'
        }. Silakan hubungi Admin Dapur untuk aktivasi.`
      );
      return;
    }

    // Security Check: Password MUST NOT BE EMPTY
    const pwd = affiliatePassword.trim();
    if (!pwd) {
      setAffiliateError('Password akun Affiliate wajib diisi.');
      return;
    }

    // Strict Password Check: Must match this affiliate's own unique password (set by Admin)
    const expectedPassword = matched.tempPassword;
    if (!expectedPassword || pwd !== expectedPassword) {
      setAffiliateError(
        'Password salah. Masukkan password unik yang diberikan oleh Admin saat pembuatan akun.'
      );
      return;
    }

    // Check if mandatory first-time password change is required
    if (matched.mustChangePassword) {
      setPendingChangePasswordPIC(matched);
      return;
    }

    // Successful affiliate login
    const updatedPIC: AffiliatePIC = {
      ...matched,
      lastLoginAt: new Date().toISOString(),
    };
    if (onUpdateAffiliate) {
      onUpdateAffiliate(updatedPIC);
    }

    const affiliateUser: AuthUser = {
      id: matched.id,
      name: matched.name,
      role: 'affiliate',
      phone: matched.phone,
      email: matched.email,
      affiliateCode: matched.code,
      affiliateId: matched.id,
      status: matched.status,
      mustChangePassword: false,
      title: `Koordinator PIC ${matched.pickupLocationName}`,
      lastLoginAt: new Date().toISOString(),
    };

    onLogin(affiliateUser);
    if (onClose) onClose();
  };

  // Submit First-Time Password Change for Affiliate
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError('Password baru harus terdiri dari minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    if (!pendingChangePasswordPIC) return;

    // Update the affiliate record
    const updatedPIC: AffiliatePIC = {
      ...pendingChangePasswordPIC,
      tempPassword: newPassword,
      mustChangePassword: false,
      lastLoginAt: new Date().toISOString(),
    };

    if (onUpdateAffiliate) {
      onUpdateAffiliate(updatedPIC);
    }

    const affiliateUser: AuthUser = {
      id: updatedPIC.id,
      name: updatedPIC.name,
      role: 'affiliate',
      phone: updatedPIC.phone,
      email: updatedPIC.email,
      affiliateCode: updatedPIC.code,
      affiliateId: updatedPIC.id,
      status: updatedPIC.status,
      mustChangePassword: false,
      title: `Koordinator PIC ${updatedPIC.pickupLocationName}`,
      lastLoginAt: new Date().toISOString(),
    };

    setPendingChangePasswordPIC(null);
    onLogin(affiliateUser);
    if (onClose) onClose();
  };

  // Autofill Demo PIC credentials
  const handleSelectDemoPIC = (pic: AffiliatePIC) => {
    setAffiliateError('');
    setAffiliateIdentifier(pic.code);
    setAffiliatePassword(pic.tempPassword || '');
  };

  // Handle Login as Admin / Dapur
  const handleKitchenLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setKitchenError('');

    const pin = kitchenPin.trim();
    if (!pin) {
      setKitchenError('PIN Akses Admin Dapur wajib diisi. Silakan masukkan PIN resmi.');
      return;
    }

    // Only allow exact valid admin PIN
    const VALID_ADMIN_PIN = '1234';
    if (pin !== VALID_ADMIN_PIN) {
      setKitchenError('PIN Akses Admin salah. Masukkan PIN yang valid (Demo: 1234).');
      return;
    }

    const kitchenUser: AuthUser = {
      id: 'kitchen-staff-01',
      name: 'Pastry Chef Sarah',
      role: 'admin',
      email: 'admin@crumbandcream.com',
      title: 'Head Pastry Chef & Admin Dapur',
      lastLoginAt: new Date().toISOString(),
    };
    onLogin(kitchenUser);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        id="auth-login-modal"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
      >
        {/* Header with 3 Role Tabs */}
        <div className="p-5 sm:p-6 bg-linear-to-br from-stone-900 via-stone-800 to-amber-950 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black font-serif tracking-tight">
                  Pilih Akun Masuk
                </h2>
                <p className="text-xs text-stone-300">
                  Akses terpisah untuk Pelanggan, Mitra PIC, & Admin Dapur
                </p>
              </div>
            </div>

            {allowClose && onClose && (
              <button
                type="button"
                id="btn-close-auth-modal"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 3 Role Selection Tabs */}
          <div className="mt-5 grid grid-cols-3 gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/10">
            {/* Tab 1: Pelanggan */}
            <button
              type="button"
              id="auth-role-tab-pelanggan"
              onClick={() => {
                setSelectedRole('pelanggan');
                setPendingChangePasswordPIC(null);
              }}
              className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'pelanggan'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pelanggan</span>
            </button>

            {/* Tab 2: Affiliate / PIC */}
            <button
              type="button"
              id="auth-role-tab-affiliate"
              onClick={() => {
                setSelectedRole('affiliate');
                setPendingChangePasswordPIC(null);
              }}
              className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'affiliate'
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mitra PIC</span>
            </button>

            {/* Tab 3: Admin / Dapur */}
            <button
              type="button"
              id="auth-role-tab-admin"
              onClick={() => {
                setSelectedRole('admin');
                setPendingChangePasswordPIC(null);
              }}
              className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-stone-700 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Admin Dapur</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* ==================== TAB 1: PELANGGAN ==================== */}
          {selectedRole === 'pelanggan' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm text-amber-900">
                    Dashboard Katalog & Pesanan Pelanggan
                  </span>
                  <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                    Masuk untuk memesan batch PO, kumpulkan 1 stempel per porsi menu, dan pantau resi tiket pengambilan Anda.
                  </p>
                </div>
              </div>

              {/* Quick Demo Customer Profiles */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Pilih Akun Demo Pelanggan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="login-demo-cust-maya"
                    onClick={() => handleQuickLogin(DEMO_USERS.pelanggan1)}
                    className="p-3 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {DEMO_USERS.pelanggan1.name}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                          Ada PO
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        {DEMO_USERS.pelanggan1.phone}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    id="login-demo-cust-ahmad"
                    onClick={() => handleQuickLogin(DEMO_USERS.pelanggan2)}
                    className="p-3 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block">
                        {DEMO_USERS.pelanggan2.name}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {DEMO_USERS.pelanggan2.phone}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>

              {/* Or Google Sign-In */}
              <div className="pt-1">
                <button
                  type="button"
                  id="btn-google-sign-in"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-xs sm:text-sm text-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
                </button>
              </div>

              {/* Or Custom Login Form */}
              <div className="relative pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-stone-400 font-medium">
                    atau isi Nama & WhatsApp
                  </span>
                </div>
              </div>

              <form onSubmit={handleCustomerLogin} className="space-y-3">
                {custError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{custError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Pemesan:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="input-cust-name"
                      placeholder="Contoh: Rina Kusuma"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor WhatsApp:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      id="input-cust-phone"
                      placeholder="Contoh: 081298765432"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-login-customer-submit"
                  className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Masuk ke Katalog PO</span>
                </button>
              </form>
            </div>
          )}

          {/* ==================== TAB 2: MITRA AFFILIATE / PIC ==================== */}
          {selectedRole === 'affiliate' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Mandatory Password Change View if required */}
              {pendingChangePasswordPIC ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-900">
                    <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm">
                        Wajib Ganti Password Sementara
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Halo <strong>{pendingChangePasswordPIC.name}</strong> ({pendingChangePasswordPIC.code}). Demi keamanan akun PIC Anda, silakan buat password baru sebelum melanjutkan ke Portal Affiliate.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveNewPassword} className="space-y-2.5 pt-1">
                    {changePasswordError && (
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-800 text-xs font-semibold">
                        {changePasswordError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Password Baru (min. 6 karakter):
                      </label>
                      <input
                        type="password"
                        id="input-affiliate-new-password"
                        placeholder="Masukkan password rahasia baru"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Konfirmasi Password Baru:
                      </label>
                      <input
                        type="password"
                        id="input-affiliate-confirm-password"
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500/30 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPendingChangePasswordPIC(null)}
                        className="py-2 px-3 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        id="btn-save-affiliate-new-password"
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                      >
                        Simpan Password & Masuk
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Security Notice Banner */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-xs flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm text-stone-900">
                        Portal Khusus Mitra Affiliate & PIC Titik Kumpul
                      </span>
                      <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                        Akun Affiliate dibuat secara eksklusif oleh Admin Crumb & Cream. Tidak ada pendaftaran publik untuk menjaga integritas titik kumpul.
                      </p>
                    </div>
                  </div>

                  {/* Quick Access Demo for Active Affiliates */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        Pilih Akun PIC untuk Uji Coba:
                      </span>
                      <span className="text-[10px] text-amber-800 font-medium">
                        Klik untuk isi kredensial
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {affiliatePICs.slice(0, 2).map((pic) => (
                        <button
                          key={pic.id}
                          type="button"
                          id={`login-demo-affiliate-${pic.id}`}
                          onClick={() => handleSelectDemoPIC(pic)}
                          className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-600 hover:bg-amber-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                          title="Klik untuk mengisi kode dan password unik akun ini ke form"
                        >
                          <div className="min-w-0 pr-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-stone-900 text-xs truncate">
                                {pic.name}
                              </span>
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-mono px-1 py-0.2 rounded font-bold">
                                {pic.code}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-500 block truncate mt-0.5">
                              {pic.pickupLocationName}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Login Affiliate */}
                  <div className="relative pt-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-stone-400 font-medium">
                        atau masukkan kredensial PIC
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleAffiliateLogin} className="space-y-3">
                    {affiliateError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{affiliateError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Kode Affiliate / WhatsApp / Email:
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id="input-affiliate-identifier"
                          placeholder="Contoh: AFF_ANI8421 atau 081233445566"
                          value={affiliateIdentifier}
                          onChange={(e) => setAffiliateIdentifier(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          Password Akun PIC:
                        </label>
                        <span className="text-[10px] text-stone-400">
                          Wajib password unik akun
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          id="input-affiliate-password"
                          placeholder="Masukkan password akun PIC"
                          value={affiliatePassword}
                          onChange={(e) => setAffiliatePassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="btn-login-affiliate-submit"
                      className="w-full py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Users className="w-4 h-4" />
                      <span>Masuk ke Portal Mitra Affiliate</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ==================== TAB 3: ADMIN / DAPUR ==================== */}
          {selectedRole === 'admin' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                <ChefHat className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm text-amber-900">
                    Akses Penuh Pengelola & Koki Dapur
                  </span>
                  <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                    Kelola menu, jadwal batch PO, pesanan masuk, akun affiliate, pengaturan komisi, dan loyalitas stempel pelanggan.
                  </p>
                </div>
              </div>

              {/* Quick Demo Kitchen Login Helper */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Kredensial Demo Admin Dapur:
                </span>
                <button
                  type="button"
                  id="login-demo-kitchen-chef"
                  onClick={() => {
                    setKitchenPin('1234');
                    setKitchenError('');
                  }}
                  className="w-full p-3.5 rounded-xl border-2 border-amber-600 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                  title="Klik untuk mengisi PIN Demo (1234) ke kolom input"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-black">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                          {DEMO_USERS.dapurChef.name}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                          PIN: 1234
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-800 block">
                        Klik untuk mengisi PIN Demo otomatis
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-700 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* PIN Form */}
              <div className="relative pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-stone-400 font-medium">
                    masukkan PIN Admin untuk verifikasi
                  </span>
                </div>
              </div>

              <form onSubmit={handleKitchenLogin} className="space-y-3">
                {kitchenError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {kitchenError}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      PIN Akses Admin Dapur:
                    </label>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      PIN Demo: 1234
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      id="input-kitchen-pin"
                      placeholder="Masukkan PIN Admin (1234)"
                      value={kitchenPin}
                      onChange={(e) => setKitchenPin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-login-kitchen-submit"
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Masuk ke Dashboard Admin</span>
                </button>
              </form>
            </div>
          )}

          {/* Current Session Indicator */}
          {currentUser && (
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>
                Sedang aktif:{' '}
                <strong className="text-stone-800 font-bold">{currentUser.name}</strong> (
                {currentUser.role === 'admin' || currentUser.role === 'dapur'
                  ? 'Admin Dapur'
                  : currentUser.role === 'affiliate'
                  ? `Mitra PIC (${currentUser.affiliateCode || 'Aktif'})`
                  : 'Pelanggan'}
                )
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

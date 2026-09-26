import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Menu as MenuIcon,
  X,
  ChefHat,
  Cookie,
  User,
  LogOut,
  Calendar,
  Sparkles,
  Phone,
} from 'lucide-react';
import { AuthUser, StoreProfile, UserRole } from '../types';

interface NavbarProps {
  storeProfile: StoreProfile;
  cartCount: number;
  activeOrdersCount?: number;
  ordersCount?: number;
  activeView: 'catalog' | 'kitchen' | 'affiliate';
  onViewChange: (view: 'catalog' | 'kitchen' | 'affiliate') => void;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenSearch?: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: (role?: UserRole) => void;
  onLogout: () => void;
  totalKitchenOrdersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  storeProfile,
  cartCount,
  activeView,
  onViewChange,
  onOpenCart,
  onOpenTracking,
  onOpenSearch,
  currentUser,
  onOpenAuth,
  onLogout,
  totalKitchenOrdersCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isKitchen = currentUser?.role === 'dapur' || currentUser?.role === 'admin';

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'catalog') {
      onViewChange('catalog');
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F2]/95 backdrop-blur-md border-b-2 border-[#E7D5C4] transition-all">
      {/* Top Banner Notice */}
      <div className="bg-[#633F35] text-[#FFF9F2] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="truncate">
          Preorder <strong>Batch #12</strong> Open • Fresh Oven <strong>21 April 2025</strong> • Free Delivery Area Surabaya Tertentu
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Name */}
          <div
            onClick={() => {
              if (activeView !== 'catalog') onViewChange('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#633F35] text-[#FFF9F2] flex items-center justify-center shadow-md shadow-[#633F35]/15 group-hover:scale-105 transition-transform">
              <Cookie className="w-5 h-5 text-[#F3E9DD]" />
            </div>
            <div>
              <span className="font-display font-black text-xl sm:text-2xl text-[#633F35] tracking-tight block leading-none">
                MOOI BITES COOKIE
              </span>
              <span className="text-[10px] text-[#8A5A4D] font-bold tracking-widest uppercase">
                A Little Bite, A Lot of Love
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#633F35]">
            <button
              onClick={() => {
                if (activeView !== 'catalog') onViewChange('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#8A5A4D] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('our-cookies')}
              className="hover:text-[#8A5A4D] transition-colors"
            >
              Menu
            </button>
            <button
              onClick={() => scrollToSection('build-your-box')}
              className="hover:text-[#8A5A4D] transition-colors"
            >
              Build Your Box
            </button>
            <button
              onClick={() => scrollToSection('how-to-order')}
              className="hover:text-[#8A5A4D] transition-colors"
            >
              How to Order
            </button>
            <button
              onClick={onOpenTracking}
              className="hover:text-[#8A5A4D] transition-colors"
            >
              Track Order
            </button>
          </nav>

          {/* Right Action Icons: Search & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search cookies"
                className="w-10 h-10 rounded-xl bg-[#F3E9DD] text-[#633F35] flex items-center justify-center hover:bg-[#E7D5C4] transition-colors border border-[#E7D5C4]"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Cart Icon with Item Counter */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#633F35] text-[#FFF9F2] hover:bg-[#4E3129] active:scale-95 transition-all shadow-sm shadow-[#633F35]/15"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#FFF9F2] text-[#633F35] w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Staff / Admin Portal Toggle */}
            <button
              type="button"
              onClick={() => {
                if (isKitchen) {
                  onViewChange(activeView === 'kitchen' ? 'catalog' : 'kitchen');
                } else {
                  onOpenAuth('dapur');
                }
              }}
              title="Akses Admin / Dapur"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#E7D5C4] bg-[#F3E9DD] text-[#633F35] hover:bg-[#E7D5C4]"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#8A5A4D]" />
              <span>{isKitchen ? (activeView === 'kitchen' ? 'Lihat Toko' : 'Dashboard Dapur') : 'Staff Dapur'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#F3E9DD] text-[#633F35] flex items-center justify-center border border-[#E7D5C4]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F2] border-b-2 border-[#E7D5C4] px-4 py-5 space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-bold text-[#633F35]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (activeView !== 'catalog') onViewChange('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-[#F3E9DD]"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('our-cookies')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-[#F3E9DD]"
            >
              Menu Cookies
            </button>
            <button
              onClick={() => scrollToSection('build-your-box')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-[#F3E9DD]"
            >
              Build Your Box
            </button>
            <button
              onClick={() => scrollToSection('how-to-order')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-[#F3E9DD]"
            >
              How to Order
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracking();
              }}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-[#F3E9DD]"
            >
              Track Order
            </button>

            {/* Kitchen dashboard switch in mobile menu */}
            <div className="pt-2 border-t border-[#E7D5C4]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isKitchen) {
                    onViewChange(activeView === 'kitchen' ? 'catalog' : 'kitchen');
                  } else {
                    onOpenAuth('dapur');
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F3E9DD] text-[#633F35] text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-[#8A5A4D]" />
                  <span>{isKitchen ? (activeView === 'kitchen' ? 'Kembali ke Katalog' : 'Buka Dashboard Dapur') : 'Login Staff Dapur'}</span>
                </div>
                {currentUser && <span className="text-[10px] text-[#8A5A4D]">{currentUser.name}</span>}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

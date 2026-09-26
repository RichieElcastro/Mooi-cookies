import React from 'react';
import { Home, Cookie, Search, ShoppingBag, ReceiptText, ChefHat } from 'lucide-react';
import { AuthUser } from '../types';

export type MainNavigationTab = 'catalog' | 'menu' | 'track-order' | 'cart';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
  totalCartPrice: number;
  currentUser: AuthUser | null;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenMenu: () => void;
  onOpenHome: () => void;
  activeView: 'catalog' | 'kitchen' | 'affiliate';
  onViewChange: (view: 'catalog' | 'kitchen' | 'affiliate') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  currentUser,
  onOpenCart,
  onOpenTracking,
  onOpenMenu,
  onOpenHome,
  activeView,
  onViewChange,
}) => {
  const isKitchen = currentUser?.role === 'dapur' || currentUser?.role === 'admin';

  if (activeView === 'kitchen') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#633F35] border-t-2 border-[#8A5A4D] px-4 py-2.5 flex items-center justify-between text-[#FFF9F2] shadow-lg">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-amber-300" />
          <span className="text-xs font-bold">Dashboard Dapur Mooi Bites</span>
        </div>
        <button
          type="button"
          onClick={() => onViewChange('catalog')}
          className="px-3 py-1.5 rounded-xl bg-[#FFF9F2] text-[#633F35] text-xs font-bold shadow-xs"
        >
          Lihat Toko
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F2]/98 backdrop-blur-md border-t-2 border-[#E7D5C4] px-3 py-2 shadow-2xl shadow-[#633F35]/15">
      <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={onOpenHome}
          className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
            activeTab === 'home'
              ? 'text-[#633F35] font-bold'
              : 'text-[#8A5A4D] hover:text-[#633F35]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* 2. Menu */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
            activeTab === 'menu'
              ? 'text-[#633F35] font-bold'
              : 'text-[#8A5A4D] hover:text-[#633F35]'
          }`}
        >
          <Cookie className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>

        {/* 3. Track Order */}
        <button
          type="button"
          onClick={onOpenTracking}
          className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
            activeTab === 'track-order'
              ? 'text-[#633F35] font-bold'
              : 'text-[#8A5A4D] hover:text-[#633F35]'
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Track Order</span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1.5 rounded-2xl text-[#633F35] font-bold transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#633F35] text-[#FFF9F2] w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>
      </div>
    </div>
  );
};

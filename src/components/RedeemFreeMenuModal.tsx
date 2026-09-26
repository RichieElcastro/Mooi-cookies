import React, { useState } from 'react';
import { X, Gift, Check, Sparkles, Search, CheckCircle } from 'lucide-react';
import { MenuItem, VoucherReward } from '../types';
import { formatRupiah } from '../utils/formatters';

interface RedeemFreeMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherReward | null;
  menuItems: MenuItem[];
  onRedeem: (menuItem: MenuItem, voucherId: string) => void;
}

export const RedeemFreeMenuModal: React.FC<RedeemFreeMenuModalProps> = ({
  isOpen,
  onClose,
  voucher,
  menuItems,
  onRedeem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen || !voucher) return null;

  const availableItems = menuItems.filter((m) => m.isAvailable);
  const categories = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'cheesecake', label: 'Cheesecake' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'dessert_box', label: 'Dessert Box' },
    { id: 'minuman', label: 'Minuman' },
  ];

  const filteredItems = availableItems.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        id="redeem-free-menu-modal"
        className="relative bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-700/80 border border-amber-500/40 flex items-center justify-center text-amber-200 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg font-serif">
                  Tukarkan 1 Menu Gratis
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                  {voucher.code}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Pilih 1 item dessert apa saja di bawah ini tanpa biaya tambahan (Rp 0)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-stone-100 bg-stone-50/80 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dessert gratis favorit Anda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items List */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-stone-100">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <p className="text-sm font-semibold">Tidak ada menu yang sesuai pencarian.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-amber-800 font-bold underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 bg-amber-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
                      GRATIS
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base font-serif truncate">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400 line-through">
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Rp 0 (Hadiah Stempel)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRedeem(item, voucher.id)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Klaim Menu Ini</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-stone-600">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>1 porsi menu akan otomatis masuk ke keranjang Anda dengan harga Rp 0</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 font-bold px-3 py-1 cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

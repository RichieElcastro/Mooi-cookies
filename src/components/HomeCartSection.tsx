import React from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface HomeCartSectionProps {
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  onScrollToCatalog: () => void;
  selectedBatchDate: string;
}

export const HomeCartSection: React.FC<HomeCartSectionProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onScrollToCatalog,
  selectedBatchDate,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section
      id="section-keranjang"
      className="scroll-mt-28 p-4 sm:p-6 lg:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
            <ShoppingBag className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-serif">
                Keranjang Pre-Order
              </h2>
              <span
                id="home-cart-count-badge"
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
              >
                {totalItemsCount} Item
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Periksa pilihan dessert dan tentukan jumlah porsi sebelum konfirmasi pembayaran
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onScrollToCatalog}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dessert Lain</span>
          </button>
        )}
      </div>

      {/* Cart Content */}
      {items.length === 0 ? (
        <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg font-serif">
            Keranjang Pre-Order Anda Masih Kosong
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Pilih varian Basque Cheesecake, Gourmet Chunky Cookies, atau Paket Hampers dari katalog di atas untuk mengisi keranjang Anda.
          </p>
          <button
            type="button"
            id="btn-browse-catalog-from-cart"
            onClick={onScrollToCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md shadow-amber-700/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pilih Dessert dari Katalog</span>
          </button>
        </div>
      ) : (
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of items */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 hover:bg-amber-50/40 border border-stone-200/90 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
              >
                {/* Item Info */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                      {item.menuItem.name}
                    </h4>
                    {item.itemPrice === 0 ? (
                      <span className="inline-block text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                        GRATIS (Reward Stempel)
                      </span>
                    ) : (
                      <p className="text-xs font-extrabold text-amber-800 font-serif">
                        {formatRupiah(item.itemPrice || item.menuItem?.price || 0)}
                      </p>
                    )}

                    {/* Selected Customizations */}
                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <div className="text-[11px] text-stone-600 bg-stone-100/70 p-2 rounded-lg space-y-0.5">
                        {item.selectedCustomizations.map((cust, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
                            <span className="text-stone-500">{cust.groupName}:</span>
                            <span className="font-medium text-stone-800">
                              {cust.selectedLabel}
                              {cust.extraPrice > 0 && ` (+${formatRupiah(cust.extraPrice)})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Backward-compatible check for legacy selectedOptions if any */}
                    {(item as any).selectedOptions &&
                      typeof (item as any).selectedOptions === 'object' &&
                      Object.keys((item as any).selectedOptions).length > 0 && (
                        <div className="text-[11px] text-stone-500 space-y-0.5">
                          {Object.entries((item as any).selectedOptions).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="capitalize text-stone-400">{key}:</span>
                              <span className="font-medium text-stone-700">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    {item.notes && (
                      <p className="text-[11px] text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded inline-block font-medium">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Counter & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-stone-400 block">Subtotal</span>
                    <span className="text-sm font-black text-stone-900 font-serif">
                      {formatRupiah(item.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 sm:p-2 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Kurangi"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 sm:p-2 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Tambah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Checkout Action */}
          <div className="lg:col-span-5 xl:col-span-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider">
              Ringkasan Pre-Order
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Total Porsi / Box</span>
                <span className="font-bold text-stone-800">{totalItemsCount} Porsi</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal Menu</span>
                <span className="font-bold text-stone-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Jadwal Batch Baking</span>
                <span className="font-bold text-amber-900">{formatDateIndo(selectedBatchDate)}</span>
              </div>
              <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between text-sm">
                <span className="font-extrabold text-stone-900">Total Pembayaran</span>
                <span className="font-black text-lg text-amber-900 font-serif">
                  {formatRupiah(subtotal)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-200/80 text-[11px] text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Garansi Fresh-Baked Hari H</span>
              </div>
              <p>
                Dipanggang khusus pada batch tanggal <strong>{formatDateIndo(selectedBatchDate)}</strong>. Anda dapat memilih metode Self-Pickup di Dapur atau Delivery.
              </p>
            </div>

            <button
              type="button"
              id="btn-checkout-from-home-cart"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-[0.99] text-white font-extrabold text-sm shadow-md shadow-amber-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

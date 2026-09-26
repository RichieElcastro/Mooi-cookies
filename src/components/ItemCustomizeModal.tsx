import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Calendar,
  ShieldCheck,
  Flame,
  ChefHat,
  ShoppingBag,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { MenuItem, CartCustomization } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ItemCustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    customizations: CartCustomization[],
    notes: string,
  ) => void;
  isKitchenAdmin?: boolean;
  onEditInKitchen?: (item: MenuItem) => void;
}

export const ItemCustomizeModal: React.FC<ItemCustomizeModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  isKitchenAdmin = false,
  onEditInKitchen,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSelections, setSelectedSelections] = useState<
    Record<string, { label: string; extraPrice: number }>
  >({});
  const [notes, setNotes] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Default gallery images for high-end preview
  const galleryImages = item
    ? [
        item.image,
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
      ]
    : [];

  useEffect(() => {
    setQuantity(1);
    setNotes('');
    setSelectedImageIndex(0);
    const defaults: Record<string, { label: string; extraPrice: number }> = {};
    if (item?.customizations) {
      item.customizations.forEach((group) => {
        if (group.options.length > 0) {
          defaults[group.name] = group.options[0];
        }
      });
    }
    setSelectedSelections(defaults);
  }, [item]);

  if (!isOpen || !item) return null;

  const availableStock = Math.max(0, item.maxQuota - item.bookedQuota);
  const isSoldOut = !item.isAvailable || availableStock <= 0;

  const extraTotal = (
    Object.values(selectedSelections) as { label: string; extraPrice: number }[]
  ).reduce((acc: number, curr) => acc + (curr?.extraPrice || 0), 0);
  const singleUnitPrice = item.price + extraTotal;
  const totalPrice = singleUnitPrice * quantity;

  const handleOptionChange = (
    groupName: string,
    option: { label: string; extraPrice: number },
  ) => {
    setSelectedSelections((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const customizationsList: CartCustomization[] = (
      Object.entries(selectedSelections) as [string, { label: string; extraPrice: number }][]
    ).map(([groupName, option]) => ({
      groupName,
      selectedLabel: option.label,
      extraPrice: option.extraPrice,
    }));

    onAddToCart(item, quantity, customizationsList, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#633F35]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF9F2] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border-2 border-[#E7D5C4] shadow-2xl flex flex-col relative text-[#633F35]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] flex items-center justify-center hover:bg-[#F3E9DD] shadow-sm transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Content */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Main Visuals & Title Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Gallery Column */}
            <div className="md:col-span-6 space-y-3">
              {/* Primary Large Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F3E9DD] border border-[#E7D5C4] shadow-sm">
                <img
                  src={galleryImages[selectedImageIndex] || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {item.badge && (
                  <div className="absolute top-3 left-3 bg-[#FFF9F2]/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-[#633F35] border border-[#E7D5C4] uppercase">
                    {item.badge}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex items-center gap-2.5">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#633F35] ring-2 ring-[#633F35]/20 scale-105'
                        : 'border-[#E7D5C4] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Column */}
            <div className="md:col-span-6 space-y-4">
              {/* Stock & Batch info */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E9DD] text-xs font-bold text-[#633F35]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSoldOut ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span>
                    {isSoldOut ? 'Sold Out' : `Tersedia: ${availableStock} / ${item.maxQuota} Porsi`}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF9F2] border border-[#E7D5C4] text-[11px] font-semibold text-[#8A5A4D]">
                  <Calendar className="w-3.5 h-3.5 text-[#8A5A4D]" />
                  <span>Batch: 21 April 2025</span>
                </div>
              </div>

              {/* Product Title & Price */}
              <div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-[#633F35] leading-tight">
                  {item.name}
                </h2>
                <div className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-[#633F35]">
                  {formatRupiah(item.price)}
                </div>
              </div>

              {/* Editorial Description */}
              <p className="text-sm text-[#633F35]/85 leading-relaxed">
                {item.description}
              </p>

              {/* Quantity selector */}
              {!isSoldOut && (
                <div className="pt-2 border-t border-[#E7D5C4]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-2">
                    Jumlah Pesanan
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-[#E7D5C4] rounded-2xl bg-[#F3E9DD] p-1.5">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#633F35] hover:bg-[#FFF9F2] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-display font-bold text-lg text-[#633F35]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                        disabled={quantity >= availableStock}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#633F35] hover:bg-[#FFF9F2] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-[#8A5A4D]">
                      Maks. {availableStock} cookies per pesanan
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Options (if any) */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E7D5C4]">
              {item.customizations.map((group) => (
                <div key={group.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#633F35]">
                      {group.name}
                    </span>
                    {group.required && (
                      <span className="text-[10px] text-[#8A5A4D] font-bold uppercase">Wajib Dipilih</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedSelections[group.name]?.label === opt.label;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleOptionChange(group.name, opt)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'bg-[#633F35] text-[#FFF9F2] border-[#633F35] font-semibold shadow-xs'
                              : 'bg-[#F3E9DD]/60 hover:bg-[#F3E9DD] border-[#E7D5C4] text-[#633F35]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {opt.extraPrice > 0 && (
                            <span className={isSelected ? 'text-[#FFF9F2]' : 'text-[#8A5A4D] font-bold'}>
                              +{formatRupiah(opt.extraPrice)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dedicated Section: "Freshness You Can Taste" as specified */}
          <div className="bg-[#F3E9DD] rounded-2xl p-4 sm:p-5 border border-[#E7D5C4] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8A5A4D]" />
              <h4 className="font-display font-bold text-base text-[#633F35]">
                Freshness You Can Taste
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-[#633F35]">
              <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#E7D5C4]/60 text-center">
                <span className="block font-bold text-[#633F35]">Best enjoyed</span>
                <span className="text-[11px] text-[#8A5A4D]">Within 3 days</span>
              </div>
              <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#E7D5C4]/60 text-center">
                <span className="block font-bold text-[#633F35]">Store properly</span>
                <span className="text-[11px] text-[#8A5A4D]">Room temperature</span>
              </div>
              <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#E7D5C4]/60 text-center">
                <span className="block font-bold text-[#633F35]">Refrigerate</span>
                <span className="text-[11px] text-[#8A5A4D]">Up to 7 days</span>
              </div>
              <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#E7D5C4]/60 text-center">
                <span className="block font-bold text-[#633F35]">Warm before eating</span>
                <span className="text-[11px] text-[#8A5A4D]">10–15 seconds</span>
              </div>
            </div>
          </div>

          {/* Product Ingredients & Allergen Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#633F35]/80 pt-2 border-t border-[#E7D5C4]">
            <div className="space-y-1">
              <strong className="text-[#633F35] font-bold block uppercase tracking-wider text-[11px]">
                Product Ingredients
              </strong>
              <p className="leading-relaxed">
                French Butter AOP, Belgian Semi-Sweet & Dark Chocolate, Organic Unbleached Flour, Dark Brown Cane Sugar, Free-range Eggs, Pure Vanilla, Maldon Sea Salt.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-[#633F35] font-bold block uppercase tracking-wider text-[11px]">
                Allergen Information
              </strong>
              <p className="leading-relaxed">
                Mengandung gandum/gluten, telur, dan produk olahan susu (dairy). Dibuat di kitchen studio yang higienis dan tidak menggunakan bahan pengawet.
              </p>
            </div>
          </div>

          {/* Notes input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8A5A4D] mb-1">
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tolong pisahkan bungkus satuan untuk kado teman..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7D5C4] bg-[#FFF9F2] text-xs text-[#633F35] placeholder:text-[#8A5A4D]/60 focus:outline-hidden focus:border-[#633F35]"
            />
          </div>

          {/* Kitchen Admin Shortcut */}
          {isKitchenAdmin && onEditInKitchen && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-semibold">
                <ChefHat className="w-4 h-4 text-amber-700" />
                <span>Mode Pengelola Dapur Aktif</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditInKitchen(item);
                }}
                className="px-3 py-1 bg-[#633F35] text-[#FFF9F2] rounded-lg text-xs font-bold hover:bg-[#4E3129]"
              >
                Edit Kuota / Harga
              </button>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="p-4 sm:p-6 bg-[#F3E9DD] border-t-2 border-[#E7D5C4] flex items-center justify-between gap-4 mt-auto">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5A4D]">
              Total Harga ({quantity} Cookies)
            </span>
            <div className="font-display font-black text-2xl sm:text-3xl text-[#633F35]">
              {formatRupiah(totalPrice)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-[#633F35] hover:bg-[#4E3129] active:scale-[0.98] text-[#FFF9F2] font-bold text-sm sm:text-base transition-all shadow-md shadow-[#633F35]/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

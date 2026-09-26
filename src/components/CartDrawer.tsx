import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Gift, Check } from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  hasPremiumBox?: boolean;
  onTogglePremiumBox?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  hasPremiumBox = false,
  onTogglePremiumBox,
}) => {
  if (!isOpen) return null;

  const PREMIUM_BOX_PRICE = 8000;
  const itemsSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const boxTotal = hasPremiumBox ? PREMIUM_BOX_PRICE : 0;
  const subtotal = itemsSubtotal + boxTotal;
  const deliveryFee = 0; // Calculated on checkout based on pickup vs delivery
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#633F35]/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFF9F2] h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l-2 border-[#E7D5C4] text-[#633F35]">
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#E7D5C4] flex items-center justify-between bg-[#F3E9DD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#633F35] text-[#FFF9F2] flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-[#633F35] text-xl sm:text-2xl">
                Your Cart
              </h2>
              <p className="text-xs text-[#8A5A4D] font-medium">
                {totalItemsCount} cookies in basket
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] flex items-center justify-center hover:bg-[#E7D5C4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#F3E9DD] border border-[#E7D5C4] flex items-center justify-center text-[#8A5A4D]">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-[#633F35]">
                  Keranjangmu Masih Kosong
                </h3>
                <p className="text-xs text-[#8A5A4D] max-w-xs">
                  Yuk jelajahi varian cookies chunky fresh-baked kami untuk preorder batch 21 April 2025.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F3E9DD] rounded-2xl p-3.5 border border-[#E7D5C4] flex gap-3 shadow-2xs group"
                >
                  {/* Product Image */}
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#E7D5C4] bg-[#FFF9F2] shrink-0"
                  />

                  {/* Info & Controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-display font-bold text-sm sm:text-base text-[#633F35] leading-snug">
                          {item.menuItem.name}
                        </h4>
                        <div className="text-xs font-semibold text-[#8A5A4D]">
                          {formatRupiah(item.itemPrice)}
                        </div>
                      </div>

                      {/* Delete Icon */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#8A5A4D] hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity controls & item subtotal */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E7D5C4]/60">
                      <div className="flex items-center border border-[#E7D5C4] rounded-xl bg-[#FFF9F2] p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#633F35] hover:bg-[#F3E9DD] transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-display font-bold text-xs text-[#633F35]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#633F35] hover:bg-[#F3E9DD] transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-display font-bold text-sm text-[#633F35]">
                        {formatRupiah(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add a Box Section as explicitly specified */}
              <div className="mt-4 p-4 rounded-2xl bg-[#F3E9DD] border-2 border-dashed border-[#8A5A4D]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF9F2] text-[#633F35] flex items-center justify-center border border-[#E7D5C4]">
                      <Gift className="w-4 h-4 text-[#8A5A4D]" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#633F35]">
                        Premium Box
                      </h4>
                      <p className="text-[11px] text-[#8A5A4D]">
                        Packaging gift box mewah + pita satin cokelat
                      </p>
                    </div>
                  </div>

                  <span className="font-display font-bold text-xs text-[#633F35]">
                    {formatRupiah(PREMIUM_BOX_PRICE)}
                  </span>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onTogglePremiumBox}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      hasPremiumBox
                        ? 'bg-[#633F35] text-[#FFF9F2]'
                        : 'bg-[#FFF9F2] text-[#633F35] border border-[#E7D5C4] hover:bg-[#E7D5C4]'
                    }`}
                  >
                    {hasPremiumBox ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <span>+ Add Premium Box</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#F3E9DD] border-t-2 border-[#E7D5C4] space-y-3">
            <div className="space-y-1.5 text-xs text-[#633F35]">
              <div className="flex justify-between">
                <span className="text-[#8A5A4D]">Subtotal</span>
                <span className="font-semibold">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A5A4D]">Delivery Fee</span>
                <span className="font-semibold text-emerald-700">
                  {deliveryFee === 0 ? 'Dihitung di checkout' : formatRupiah(deliveryFee)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatRupiah(discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E7D5C4] flex justify-between items-baseline">
                <span className="font-display font-bold text-base text-[#633F35]">Total</span>
                <span className="font-display font-black text-2xl text-[#633F35]">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#633F35] hover:bg-[#4E3129] text-[#FFF9F2] font-bold text-base shadow-lg shadow-[#633F35]/20 active:scale-[0.98] transition-all"
            >
              <span>Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  onViewDetails: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onAddToCart,
  onViewDetails,
}) => {
  const [qty, setQty] = useState(1);

  const availableStock = Math.max(0, item.maxQuota - item.bookedQuota);
  const isSoldOut = !item.isAvailable || availableStock <= 0;

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty < availableStock) setQty(qty + 1);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    onAddToCart(item, qty);
    setQty(1);
  };

  return (
    <div
      onClick={() => onViewDetails(item)}
      className="group bg-[#FFF9F2] rounded-3xl border-2 border-[#E7D5C4] hover:border-[#633F35]/40 transition-all duration-300 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-[#633F35]/8 cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F3E9DD] m-3 rounded-2xl border border-[#E7D5C4]/60">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge */}
        {item.badge && (
          <div className="absolute top-2.5 left-2.5 bg-[#FFF9F2]/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-[#633F35] uppercase border border-[#E7D5C4] shadow-xs">
            {item.badge}
          </div>
        )}

        {/* View Details Hover Overlay */}
        <div className="absolute inset-0 bg-[#633F35]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[#FFF9F2] text-[#633F35] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            <span>Detail & Cerita Rasa</span>
          </div>
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#633F35]/70 backdrop-blur-xs flex items-center justify-center">
            <span className="font-display font-black text-xl text-[#FFF9F2] uppercase tracking-widest px-4 py-2 border-2 border-[#FFF9F2] rounded-xl">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 pt-1 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Availability indicator */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSoldOut ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span className={isSoldOut ? 'text-rose-600 font-bold' : 'text-[#8A5A4D]'}>
                {isSoldOut ? 'SOLD OUT' : `Available (${availableStock}/${item.maxQuota})`}
              </span>
            </div>

            <span className="text-[10px] text-[#8A5A4D] bg-[#F3E9DD] px-2 py-0.5 rounded-md font-semibold">
              Small Batch
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[#633F35] group-hover:text-[#8A5A4D] transition-colors leading-snug">
            {item.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#633F35]/75 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>

          {/* Price */}
          <div className="mt-3">
            <span className="font-display font-extrabold text-xl sm:text-2xl text-[#633F35]">
              {formatRupiah(item.price)}
            </span>
          </div>
        </div>

        {/* Action Controls: Quantity selector + Add to Cart */}
        <div className="pt-2 border-t border-[#E7D5C4]/70 space-y-2.5">
          {!isSoldOut ? (
            <div className="flex items-center gap-2">
              {/* Quantity selector */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center border border-[#E7D5C4] rounded-xl bg-[#F3E9DD] p-1"
              >
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={qty <= 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#633F35] hover:bg-[#FFF9F2] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#633F35]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={qty >= availableStock}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#633F35] hover:bg-[#FFF9F2] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#633F35] hover:bg-[#4E3129] text-[#FFF9F2] font-semibold text-xs transition-all active:scale-[0.98] shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Cart</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2.5 rounded-xl bg-[#E7D5C4]/50 text-[#8A5A4D] font-bold text-xs cursor-not-allowed uppercase tracking-wider"
            >
              Sold Out Batch Ini
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

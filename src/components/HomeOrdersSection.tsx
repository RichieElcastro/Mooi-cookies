import React, { useState, useMemo } from 'react';
import {
  ReceiptText,
  Clock,
  Calendar,
  Search,
  CheckCircle2,
  QrCode,
  MapPin,
  Truck,
  MessageCircle,
  ExternalLink,
  ChefHat,
  ChevronRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { Order, StoreProfile } from '../types';
import {
  formatDateIndo,
  formatRupiah,
  getStatusDetails,
  generateWhatsAppUrl,
} from '../utils/formatters';

interface HomeOrdersSectionProps {
  orders: Order[];
  myOrderIds: string[];
  storeProfile: StoreProfile;
  onSelectOrder: (order: Order, defaultTab?: 'pickup_pass' | 'full_receipt') => void;
  onScrollToCatalog: () => void;
}

type OrderFilter = 'all' | 'diproses' | 'siap' | 'selesai';

export const HomeOrdersSection: React.FC<HomeOrdersSectionProps> = ({
  orders,
  myOrderIds = [],
  storeProfile,
  onSelectOrder,
  onScrollToCatalog,
}) => {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary list of customer orders
  const customerOrders = useMemo(() => {
    if (myOrderIds.length === 0) return orders;
    return orders.filter((o) => myOrderIds.includes(o.id));
  }, [orders, myOrderIds]);

  const displayedList = customerOrders.length > 0 ? customerOrders : orders;

  const filteredOrders = useMemo(() => {
    return displayedList.filter((order) => {
      // Status filter
      if (filter === 'siap' && order.orderStatus !== 'siap') return false;
      if (filter === 'selesai' && order.orderStatus !== 'selesai') return false;
      if (
        filter === 'diproses' &&
        !['menunggu_konfirmasi', 'dikonfirmasi', 'diproses_dapur'].includes(order.orderStatus)
      ) {
        return false;
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        order.id.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.items.some((it) => it.menuItem.name.toLowerCase().includes(q))
      );
    });
  }, [displayedList, filter, searchQuery]);

  const countSiap = displayedList.filter((o) => o.orderStatus === 'siap').length;
  const countDiproses = displayedList.filter((o) =>
    ['menunggu_konfirmasi', 'dikonfirmasi', 'diproses_dapur'].includes(o.orderStatus)
  ).length;
  const countSelesai = displayedList.filter((o) => o.orderStatus === 'selesai').length;

  return (
    <section
      id="section-pesanan"
      className="scroll-mt-28 p-4 sm:p-6 lg:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-800/20">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-serif">
                Pesanan Saya
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {displayedList.length} Pesanan
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Pantau jadwal baking oven, status pengambilan di dapur, dan unduh tiket resi
            </p>
          </div>
        </div>

        {/* Search Order Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. pesanan / nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'all'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <span>Semua</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15">
            {displayedList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('diproses')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'diproses'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Sedang Dipanggang</span>
          {countDiproses > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {countDiproses}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('siap')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'siap'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Siap Diambil</span>
          {countSiap > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
              {countSiap}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('selesai')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'selesai'
              ? 'bg-stone-800 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <span>Selesai</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
            {countSelesai}
          </span>
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <ReceiptText className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-base font-serif">
            Tidak Ada Pesanan Ditemukan
          </h3>
          <p className="text-xs text-stone-500">
            {searchQuery
              ? `Tidak ada pesanan yang cocok dengan "${searchQuery}".`
              : 'Belum ada riwayat pesanan untuk kategori ini.'}
          </p>
          <button
            type="button"
            onClick={onScrollToCatalog}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors"
          >
            <span>Buka Katalog Dessert</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const status = getStatusDetails(order.orderStatus);
            const isReady = order.orderStatus === 'siap';
            const totalItemsCount = order.items.reduce((s, it) => s + it.quantity, 0);

            return (
              <div
                key={order.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isReady
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
                    : 'bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-white'
                }`}
              >
                {/* Top Info: ID, Batch Date, Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm sm:text-base text-stone-900 font-mono">
                          #{order.id}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-amber-700" />
                        <span>
                          Batch: <strong>{formatDateIndo(order.batchDate)}</strong>
                        </span>
                        <span>•</span>
                        <span>{order.createdAt}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">Total PO</span>
                      <span className="text-sm sm:text-base font-black text-amber-900 font-serif">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery / Pickup method tag */}
                  <div className="flex items-center gap-2 text-xs">
                    {order.deliveryMethod === 'delivery' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-medium">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Diantar ke: {order.deliveryAddress || 'Alamat Penerima'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 border border-amber-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>Self-Pickup di Dapur Crumb & Cream</span>
                      </span>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5 pt-1">
                    {order.items.slice(0, 3).map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-stone-700 bg-white/80 p-2 rounded-xl border border-stone-200/60"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={it.menuItem.image}
                            alt={it.menuItem.name}
                            className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold truncate">
                            {it.menuItem.name}
                          </span>
                        </div>
                        <span className="text-stone-500 font-mono text-[11px] shrink-0 ml-2">
                          {it.quantity}x
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-[11px] text-stone-400 italic text-center">
                        +{order.items.length - 3} menu lainnya ({totalItemsCount} total porsi)
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order, 'pickup_pass')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        isReady
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40'
                          : 'bg-amber-700 hover:bg-amber-800 text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isReady ? 'Resi Pengambilan (Siap)' : 'Tiket Resi PO'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectOrder(order, 'full_receipt')}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                    >
                      Rincian
                    </button>
                  </div>

                  <a
                    href={generateWhatsAppUrl(order, storeProfile.whatsapp, storeProfile.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Dapur</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import {
  ChefHat,
  ClipboardCheck,
  Package,
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  CheckCircle,
  Truck,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  MessageSquare,
  Search,
  ExternalLink,
  Star,
  Trash2,
  AlertCircle,
  Pencil,
  CalendarDays,
  Printer,
  RotateCcw,
  CheckSquare,
  Square,
  X,
  Sparkles,
  Flame,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  BadgeAlert,
  SlidersHorizontal,
  Users,
  ScanLine,
  XCircle,
} from 'lucide-react';
import {
  AuthUser,
  MenuItem,
  Order,
  OrderStatus,
  POBatchSchedule,
  ProductCategory,
  StoreProfile,
} from '../types';
import {
  formatDateIndo,
  formatRupiah,
  getStatusDetails,
  getWhatsAppLink,
} from '../utils/formatters';
import { ImageUploadField } from './ImageUploadField';
import { ManagePODates } from './ManagePODates';

interface KitchenDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  storeProfile: StoreProfile;
  availableDates: string[];
  batchSchedules: POBatchSchedule[];
  currentUser?: AuthUser | null;
  onSwitchAccount?: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateMenuQuota: (menuId: string, newMaxQuota: number) => void;
  onToggleMenuAvailability: (menuId: string) => void;
  onAddNewMenuItem: (newItem: MenuItem) => void;
  onUpdateMenuItem?: (updatedItem: MenuItem) => void;
  onDeleteMenuItem?: (menuId: string) => void;
  onViewOrderReceipt: (order: Order) => void;
  onAddBatchSchedule: (schedule: POBatchSchedule) => void;
  onUpdateBatchSchedule: (schedule: POBatchSchedule) => void;
  onToggleBatchSchedule: (date: string) => void;
  onDeleteBatchSchedule: (date: string) => void;
  onOpenAffiliate?: () => void;
  onOpenQRScanner?: () => void;
  controlledActiveTab?: 'rekap' | 'orders' | 'menu' | 'dates';
  onActiveTabChange?: (tab: 'rekap' | 'orders' | 'menu' | 'dates') => void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({
  orders,
  menuItems,
  storeProfile,
  availableDates,
  batchSchedules,
  currentUser,
  onSwitchAccount,
  onUpdateOrderStatus,
  onUpdateMenuQuota,
  onToggleMenuAvailability,
  onAddNewMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onViewOrderReceipt,
  onAddBatchSchedule,
  onUpdateBatchSchedule,
  onToggleBatchSchedule,
  onDeleteBatchSchedule,
  onOpenAffiliate,
  onOpenQRScanner,
  controlledActiveTab,
  onActiveTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'rekap' | 'orders' | 'menu' | 'dates'>('orders');
  const activeTab = controlledActiveTab ?? internalTab;
  const setActiveTab = (tab: 'rekap' | 'orders' | 'menu' | 'dates') => {
    setInternalTab(tab);
    onActiveTabChange?.(tab);
  };
  const [selectedBatchDate, setSelectedBatchDate] = useState<string>(availableDates[0] || '2026-09-18');
  
  // Tab 1 (Rekap Oven) Filters
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Tab 2 (Orders) Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderDateFilter, setOrderDateFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Tab 3 (Menu Catalog) Filters
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState<string>('');

  // Menu Delete & Confirmation State
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);

  // Menu Edit State
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editMenuName, setEditMenuName] = useState<string>('');
  const [editMenuCategory, setEditMenuCategory] = useState<ProductCategory>('cookies');
  const [editMenuPrice, setEditMenuPrice] = useState<number>(0);
  const [editMenuDesc, setEditMenuDesc] = useState<string>('');
  const [editMenuQuota, setEditMenuQuota] = useState<number>(20);
  const [editMenuPrepTime, setEditMenuPrepTime] = useState<string>('');
  const [editMenuImage, setEditMenuImage] = useState<string>('');

  // New Menu Form State
  const [showAddMenuModal, setShowAddMenuModal] = useState<boolean>(false);
  const [newMenuName, setNewMenuName] = useState<string>('');
  const [newMenuCategory, setNewMenuCategory] = useState<ProductCategory>('cookies');
  const [newMenuPrice, setNewMenuPrice] = useState<number>(35000);
  const [newMenuDesc, setNewMenuDesc] = useState<string>('');
  const [newMenuQuota, setNewMenuQuota] = useState<number>(20);
  const [newMenuImage, setNewMenuImage] = useState<string>(
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&auto=format&fit=crop&q=80'
  );

  // Filter orders for the selected batch date
  const batchOrders = useMemo(() => {
    return orders.filter(
      (o) => o.poDate === selectedBatchDate && o.orderStatus !== 'dibatalkan'
    );
  }, [orders, selectedBatchDate]);

  // Compute Kitchen Prep Totals (Total portions to cook/bottle for this batch)
  const kitchenTally: Record<
    string,
    {
      name: string;
      category: string;
      totalQty: number;
      customizationsTally: Record<string, number>;
      notesList: string[];
    }
  > = useMemo(() => {
    const tally: Record<
      string,
      {
        name: string;
        category: string;
        totalQty: number;
        customizationsTally: Record<string, number>;
        notesList: string[];
      }
    > = {};

    batchOrders.forEach((order) => {
      order.items.forEach((item) => {
        const id = item.menuItem.id;
        if (!tally[id]) {
          tally[id] = {
            name: item.menuItem.name,
            category: item.menuItem.category,
            totalQty: 0,
            customizationsTally: {},
            notesList: [],
          };
        }
        tally[id].totalQty += item.quantity;

        // Group customization labels
        item.selectedCustomizations.forEach((c) => {
          const key = c.selectedLabel;
          tally[id].customizationsTally[key] =
            (tally[id].customizationsTally[key] || 0) + item.quantity;
        });

        if (item.notes) {
          tally[id].notesList.push(`"${item.notes}" (x${item.quantity})`);
        }
      });
    });

    return tally;
  }, [batchOrders]);

  // Filtered kitchen tally by category / station
  const filteredTally = useMemo(() => {
    return Object.entries(kitchenTally).filter(([_, info]) => {
      if (stationFilter === 'all') return true;
      return info.category === stationFilter;
    });
  }, [kitchenTally, stationFilter]);

  // Batch cooking progress
  const totalTallyItems = Object.keys(kitchenTally).length;
  const completedTallyItems = Object.keys(kitchenTally).filter((id) => checkedItems[id]).length;
  const cookingProgressPercent =
    totalTallyItems > 0 ? Math.round((completedTallyItems / totalTallyItems) * 100) : 0;

  const toggleCheck = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleMarkAllDone = () => {
    const newChecked: Record<string, boolean> = {};
    Object.keys(kitchenTally).forEach((id) => {
      newChecked[id] = true;
    });
    setCheckedItems(newChecked);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const handlePrintKitchenSheet = () => {
    window.print();
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const newItem: MenuItem = {
      id: `menu-custom-${Date.now()}`,
      name: newMenuName.trim(),
      category: newMenuCategory,
      price: Number(newMenuPrice),
      description: newMenuDesc.trim(),
      image:
        newMenuImage.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80',
      poBatchDates: [...availableDates],
      cutoffHour: '20:00',
      maxQuota: Number(newMenuQuota),
      bookedQuota: 0,
      prepTimeText: 'PO Fresh H-1',
      isAvailable: true,
    };

    onAddNewMenuItem(newItem);
    setShowAddMenuModal(false);
    setNewMenuName('');
    setNewMenuDesc('');
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingMenuItem(item);
    setEditMenuName(item.name);
    setEditMenuCategory(item.category);
    setEditMenuPrice(item.price);
    setEditMenuDesc(item.description);
    setEditMenuQuota(item.maxQuota);
    setEditMenuPrepTime(item.prepTimeText || 'PO Fresh H-1');
    setEditMenuImage(item.image);
  };

  const handleSaveEditMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem || !onUpdateMenuItem) return;
    if (!editMenuName.trim()) return;

    const updated: MenuItem = {
      ...editingMenuItem,
      name: editMenuName.trim(),
      category: editMenuCategory,
      price: Number(editMenuPrice),
      description: editMenuDesc.trim(),
      maxQuota: Number(editMenuQuota),
      prepTimeText: editMenuPrepTime.trim() || editingMenuItem.prepTimeText,
      image: editMenuImage.trim() || editingMenuItem.image,
    };

    onUpdateMenuItem(updated);
    setEditingMenuItem(null);
  };

  // Orders list filtered
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        orderFilterStatus === 'all' || order.orderStatus === orderFilterStatus;
      const matchesDate =
        orderDateFilter === 'all' || order.poDate === orderDateFilter;
      const q = orderSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q);
      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [orders, orderFilterStatus, orderDateFilter, orderSearch]);

  // Counts for order tabs
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'menunggu_konfirmasi').length;
  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'dibatalkan' && o.orderStatus !== 'selesai').length;

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        menuCategoryFilter === 'all' || item.category === menuCategoryFilter;
      const q = menuSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, menuCategoryFilter, menuSearch]);

  const selectedSchedule = batchSchedules.find((s) => s.date === selectedBatchDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ATELIER KITCHEN COMMAND HEADER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 text-amber-100 flex items-center justify-center shadow-md shadow-amber-900/15 shrink-0 border border-amber-700/40">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight">
                  Atelier Kitchen Station
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Production Mode
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>{storeProfile.name}</span>
                <span className="text-stone-300">•</span>
                {currentUser ? (
                  <span>
                    Masuk: <strong className="text-stone-800 font-semibold">{currentUser.name}</strong> ({currentUser.title || 'Head Chef & Baker'})
                  </span>
                ) : (
                  <span>Manajemen Rekapitulasi Bahan, Oven & Antrean PO</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Account Switcher Button */}
          {onSwitchAccount && (
            <button
              onClick={onSwitchAccount}
              className="self-start md:self-auto px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Ganti Akun / Profil</span>
            </button>
          )}
        </div>

        {/* KITCHEN OPERATIONAL METRIC TICKER */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-500 font-medium block">Batch PO Terpilih</span>
            <div className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="truncate">{formatDateIndo(selectedBatchDate)}</span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {selectedSchedule?.label || 'Baking Session'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-500 font-medium block">Pesanan Dalam Antrean</span>
            <div className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{batchOrders.length} Order Aktif</span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {pendingOrdersCount > 0 ? (
                <strong className="text-amber-700 font-bold">{pendingOrdersCount} menunggu konfirmasi</strong>
              ) : (
                'Semua pesanan terverifikasi'
              )}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-500 font-medium block">Total Porsi Wajib Panggang</span>
            <div className="text-sm sm:text-base font-extrabold text-amber-900 mt-0.5 flex items-center gap-1.5 font-serif">
              <Flame className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                {Object.values(kitchenTally).reduce((sum, item) => sum + item.totalQty, 0)} Porsi
              </span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              Dari {totalTallyItems} varian menu pesanan
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium">
              <span>Progres Oven & Dapur</span>
              <span className="font-bold text-stone-800">{cookingProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-200 mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${cookingProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {completedTallyItems} dari {totalTallyItems} item selesai
            </span>
          </div>
        </div>

        {/* NAVIGATION SEGMENT CONTROL TABS */}
        <div className="pt-2">
          <div className="bg-stone-100/90 p-1.5 rounded-2xl flex items-center gap-1.5 border border-stone-200/90 overflow-x-auto text-xs font-bold no-scrollbar">
            <button
              type="button"
              id="kitchen-tab-rekap"
              onClick={() => setActiveTab('rekap')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'rekap'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Rekap Oven & Dapur</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === 'rekap'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {Object.values(kitchenTally).reduce((sum, item) => sum + item.totalQty, 0)} Porsi
              </span>
            </button>

            <button
              type="button"
              id="kitchen-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Pesanan Masuk</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === 'orders'
                    ? 'bg-white/20 text-white'
                    : pendingOrdersCount > 0
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              id="kitchen-tab-menu"
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Katalog Menu PO</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === 'menu'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {menuItems.length}
              </span>
            </button>

            <button
              type="button"
              id="kitchen-tab-dates"
              onClick={() => setActiveTab('dates')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'dates'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Kelola Tanggal PO</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === 'dates'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {batchSchedules.filter((s) => s.isActive).length} Open
              </span>
            </button>

            {onOpenAffiliate && (
              <button
                type="button"
                id="kitchen-tab-affiliate"
                onClick={onOpenAffiliate}
                className="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                title="Buka Manajemen Titik Kumpul PIC & Komisi Affiliate"
              >
                <Users className="w-4 h-4 text-amber-700" />
                <span>Affiliate & Titik Kumpul</span>
              </button>
            )}

            {onOpenQRScanner && (
              <button
                type="button"
                id="kitchen-tab-scan-qr"
                onClick={onOpenQRScanner}
                className="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-xs active:scale-95"
                title="Buka Kamera untuk Scan QR Verifikasi Serah Terima Pesanan"
              >
                <ScanLine className="w-4 h-4 text-stone-950" />
                <span>Scan QR Pengambilan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: REKAP PRODUKSI DAPUR (BATCH COOKING SHEET) */}
      {activeTab === 'rekap' && (
        <div className="space-y-6">
          {/* Controls Bar: Batch Switcher, Print Sheet, Bulk Check */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-800" />
                <span>Pilih Batch Tanggal:</span>
              </label>
              <select
                id="select-batch-date-control"
                value={selectedBatchDate}
                onChange={(e) => setSelectedBatchDate(e.target.value)}
                className="text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 bg-amber-50/60 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-600/30 cursor-pointer"
              >
                {availableDates.map((dateStr) => {
                  const schedule = batchSchedules.find((s) => s.date === dateStr);
                  const orderCount = orders.filter((o) => o.poDate === dateStr && o.orderStatus !== 'dibatalkan').length;
                  return (
                    <option key={dateStr} value={dateStr}>
                      {formatDateIndo(dateStr)} ({orderCount} Order) {schedule?.label ? `— ${schedule.label}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Print & Checklist Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllDone}
                className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Tandai semua resep batch telah selesai dimasak"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Centang Semua</span>
              </button>

              <button
                type="button"
                onClick={handleResetChecklist}
                className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset status centang"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                id="print-kitchen-sheet-btn"
                onClick={handlePrintKitchenSheet}
                className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-200" />
                <span>Cetak Lembar Dapur (Baking Sheet)</span>
              </button>
            </div>
          </div>

          {/* Cooking Sheet Layout: Left Executive Summary, Right Interactive Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Executive Batch Summary Briefing */}
            <div className="bg-[#241c19] text-stone-100 rounded-3xl p-6 space-y-4 shadow-md border border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-extrabold">
                  Briefing Operasional Batch
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {selectedSchedule?.cutoffHour ? `Cutoff ${selectedSchedule.cutoffHour} WIB` : 'H-1 Fresh Bake'}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black font-serif text-white">
                  {formatDateIndo(selectedBatchDate)}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {selectedSchedule?.label || 'Sesi Pemanggangan Spesial'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-xs text-stone-300">Total Pesanan Masuk</span>
                  <span className="text-base font-black text-white">{batchOrders.length} Order</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-xs text-stone-300">Total Dessert & Minuman</span>
                  <span className="text-lg font-black text-amber-400 font-serif">
                    {Object.values(kitchenTally).reduce((sum, item) => sum + item.totalQty, 0)} Porsi
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-xs text-stone-300">Estimasi Omzet Batch</span>
                  <span className="text-base font-black text-emerald-400">
                    {formatRupiah(batchOrders.reduce((sum, o) => sum + o.total, 0))}
                  </span>
                </div>
              </div>

              {/* Quality & Prep SOP Callout */}
              <div className="p-3.5 rounded-2xl bg-amber-950/60 text-xs text-amber-200 border border-amber-800/60 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>SOP Pemanasan Oven & Suhu</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Preheat convection oven ke 220°C untuk Basque Cheesecake agar permukaan karamel sempurna. Pastikan butter AOP pada suhu ruang 20°C sebelum creaming.
                </p>
              </div>

              {selectedSchedule?.notes && (
                <div className="p-3 rounded-xl bg-white/5 text-xs text-stone-300 border border-white/10">
                  <span className="text-amber-400 font-bold block text-[11px]">Catatan Khusus Batch:</span>
                  <p className="text-[11px] mt-0.5 italic">{selectedSchedule.notes}</p>
                </div>
              )}
            </div>

            {/* Right: Detailed Recipe Checklist per Kitchen Station */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-800" />
                    <span>Daftar Menu Yang Wajib Dipanggang & Disiapkan</span>
                  </h3>
                  <span className="text-xs text-stone-500">
                    Klik kartu untuk mencentang menu yang sudah matang dan siap dikemas
                  </span>
                </div>

                {/* Filter Stasiun Dapur */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-stone-400 text-[11px] font-medium hidden sm:inline">Stasiun:</span>
                  <select
                    value={stationFilter}
                    onChange={(e) => setStationFilter(e.target.value)}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="all">Semua Menu</option>
                    <option value="cheesecake">Artisan Cheesecake</option>
                    <option value="cookies">Gourmet Cookies</option>
                    <option value="dessert_box">Dessert Box</option>
                    <option value="hampers">Hampers</option>
                    <option value="minuman">Minuman</option>
                  </select>
                </div>
              </div>

              {filteredTally.length === 0 ? (
                <div className="text-center py-14 text-stone-400 space-y-2.5">
                  <Package className="w-12 h-12 mx-auto text-stone-300" />
                  <p className="font-bold text-stone-700 text-sm">Tidak Ada Item Dalam Stasiun Ini</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {totalTallyItems === 0
                      ? 'Belum ada pesanan terverifikasi untuk batch tanggal ini. Pelanggan masih dapat memesan melalui katalog.'
                      : 'Semua pesanan di batch ini ada di stasiun/kategori yang lain.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTally.map(([id, info]) => {
                    const isDone = !!checkedItems[id];
                    return (
                      <div
                        key={id}
                        id={`kitchen-tally-item-${id}`}
                        onClick={() => toggleCheck(id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none ${
                          isDone
                            ? 'bg-emerald-50/50 border-emerald-200/80 opacity-60'
                            : 'bg-white border-stone-200 hover:border-amber-400 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <button
                            type="button"
                            className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-stone-300 bg-white hover:border-amber-500 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-black text-sm sm:text-base ${
                                  isDone ? 'line-through text-stone-500' : 'text-stone-900'
                                }`}
                              >
                                {info.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                                {info.category}
                              </span>
                              {isDone && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Selesai Dimasak
                                </span>
                              )}
                            </div>

                            {/* Customization & Toppings Breakdown Chips */}
                            {info.customizationsTally && Object.keys(info.customizationsTally).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {Object.entries(info.customizationsTally).map(([label, count]) => (
                                  <span
                                    key={label}
                                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950"
                                  >
                                    {label}: <strong className="text-amber-800 font-extrabold">{count}x</strong>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Customer Notes / Allergy alert */}
                            {info.notesList.length > 0 && (
                              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Catatan Pemesan:</strong> {info.notesList.join('; ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Portion Counter Badge */}
                        <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                          <span className="text-[11px] text-stone-500 font-medium">Wajib Sedia / Panggang:</span>
                          <span className="text-lg sm:text-2xl font-black text-amber-900 font-serif">
                            {info.totalQty} Porsi
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN PESANAN MASUK (ORDERS PIPELINE) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID order, nama, atau no WA..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-2xl border border-stone-200 w-full focus:outline-none focus:ring-2 focus:ring-amber-600/30 font-medium bg-stone-50/50"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Date Selector Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-stone-500 font-medium shrink-0">Batch PO:</span>
                <select
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-700 cursor-pointer"
                >
                  <option value="all">Semua Tanggal Batch ({orders.length})</option>
                  {availableDates.map((d) => (
                    <option key={d} value={d}>
                      {formatDateIndo(d)} ({orders.filter((o) => o.poDate === d).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Filter Pills Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs font-bold">
              <button
                type="button"
                onClick={() => setOrderFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  orderFilterStatus === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Semua ({orders.length})
              </button>

              <button
                type="button"
                onClick={() => setOrderFilterStatus('menunggu_konfirmasi')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === 'menunggu_konfirmasi'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Menunggu Konfirmasi</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {orders.filter((o) => o.orderStatus === 'menunggu_konfirmasi').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderFilterStatus('dikonfirmasi')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === 'dikonfirmasi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <span>Dikonfirmasi</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {orders.filter((o) => o.orderStatus === 'dikonfirmasi').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderFilterStatus('diproses_dapur')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === 'diproses_dapur'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
                }`}
              >
                <span>Sedang Dimasak</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {orders.filter((o) => o.orderStatus === 'diproses_dapur').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderFilterStatus('siap')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === 'siap'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>Siap Kirim / Ambil</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {orders.filter((o) => o.orderStatus === 'siap').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderFilterStatus('selesai')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === 'selesai'
                    ? 'bg-stone-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>Selesai</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {orders.filter((o) => o.orderStatus === 'selesai').length}
                </span>
              </button>

              <button
                type="button"
                id="filter-order-dibatalkan"
                onClick={() => setOrderFilterStatus('dibatalkan')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === 'dibatalkan'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <span>Dibatalkan</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {orders.filter((o) => o.orderStatus === 'dibatalkan').length}
                </span>
              </button>
            </div>
          </div>

          {/* Orders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="font-extrabold text-stone-800 text-base">Tidak Ada Pesanan Yang Sesuai</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Coba ganti filter status, filter tanggal batch, atau kata kunci pencarian.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusDetails = getStatusDetails(order.orderStatus);
                const customerWaUrl = getWhatsAppLink(
                  order.customerPhone,
                  `Halo Kak ${order.customerName}, kami dari tim dapur *${storeProfile.name}* ingin mengabarkan status pesanan PO #${order.id} Anda: *${statusDetails.label}*. Terima kasih telah mempercayakan sajian dessert Anda kepada kami! 🍰`
                );

                return (
                  <div
                    key={order.id}
                    id={`order-kitchen-card-${order.id}`}
                    className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-stone-300 transition-all"
                  >
                    <div className="space-y-3.5">
                      {/* Order Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900 text-sm sm:text-base">
                              #{order.id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusDetails.badgeClass}`}
                            >
                              {statusDetails.label}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="font-medium text-stone-700">
                              {formatDateIndo(order.poDate)} • Slot {order.poSlot}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onViewOrderReceipt(order)}
                          className="px-2.5 py-1 rounded-lg text-xs text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>
                      </div>

                      {/* Customer Info & Direct WhatsApp CTA */}
                      <div className="flex items-center justify-between text-xs bg-stone-50/80 p-3 rounded-2xl border border-stone-200/70">
                        <div>
                          <span className="font-bold text-stone-900 text-sm block">
                            {order.customerName}
                          </span>
                          <span className="text-stone-500 text-[11px] font-mono">{order.customerPhone}</span>
                        </div>

                        <a
                          href={customerWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat WA</span>
                        </a>
                      </div>

                      {/* Fulfillment Method & Address / Pickup Notes */}
                      <div className="text-xs text-stone-600 bg-stone-50/60 p-3 rounded-2xl border border-stone-200/70 space-y-1">
                        <div className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-800" />
                          <span>
                            {order.orderType === 'delivery'
                              ? 'Diantar ke Alamat Pelanggan'
                              : order.pickupLocationType === 'titik_kumpul_affiliate'
                              ? `Titik Kumpul PIC: ${order.affiliateCode}`
                              : 'Ambil Sendiri di Atelier / Dapur'}
                          </span>
                        </div>
                        {order.affiliatePickupLocation && (
                          <p className="text-[11px] text-amber-900 font-medium leading-relaxed bg-amber-50 p-2 rounded-xl border border-amber-200">
                            <strong>Drop Point:</strong> {order.affiliatePickupLocation}
                            {order.affiliateName && <span className="block text-[10px] text-stone-600">PIC: {order.affiliateName}</span>}
                            {order.affiliateCommission !== undefined && (
                              <span className="block text-[10px] text-emerald-700 font-bold">Komisi PIC: {formatRupiah(order.affiliateCommission)}</span>
                            )}
                          </p>
                        )}
                        {order.deliveryAddress && (
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            <strong className="text-stone-700">Alamat:</strong> {order.deliveryAddress}
                          </p>
                        )}
                        {order.deliveryNotes && (
                          <p className="text-[11px] text-stone-500 italic">
                            Patokan: {order.deliveryNotes}
                          </p>
                        )}
                      </div>

                      {/* Items Ordered List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">
                          Menu Yang Dipesan:
                        </span>
                        <div className="space-y-1">
                          {order.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="text-xs flex justify-between items-start py-1 border-b border-stone-50 last:border-0"
                            >
                              <div>
                                <span className="font-semibold text-stone-800">
                                  {it.menuItem.name}{' '}
                                  <strong className="text-amber-800 font-extrabold">x{it.quantity}</strong>
                                </span>
                                {it.selectedCustomizations.length > 0 && (
                                  <div className="text-[10px] text-stone-500">
                                    {it.selectedCustomizations.map((c) => c.selectedLabel).join(', ')}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-stone-800 shrink-0 font-mono">
                                {formatRupiah(it.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer & Interactive Pipeline Workflow Stepper */}
                    <div className="border-t border-stone-100 pt-3.5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">Total Nilai Pesanan:</span>
                        <span className="text-base font-black text-amber-950 font-serif">
                          {formatRupiah(order.total)}
                        </span>
                      </div>

                      {/* Interactive Step-by-Step Workflow Pipeline & Cancellation */}
                      {order.orderStatus === 'dibatalkan' ? (
                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <div>
                              <span className="font-extrabold text-rose-900 block">
                                Pesanan Telah Dibatalkan
                              </span>
                              <span className="text-[11px] text-rose-700">
                                Kuota ({order.items.reduce((s, it) => s + it.quantity, 0)} porsi) otomatis dikembalikan ke katalog.
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);
                              if (
                                window.confirm(
                                  `Aktifkan kembali pesanan #${order.id}? Kuota menu sebanyak ${totalQty} porsi akan kembali dipotong dari katalog.`
                                )
                              ) {
                                onUpdateOrderStatus(order.id, 'dikonfirmasi');
                              }
                            }}
                            className="py-1 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-2xs self-start sm:self-center"
                          >
                            Aktifkan Kembali
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Alur Status Dapur:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);
                                if (
                                  window.confirm(
                                    `Yakin ingin membatalkan pesanan #${order.id} milik ${order.customerName}?\n\nSemua kuota menu terpakai (${totalQty} porsi) akan OTOMATIS dikembalikan ke kuota slot PO agar bisa dipesan kembali oleh pelanggan lain.`
                                  )
                                ) {
                                  onUpdateOrderStatus(order.id, 'dibatalkan');
                                }
                              }}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Batalkan pesanan dan otomatis kembalikan kuota ke katalog PO"
                            >
                              <XCircle className="w-3 h-3 text-rose-500" />
                              <span>Batalkan (Kembalikan Kuota)</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'dikonfirmasi')}
                              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                                order.orderStatus === 'dikonfirmasi'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                              title="Konfirmasi pembayaran dan kunci slot PO"
                            >
                              1. Kunci Slot
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'diproses_dapur')}
                              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                                order.orderStatus === 'diproses_dapur'
                                  ? 'bg-orange-600 text-white shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                              title="Mulai memanggang di oven atau meracik pesanan"
                            >
                              2. Masak
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'siap')}
                              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                                order.orderStatus === 'siap'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                              title="Pesanan selesai dikemas dan siap dikirim atau diambil"
                            >
                              3. Siap Kirim
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'selesai')}
                              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                                order.orderStatus === 'selesai'
                                  ? 'bg-stone-800 text-white shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                              title="Pesanan telah diterima oleh pemesan"
                            >
                              4. Selesai
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA MENU & KUOTA PO */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base sm:text-lg font-serif">
                  Katalog & Kapasitas Kuota Menu PO
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Atur ketersediaan (Open PO/Closed), ubah batas kapasitas slot oven, dan kelola harga menu.
                </p>
              </div>

              <button
                type="button"
                id="add-new-menu-item-btn"
                onClick={() => setShowAddMenuModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu PO Baru</span>
              </button>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    menuCategoryFilter === 'all'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Semua ({menuItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter('cookies')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    menuCategoryFilter === 'cookies'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Cookies
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter('cheesecake')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    menuCategoryFilter === 'cheesecake'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Cheesecake
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter('dessert_box')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    menuCategoryFilter === 'dessert_box'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Dessert Box
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter('hampers')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    menuCategoryFilter === 'hampers'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Hampers
                </button>
                <button
                  type="button"
                  onClick={() => setMenuCategoryFilter('minuman')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    menuCategoryFilter === 'minuman'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Minuman
                </button>
              </div>

              {/* Menu Search Input */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari menu PO..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-700 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Menu Items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => {
              const remaining = Math.max(0, item.maxQuota - item.bookedQuota);
              const quotaPercent = Math.min(100, Math.round((item.bookedQuota / item.maxQuota) * 100));

              return (
                <div
                  key={item.id}
                  id={`kitchen-menu-card-${item.id}`}
                  className="bg-white rounded-3xl border border-stone-200 p-4 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-stone-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-18 h-18 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-100 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm line-clamp-1 mt-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-stone-900">
                            {formatRupiah(item.price)}
                          </span>
                          <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{item.rating?.toFixed(1) || '5.0'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quota Progress & Stepper Controls */}
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Kapasitas Slot PO:</span>
                        <span className="font-extrabold text-stone-900">{item.maxQuota} Slot</span>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            remaining === 0
                              ? 'bg-rose-500'
                              : remaining <= 5
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-stone-500">Terpesan: <strong>{item.bookedQuota}</strong></span>
                        <span className={`font-bold ${remaining === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          Sisa: {remaining} Slot {remaining === 0 ? '(Penuh)' : ''}
                        </span>
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-200/60">
                        <span className="text-[11px] text-stone-500">Ubah Kuota Cepat:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateMenuQuota(item.id, Math.max(item.bookedQuota, item.maxQuota - 5))}
                            className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-800 text-[11px] font-bold cursor-pointer transition-colors"
                            title="Kurangi kuota 5 slot"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateMenuQuota(item.id, Math.max(item.bookedQuota, item.maxQuota - 1))}
                            className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-800 text-[11px] font-bold cursor-pointer transition-colors"
                            title="Kurangi kuota 1 slot"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateMenuQuota(item.id, item.maxQuota + 1)}
                            className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-800 text-[11px] font-bold cursor-pointer transition-colors"
                            title="Tambah kuota 1 slot"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateMenuQuota(item.id, item.maxQuota + 5)}
                            className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-800 text-[11px] font-bold cursor-pointer transition-colors"
                            title="Tambah kuota 5 slot"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Toggle availability & Edit/Delete */}
                  <div className="border-t border-stone-100 pt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`toggle-availability-${item.id}`}
                        onClick={() => onToggleMenuAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        {item.isAvailable ? '✅ Open PO' : '🔒 Closed'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`edit-menu-btn-${item.id}`}
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 px-2.5 rounded-xl text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title={`Edit detail ${item.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-800" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        id={`delete-menu-btn-${item.id}`}
                        onClick={() => setDeletingMenuItem(item)}
                        className="p-1.5 px-2.5 rounded-xl text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title={`Hapus ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA TANGGAL PRE-ORDER */}
      {activeTab === 'dates' && (
        <ManagePODates
          batchSchedules={batchSchedules}
          orders={orders}
          onAddBatchSchedule={onAddBatchSchedule}
          onUpdateBatchSchedule={onUpdateBatchSchedule}
          onToggleBatchSchedule={onToggleBatchSchedule}
          onDeleteBatchSchedule={onDeleteBatchSchedule}
          onSelectBatchDate={(d) => {
            setSelectedBatchDate(d);
            setActiveTab('rekap');
          }}
        />
      )}

      {/* MODAL: DELETE MENU CONFIRMATION */}
      {deletingMenuItem && (
        <div
          id="delete-menu-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            id="delete-menu-modal"
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200 animate-scaleUp"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-900 text-base leading-tight">
                  Hapus Menu dari Katalog?
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Menu ini akan dihapus permanen dari daftar katalog pemesanan PO pelanggan.
                </p>
              </div>
            </div>

            {/* Target item preview */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
              <img
                src={deletingMenuItem.image}
                alt={deletingMenuItem.name}
                className="w-12 h-12 rounded-xl object-cover bg-stone-200 shrink-0 border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-extrabold text-amber-800">
                  {deletingMenuItem.category}
                </span>
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {deletingMenuItem.name}
                </h4>
                <span className="text-xs font-black text-stone-700">
                  {formatRupiah(deletingMenuItem.price)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Catatan: Riwayat pesanan dapur yang telah selesai atau sedang diproses tetap tercatat aman di sistem.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                id="cancel-delete-menu-btn"
                onClick={() => setDeletingMenuItem(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="confirm-delete-menu-btn"
                onClick={() => {
                  if (onDeleteMenuItem && deletingMenuItem) {
                    onDeleteMenuItem(deletingMenuItem.id);
                  }
                  setDeletingMenuItem(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Ya, Hapus Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MENU */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base font-serif">Tambah Menu PO Baru</h3>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-3.5 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block font-bold text-stone-700">Nama Menu PO</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lotus Biscoff Basque Cheesecake"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-700">Kategori</label>
                  <select
                    value={newMenuCategory}
                    onChange={(e) => setNewMenuCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="cookies">Gourmet Cookies</option>
                    <option value="cheesecake">Artisan Cheesecake</option>
                    <option value="dessert_box">Dessert Box</option>
                    <option value="hampers">Hampers</option>
                    <option value="minuman">Minuman Pendamping</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-stone-700">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={newMenuPrice}
                    onChange={(e) => setNewMenuPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-700">Kuota Maksimal Slot PO</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newMenuQuota}
                  onChange={(e) => setNewMenuQuota(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-medium"
                />
              </div>

              {/* Upload Image Menu Field */}
              <ImageUploadField
                value={newMenuImage}
                onChange={setNewMenuImage}
                label="Foto / Gambar Menu PO"
                idPrefix="new-menu-img"
              />

              <div className="space-y-1">
                <label className="block font-bold text-stone-700">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="Keterangan bahan baku segar, porsi, dan cita rasa..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold cursor-pointer transition-all shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MENU */}
      {editingMenuItem && (
        <div
          id="edit-menu-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            id="edit-menu-modal"
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base leading-tight font-serif">
                    Edit Informasi Menu PO
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    ID Menu: <code className="text-amber-800 font-semibold">{editingMenuItem.id}</code>
                  </span>
                </div>
              </div>
              <button
                type="button"
                id="close-edit-menu-modal-btn"
                onClick={() => setEditingMenuItem(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Preserved Reviews & Rating Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-2.5 text-xs text-emerald-950">
              <div className="w-7 h-7 rounded-xl bg-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-900">
                    Ulasan & Rating Tetap Aman
                  </span>
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.2 rounded-md text-[10px] border border-amber-300">
                    ⭐ {editingMenuItem.rating?.toFixed(1) || '5.0'} ({editingMenuItem.ratingCount ?? 0} ulasan)
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Menulis ulang nama, harga, atau foto tidak akan menghapus riwayat ulasan pelanggan.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditMenuItem} className="space-y-3.5 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block font-bold text-stone-700">
                  Nama Menu PO <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="edit-menu-name-input"
                  value={editMenuName}
                  onChange={(e) => setEditMenuName(e.target.value)}
                  placeholder="Contoh: Basque Burnt Cheesecake"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-700">
                    Harga Satuan (Rp) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    id="edit-menu-price-input"
                    min={1000}
                    step={500}
                    value={editMenuPrice}
                    onChange={(e) => setEditMenuPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-stone-900 font-bold"
                  />
                  <span className="text-[11px] text-stone-500">
                    Format: {formatRupiah(editMenuPrice || 0)}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-stone-700">Kategori</label>
                  <select
                    id="edit-menu-category-select"
                    value={editMenuCategory}
                    onChange={(e) => setEditMenuCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-stone-900 font-medium"
                  >
                    <option value="cookies">Gourmet Cookies</option>
                    <option value="cheesecake">Artisan Cheesecake</option>
                    <option value="dessert_box">Dessert Box</option>
                    <option value="hampers">Hampers</option>
                    <option value="minuman">Minuman Pendamping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-700">
                    Kapasitas Kuota Slot PO
                  </label>
                  <input
                    type="number"
                    required
                    id="edit-menu-quota-input"
                    min={editingMenuItem.bookedQuota || 1}
                    value={editMenuQuota}
                    onChange={(e) => setEditMenuQuota(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-stone-900"
                  />
                  <span className="text-[11px] text-stone-500">
                    Minimal {editingMenuItem.bookedQuota} (sudah terpesan)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-stone-700">
                    Estimasi / Catatan PO
                  </label>
                  <input
                    type="text"
                    id="edit-menu-prep-input"
                    value={editMenuPrepTime}
                    onChange={(e) => setEditMenuPrepTime(e.target.value)}
                    placeholder="Contoh: PO Fresh H-1, Dimasak Pagi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-stone-900"
                  />
                </div>
              </div>

              <ImageUploadField
                value={editMenuImage || editingMenuItem.image}
                onChange={setEditMenuImage}
                label="Foto / Gambar Menu PO"
                idPrefix="edit-menu-img"
              />

              <div className="space-y-1">
                <label className="block font-bold text-stone-700">
                  Deskripsi Menu <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  id="edit-menu-desc-textarea"
                  value={editMenuDesc}
                  onChange={(e) => setEditMenuDesc(e.target.value)}
                  placeholder="Keterangan bahan baku segar, resep otentik, dan saran penyajian..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-stone-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="cancel-edit-menu-btn"
                  onClick={() => setEditingMenuItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="save-edit-menu-btn"
                  className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-md shadow-amber-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-200" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

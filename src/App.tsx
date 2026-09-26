import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Cookie,
  ArrowRight,
  Phone,
  MapPin,
  Heart,
  CheckCircle2,
  Calendar,
  X,
  ChefHat,
  ReceiptText,
} from 'lucide-react';
import {
  AuthUser,
  CartCustomization,
  CartItem,
  MenuItem,
  Order,
  OrderStatus,
  POBatchSchedule,
  StoreProfile,
  UserRole,
} from './types';
import {
  initialBatchSchedules,
  initialMenuItems,
  initialOrders,
  initialStoreProfile,
} from './data/initialData';
import { formatRupiah, formatDateIndo, getStatusDetails } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PreorderStatusCard } from './components/PreorderStatusCard';
import { MenuCard } from './components/MenuCard';
import { BuildYourBoxSection } from './components/BuildYourBoxSection';
import { HowToOrderSection } from './components/HowToOrderSection';
import { FreshnessSection } from './components/FreshnessSection';
import { Footer } from './components/Footer';
import { ItemCustomizeModal } from './components/ItemCustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { KitchenDashboard } from './components/KitchenDashboard';
import { OrderQRScannerModal } from './components/OrderQRScannerModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';

const STORAGE_KEYS = {
  MENU: 'mooi_bites_menu_v3',
  ORDERS: 'mooi_bites_orders_v3',
  CART: 'mooi_bites_cart_v3',
  AUTH_USER: 'mooi_bites_auth_v3',
  BATCH_SCHEDULES: 'mooi_bites_schedules_v3',
};

export default function App() {
  const [storeProfile] = useState<StoreProfile>(initialStoreProfile);

  // Menu items initialized with Mooi Bites Cookie initialMenuItems
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      if (saved) {
        const parsed: MenuItem[] = JSON.parse(saved);
        // Ensure it contains Mooi Bites cookie items
        if (parsed.some((item) => item.id.startsWith('mooi-'))) {
          return parsed;
        }
      }
      return initialMenuItems;
    } catch {
      return initialMenuItems;
    }
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialOrders;
    } catch {
      return initialOrders;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Batch schedules
  const [batchSchedules, setBatchSchedules] = useState<POBatchSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BATCH_SCHEDULES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialBatchSchedules;
    } catch {
      return initialBatchSchedules;
    }
  });

  // User auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI States
  const [activeView, setActiveView] = useState<'catalog' | 'kitchen' | 'affiliate'>('catalog');
  const [kitchenActiveTab, setKitchenActiveTab] = useState<'rekap' | 'orders' | 'menu' | 'dates'>('orders');
  const [activeMobileTab, setActiveMobileTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [hasPremiumBoxInCart, setHasPremiumBoxInCart] = useState<boolean>(false);

  // Modals
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [trackingInitialOrder, setTrackingInitialOrder] = useState<string>('');
  const [trackingInitialPhone, setTrackingInitialPhone] = useState<string>('');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
    } catch (e) {
      console.error(e);
    }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BATCH_SCHEDULES, JSON.stringify(batchSchedules));
    } catch (e) {
      console.error(e);
    }
  }, [batchSchedules]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    customizations: CartCustomization[] = [],
    notes: string = '',
  ) => {
    const extraPrice = customizations.reduce((acc, c) => acc + c.extraPrice, 0);
    const itemPrice = item.price + extraPrice;
    const totalPrice = itemPrice * quantity;

    setCart((prev) => {
      // Check if same item & customization exists
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItem.id === item.id &&
          JSON.stringify(ci.selectedCustomizations) === JSON.stringify(customizations) &&
          ci.notes === notes,
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * itemPrice,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        menuItem: item,
        quantity,
        selectedCustomizations: customizations,
        notes,
        itemPrice,
        totalPrice,
      };

      return [...prev, newItem];
    });

    showToast(`Berhasil menambahkan ${quantity}x ${item.name} ke keranjang!`);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: newQty,
              totalPrice: item.itemPrice * newQty,
            }
          : item,
      ),
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item berhasil dihapus dari keranjang.');
  };

  // Add custom assortment box to cart
  const handleAddBoxToCart = (
    boxItems: { item: MenuItem; count: number }[],
    hasPremiumPackaging: boolean,
    totalPrice: number,
  ) => {
    boxItems.forEach(({ item, count }) => {
      if (count > 0) {
        handleAddToCart(item, count, [], 'Part of Custom Assortment Box');
      }
    });

    if (hasPremiumPackaging) {
      setHasPremiumBoxInCart(true);
    }

    setIsCartOpen(true);
    showToast('Custom Assortment Box berhasil dimasukkan ke keranjang!');
  };

  // Handle Order Created from Checkout
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update booked quota for items
    setMenuItems((prev) =>
      prev.map((m) => {
        const orderedItem = newOrder.items.find((it) => it.menuItem.id === m.id);
        if (orderedItem) {
          return {
            ...m,
            bookedQuota: Math.min(m.maxQuota, m.bookedQuota + orderedItem.quantity),
          };
        }
        return m;
      }),
    );

    // Clear cart
    setCart([]);
    setHasPremiumBoxInCart(false);
    showToast(`Pesanan ${newOrder.id} berhasil dibuat! Segera diproses dapur.`);
  };

  // Open Tracking for specific order
  const handleTrackOrder = (orderId: string, phone: string) => {
    setTrackingInitialOrder(orderId);
    setTrackingInitialPhone(phone);
    setIsTrackingOpen(true);
  };

  // Kitchen operations
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o)),
    );
    showToast(`Status pesanan ${orderId} diperbarui: ${getStatusDetails(newStatus).label}`);
  };

  const handleUpdateMenuQuota = (menuId: string, newMaxQuota: number) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, maxQuota: newMaxQuota } : m)),
    );
    showToast('Kapasitas kuota menu berhasil diperbarui');
  };

  const handleToggleMenuAvailability = (menuId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, isAvailable: !m.isAvailable } : m)),
    );
    showToast('Status ketersediaan PO diperbarui');
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === updatedItem.id ? updatedItem : m)),
    );
    showToast(`Menu "${updatedItem.name}" berhasil diperbarui!`);
  };

  const isKitchen = currentUser?.role === 'dapur' || currentUser?.role === 'admin';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const activeKitchenOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'selesai' && o.orderStatus !== 'dibatalkan',
  ).length;

  const scrollToSection = (id: string) => {
    if (activeView !== 'catalog') {
      setActiveView('catalog');
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F3E9DD] text-[#633F35] flex flex-col font-sans selection:bg-[#633F35] selection:text-[#FFF9F2]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#633F35] text-[#FFF9F2] text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-xl border border-[#E7D5C4] flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        storeProfile={storeProfile}
        cartCount={totalCartCount}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialOrder('');
          setIsTrackingOpen(true);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setActiveView('catalog');
          showToast('Berhasil logout.');
        }}
        totalKitchenOrdersCount={activeKitchenOrdersCount}
      />

      {/* MAIN VIEW: CATALOG / HOME */}
      {activeView === 'catalog' && (
        <main className="flex-1 pb-20 sm:pb-0">
          {/* Kitchen Staff Quick Return Banner if in catalog preview */}
          {isKitchen && (
            <div className="bg-[#633F35] text-[#FFF9F2] border-b border-[#8A5A4D] py-2 px-4 sticky top-16 z-30 shadow-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-bold">
                    Mode Pratinjau Toko (Admin Dapur Aktif)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('kitchen');
                    setKitchenActiveTab('orders');
                  }}
                  className="px-3 py-1 rounded-xl bg-[#FFF9F2] text-[#633F35] font-bold text-xs hover:bg-[#E7D5C4]"
                >
                  ← Buka Pengelola Pesanan ({activeKitchenOrdersCount})
                </button>
              </div>
            </div>
          )}

          {/* 1. HERO SECTION */}
          <HeroBanner
            onPreOrderClick={() => scrollToSection('our-cookies')}
          />

          {/* 2. PREORDER STATUS SECTION */}
          <PreorderStatusCard
            batchNumber="Batch #12"
            productionDate="21 April 2025"
            remainingSlots={42}
            totalSlots={100}
            onOrderClick={() => scrollToSection('our-cookies')}
          />

          {/* 3. PRODUCT SECTION: "Our Cookies" */}
          <section id="our-cookies" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF9F2] border border-[#E7D5C4] text-xs font-bold uppercase tracking-wider text-[#8A5A4D]">
                <Sparkles className="w-3.5 h-3.5 text-[#8A5A4D]" />
                <span>Small Batch Artisan</span>
              </div>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-[#633F35] tracking-tight">
                Our Cookies
              </h2>
              <p className="text-sm sm:text-base text-[#8A5A4D] font-medium">
                Handcrafted favorites, always fresh.
              </p>
            </div>

            {/* 4 Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={(itemToAdd, quantity) => handleAddToCart(itemToAdd, quantity)}
                  onViewDetails={(itemToView) => setCustomizingItem(itemToView)}
                />
              ))}
            </div>
          </section>

          {/* 4. BUILD YOUR BOX SECTION */}
          <BuildYourBoxSection
            menuItems={menuItems}
            onAddBoxToCart={handleAddBoxToCart}
          />

          {/* 5. HOW TO ORDER SECTION */}
          <HowToOrderSection />

          {/* 6. FRESHNESS SECTION */}
          <FreshnessSection />

          {/* 7. FOOTER */}
          <Footer
            onNavClick={(view) => {
              if (view === 'catalog') {
                scrollToSection('our-cookies');
              } else if (view === 'how-to-order') {
                scrollToSection('how-to-order');
              } else if (view === 'track-order') {
                setTrackingInitialOrder('');
                setIsTrackingOpen(true);
              } else if (view === 'contact') {
                window.open('https://wa.me/6285748829148', '_blank');
              }
            }}
            onKitchenAccessClick={() => {
              if (isKitchen) {
                setActiveView('kitchen');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        </main>
      )}

      {/* VIEW 2: KITCHEN DASHBOARD (ADMIN) */}
      {activeView === 'kitchen' && (
        <main className="flex-1 bg-[#F3E9DD] pb-24 sm:pb-8">
          <KitchenDashboard
            orders={orders}
            menuItems={menuItems}
            storeProfile={storeProfile}
            availableDates={['2025-04-21', '2025-04-24', '2025-04-27']}
            batchSchedules={batchSchedules}
            currentUser={currentUser}
            onSwitchAccount={() => setIsAuthModalOpen(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateMenuQuota={handleUpdateMenuQuota}
            onToggleMenuAvailability={handleToggleMenuAvailability}
            onAddNewMenuItem={(item) => {
              setMenuItems((prev) => [item, ...prev]);
              showToast(`Menu baru "${item.name}" berhasil ditambahkan.`);
            }}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={(id) => {
              setMenuItems((prev) => prev.filter((m) => m.id !== id));
              showToast('Menu berhasil dihapus dari daftar PO.');
            }}
            onViewOrderReceipt={(order) => setViewingReceiptOrder(order)}
            onAddBatchSchedule={(sched) => {
              setBatchSchedules((prev) => [...prev, sched]);
              showToast(`Batch ${sched.label || sched.date} ditambahkan.`);
            }}
            onUpdateBatchSchedule={(sched) => {
              setBatchSchedules((prev) =>
                prev.map((s) => (s.date === sched.date ? sched : s)),
              );
              showToast('Jadwal batch diperbarui.');
            }}
            onToggleBatchSchedule={(date) => {
              setBatchSchedules((prev) =>
                prev.map((s) => (s.date === date ? { ...s, isActive: !s.isActive } : s)),
              );
              showToast('Status batch diperbarui.');
            }}
            onDeleteBatchSchedule={(date) => {
              setBatchSchedules((prev) => prev.filter((s) => s.date !== date));
              showToast('Jadwal batch dihapus.');
            }}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
            controlledActiveTab={kitchenActiveTab}
            onActiveTabChange={setKitchenActiveTab}
          />
        </main>
      )}

      {/* Product Detail Modal */}
      {customizingItem && (
        <ItemCustomizeModal
          item={customizingItem}
          isOpen={!!customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
          isKitchenAdmin={isKitchen}
          onEditInKitchen={() => {
            setActiveView('kitchen');
            setKitchenActiveTab('menu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
          hasPremiumBox={hasPremiumBoxInCart}
          onTogglePremiumBox={() => setHasPremiumBoxInCart(!hasPremiumBoxInCart)}
        />
      )}

      {/* Checkout Modal (Multi-step with Preorder Date & Time & Confirmation) */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          storeProfile={storeProfile}
          hasPremiumBox={hasPremiumBoxInCart}
          onOrderCreated={handleOrderCreated}
          onTrackOrder={handleTrackOrder}
        />
      )}

      {/* Order Tracking Modal */}
      {isTrackingOpen && (
        <OrderTrackingModal
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
          orders={orders}
          initialOrderNumber={trackingInitialOrder}
          initialPhone={trackingInitialPhone}
        />
      )}

      {/* Order Receipt Modal (for viewing printable invoice) */}
      {viewingReceiptOrder && (
        <OrderReceiptModal
          order={viewingReceiptOrder}
          isOpen={!!viewingReceiptOrder}
          onClose={() => setViewingReceiptOrder(null)}
          storeProfile={storeProfile}
        />
      )}

      {/* QR Scanner Modal */}
      <OrderQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        orders={orders}
        onConfirmOrderPickup={(orderId) => {
          handleUpdateOrderStatus(orderId, 'selesai');
          setIsQRScannerOpen(false);
          showToast(`Pesanan ${orderId} berhasil diverifikasi & selesai diambil!`);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          if (user.role === 'dapur' || user.role === 'admin') {
            setActiveView('kitchen');
          }
          showToast(`Selamat datang, ${user.name}!`);
        }}
      />

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#633F35]/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in">
          <div className="bg-[#FFF9F2] rounded-3xl max-w-xl w-full p-5 border-2 border-[#E7D5C4] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-[#633F35]">
                Cari Varian Cookie
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3E9DD] flex items-center justify-center text-[#633F35]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A5A4D]" />
              <input
                type="text"
                autoFocus
                placeholder="Cari Classic OG, Double Choco, Brownies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#E7D5C4] bg-[#F3E9DD]/60 text-sm font-bold text-[#633F35] focus:outline-hidden focus:border-[#633F35]"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {menuItems
                .filter((m) =>
                  !searchQuery ||
                  m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.description.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setCustomizingItem(item);
                    }}
                    className="p-3 rounded-2xl bg-[#F3E9DD] hover:bg-[#E7D5C4] transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-display font-bold text-sm text-[#633F35]">
                          {item.name}
                        </h4>
                        <span className="text-xs text-[#8A5A4D] font-semibold">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8A5A4D]" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation on Mobile */}
      <MobileBottomNav
        activeTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
        cartCount={totalCartCount}
        totalCartPrice={totalCartPrice}
        currentUser={currentUser}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialOrder('');
          setIsTrackingOpen(true);
        }}
        onOpenMenu={() => {
          setActiveMobileTab('menu');
          scrollToSection('our-cookies');
        }}
        onOpenHome={() => {
          setActiveMobileTab('home');
          if (activeView !== 'catalog') setActiveView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </div>
  );
}

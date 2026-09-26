export type ProductCategory =
  | 'cheesecake'
  | 'cookies'
  | 'dessert_box'
  | 'minuman'
  | 'hampers'
  | 'camilan'
  | 'makanan'
  | 'paket';

export interface CustomizationOption {
  label: string;
  extraPrice: number;
}

export interface CustomizationGroup {
  name: string;
  required?: boolean;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  badge?: string; // e.g., 'Best Seller', 'Signature Recipe', 'Favorit PO'
  poBatchDates: string[]; // e.g. ['2026-09-18', '2026-09-19', '2026-09-20']
  cutoffHour: string; // e.g. "20:00"
  maxQuota: number;
  bookedQuota: number;
  prepTimeText: string; // e.g. "PO H-1 (Fresh Dimasak)"
  isAvailable: boolean;
  customizations?: CustomizationGroup[];
  rating?: number; // average rating e.g. 4.9
  ratingCount?: number; // number of customer reviews
}

export interface ItemReview {
  rating: number; // 1 to 5
  comment?: string;
  ratedAt: string; // ISO date
}

export interface CartCustomization {
  groupName: string;
  selectedLabel: string;
  extraPrice: number;
}

export interface CartItem {
  id: string; // unique item uuid in cart
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: CartCustomization[];
  notes: string;
  itemPrice: number; // base + extras
  totalPrice: number; // itemPrice * quantity
}

export type OrderType = 'pickup' | 'delivery';

export type PaymentMethod = 'qris' | 'bca' | 'mandiri' | 'gopay' | 'cod';

export type OrderStatus =
  | 'menunggu_konfirmasi'
  | 'dikonfirmasi'
  | 'diproses_dapur'
  | 'siap'
  | 'selesai'
  | 'dibatalkan';

export type PickupLocationType = 'dapur_utama' | 'titik_kumpul_affiliate';

export type AffiliateAccountStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface AffiliatePIC {
  id: string;
  code: string; // e.g. "AFF_ANI8421", "KAMPUS-UNESA"
  name: string; // PIC coordinator name
  email?: string;
  phone: string; // WhatsApp
  status: AffiliateAccountStatus;
  pickupLocationName: string; // e.g. "Titik Kumpul Kampus UNESA (Lidah Wetan)"
  pickupAddress: string; // detailed address
  pickupNotes?: string; // e.g. "Diambil di depan Lab Bahasa / Gedung Rektorat"
  commissionRatePercent: number; // e.g. 5%
  bankAccount: string; // e.g. "BCA 822-019-4821 a.n Rian Maulana"
  isActive: boolean; // true if status === 'active'
  tempPassword?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  registeredAt: string;
  createdBy?: string;
}

export interface AffiliateSettings {
  defaultCommissionRatePercent: number; // e.g. 5%
  customerDiscountPerPortion: number; // e.g. Rp2.000 diskon per porsi
  updatedAt?: string;
}

export interface Order {
  id: string; // e.g., "PO-2609-1082"
  createdAt: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  pickupLocationType?: PickupLocationType;
  affiliateCode?: string;
  affiliateName?: string;
  affiliatePickupLocation?: string;
  affiliateCommission?: number;
  affiliateCommissionStatus?: 'pending' | 'valid' | 'paid' | 'cancelled';
  affiliatePortionDiscount?: number; // Total customer discount from affiliate code
  deliveryAddress?: string;
  deliveryNotes?: string;
  poDate: string; // ISO date format YYYY-MM-DD
  poSlot: string; // e.g. "Sesi Siang (11:30 - 13:30)"
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'menunggu_pembayaran' | 'lunas';
  orderStatus: OrderStatus;
  adminNotes?: string;
  pickedUpAt?: string;
  pickedUpByStaff?: string;
  verifiedViaQR?: boolean;
  reviews?: Record<string, ItemReview>; // key: menuItem.id
}

export interface StoreProfile {
  name: string;
  tagline: string;
  whatsapp: string;
  address: string;
  operationalHours: string;
  qrisImageUrl?: string;
  bankAccounts: {
    bank: string;
    accountNumber: string;
    accountName: string;
  }[];
}

export type UserRole = 'admin' | 'dapur' | 'affiliate' | 'pelanggan';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  title?: string;
  affiliateCode?: string;
  affiliateId?: string;
  status?: AffiliateAccountStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
}

export interface LoyaltyHistoryEntry {
  id: string;
  date: string;
  orderId?: string;
  description: string;
  portions: number;
  stampsChange: number;
  type: 'earn' | 'redeem' | 'bonus';
}

export interface CustomerLoyaltyRecord {
  phone: string;
  name: string;
  totalEarnedStamps: number;
  usedStamps: number;
  availableStamps: number;
  claimedVouchersCount: number;
  history: LoyaltyHistoryEntry[];
}

export interface POBatchSchedule {
  date: string; // ISO date 'YYYY-MM-DD'
  label?: string; // Optional custom label, e.g. "Batch Spesial Akhir Pekan"
  cutoffHour: string; // e.g. "20:00"
  maxOrderSlots?: number; // Quota for total orders or special limit
  isActive: boolean; // open or paused/closed by admin
  notes?: string; // notes e.g. "Termasuk varian hampers & whole cake"
}

export interface VoucherReward {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'free_menu';
  freeMenuItemId?: string;
  freeMenuItemName?: string;
  claimedAt: string;
  isUsed: boolean;
  usedAt?: string;
  usedInOrderId?: string;
}

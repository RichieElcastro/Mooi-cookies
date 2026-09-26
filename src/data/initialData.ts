import { AffiliatePIC, AffiliateSettings, MenuItem, Order, POBatchSchedule, StoreProfile } from '../types';

export const initialStoreProfile: StoreProfile = {
  name: 'MOOI BITES COOKIE',
  tagline: 'A little bite, a lot of love',
  whatsapp: '085748829148',
  address: 'Jl. Darmo Permai Timur No. 18, Dukuh Pakis, Surabaya, Jawa Timur 60226',
  operationalHours: 'Preorder Batch Aktif • Freshly Baked Setiap Hari PO',
  qrisImageUrl: 'https://images.unsplash.com/photo-1595079672139-5470805056e7?w=500&auto=format&fit=crop&q=80',
  bankAccounts: [
    { bank: 'BCA', accountNumber: '8420-192-881', accountName: 'Mooi Bites Cookie' },
    { bank: 'Mandiri', accountNumber: '137-00-9821-445', accountName: 'Mooi Bites Cookie' },
    { bank: 'BRI', accountNumber: '0341-01-002891-50', accountName: 'Mooi Bites Cookie' },
  ],
};

export const initialMenuItems: MenuItem[] = [
  {
    id: 'mooi-classic-og',
    name: 'Classic OG',
    category: 'cookies',
    price: 28000,
    description: 'Cookies klasik renyah di luar, chewy dan lumer di tengah dengan taburan premium Belgian semi-sweet chocolate chips dan sentuhan Maldon sea salt flakes.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
    badge: 'Signature Best Seller',
    poBatchDates: ['2025-04-21', '2025-04-24', '2025-04-27'],
    cutoffHour: '21:00',
    maxQuota: 30,
    bookedQuota: 6, // 24 available out of 30
    prepTimeText: 'Freshly Baked Batch #12',
    isAvailable: true,
    rating: 4.9,
    ratingCount: 124,
    customizations: [
      {
        name: 'Suhu Penyajian',
        required: true,
        options: [
          { label: 'Fresh Room Temp (Siap Santap)', extraPrice: 0 },
          { label: 'Ekstra Maldon Sea Salt Flakes (Lebih Gurih)', extraPrice: 0 },
        ],
      },
      {
        name: 'Extra Dipping Sauce',
        required: false,
        options: [
          { label: 'Warm Dark Chocolate Dip (30ml)', extraPrice: 6000 },
          { label: 'Salted Caramel Butter Dip (30ml)', extraPrice: 6000 },
        ],
      },
    ],
  },
  {
    id: 'mooi-double-choco',
    name: 'Double Choco Chunk',
    category: 'cookies',
    price: 32000,
    description: 'Chunky cookies loaded with rich chocolate chunks, crisp edges and a soft chewy center. Dibuat dengan double dark chocolate dough yang super fudgy.',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    badge: 'Chocoholic Favorite',
    poBatchDates: ['2025-04-21', '2025-04-24', '2025-04-27'],
    cutoffHour: '21:00',
    maxQuota: 30,
    bookedQuota: 12, // 18 available out of 30
    prepTimeText: 'Rich Valrhona 70% Dark Chunks',
    isAvailable: true,
    rating: 5.0,
    ratingCount: 98,
    customizations: [
      {
        name: 'Kekayaan Cokelat',
        required: true,
        options: [
          { label: 'Double Choco Standard (Gooey Melt)', extraPrice: 0 },
          { label: 'Ekstra Dark Cocoa Drizzle', extraPrice: 4000 },
        ],
      },
    ],
  },
  {
    id: 'mooi-red-velvet',
    name: 'Red Velvet Cheesy',
    category: 'cookies',
    price: 34000,
    description: 'Cookies merah velvet cantik dengan isian lelehan Philadelphia cream cheese yang gurih creamy, berpadu manisnya Callebaut white chocolate chunks.',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
    badge: 'Most Loved Velvet',
    poBatchDates: ['2025-04-21', '2025-04-24', '2025-04-27'],
    cutoffHour: '21:00',
    maxQuota: 30,
    bookedQuota: 14, // 16 available out of 30
    prepTimeText: 'Lumer Cream Cheese Center',
    isAvailable: true,
    rating: 4.9,
    ratingCount: 86,
    customizations: [
      {
        name: 'Isian Cream Cheese',
        required: true,
        options: [
          { label: 'Original Cream Cheese Core', extraPrice: 0 },
          { label: 'Double Cream Cheese Swirl', extraPrice: 5000 },
        ],
      },
    ],
  },
  {
    id: 'mooi-brownies-cookie',
    name: 'Brownies Cookies',
    category: 'cookies',
    price: 36000,
    description: 'Perpaduan sempurna antara fudgy brownies dan chunky cookie. Kulit atas mengkilap crinkle renyah, dengan bagian dalam yang luar biasa pekat dan melted.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
    badge: 'Ultra Fudgy Crinkle',
    poBatchDates: ['2025-04-21', '2025-04-24', '2025-04-27'],
    cutoffHour: '21:00',
    maxQuota: 30,
    bookedQuota: 18, // 12 available out of 30
    prepTimeText: 'Fudgy Callebaut 72%',
    isAvailable: true,
    rating: 4.9,
    ratingCount: 112,
    customizations: [
      {
        name: 'Pilihan Tekstur',
        required: true,
        options: [
          { label: 'Gooey Fudgy (Lumer Meleleh)', extraPrice: 0 },
          { label: 'Chewy Dense (Padat Legit)', extraPrice: 0 },
        ],
      },
    ],
  },
];

export const initialBatchSchedules: POBatchSchedule[] = [
  {
    date: '2025-04-21',
    label: 'Preorder Batch #12 (Oven Spesial)',
    cutoffHour: '21:00',
    maxOrderSlots: 100,
    isActive: true,
    notes: 'Produksi 21 April 2025 • Tersedia pickup dan delivery kota Surabaya & sekitarnya',
  },
  {
    date: '2025-04-24',
    label: 'Preorder Batch #13 (Kamis Fresh)',
    cutoffHour: '21:00',
    maxOrderSlots: 100,
    isActive: true,
    notes: 'Produksi 24 April 2025 • Slot PO terbatas',
  },
  {
    date: '2025-04-27',
    label: 'Preorder Batch #14 (Weekend Batch)',
    cutoffHour: '21:00',
    maxOrderSlots: 120,
    isActive: true,
    notes: 'Produksi 27 April 2025 • Cocok untuk hampers & kado keluarga',
  },
];

export const initialOrders: Order[] = [
  {
    id: '#MB-1024',
    createdAt: '2025-04-20T08:30:00Z',
    customerName: 'Clarissa Amanda',
    customerPhone: '081234567890',
    orderType: 'delivery',
    deliveryAddress: 'Jl. Raya Darmo Permai II No. 45, Dukuh Pakis, Surabaya',
    deliveryNotes: 'Mohon titipkan di pos satpam jika tidak ada orang di rumah.',
    poDate: '2025-04-21',
    poSlot: '12:00 – 15:00',
    items: [
      {
        id: 'cart-item-1',
        menuItem: initialMenuItems[0], // Classic OG
        quantity: 2,
        selectedCustomizations: [
          { groupName: 'Suhu Penyajian', selectedLabel: 'Fresh Room Temp (Siap Santap)', extraPrice: 0 },
        ],
        notes: 'Ekstra renyah yaa kak',
        itemPrice: 28000,
        totalPrice: 56000,
      },
      {
        id: 'cart-item-2',
        menuItem: initialMenuItems[1], // Double Choco Chunk
        quantity: 2,
        selectedCustomizations: [
          { groupName: 'Kekayaan Cokelat', selectedLabel: 'Double Choco Standard (Gooey Melt)', extraPrice: 0 },
        ],
        notes: '',
        itemPrice: 32000,
        totalPrice: 64000,
      },
      {
        id: 'cart-item-3',
        menuItem: initialMenuItems[2], // Red Velvet Cheesy
        quantity: 2,
        selectedCustomizations: [
          { groupName: 'Isian Cream Cheese', selectedLabel: 'Original Cream Cheese Core', extraPrice: 0 },
        ],
        notes: '',
        itemPrice: 34000,
        totalPrice: 68000,
      },
    ],
    subtotal: 188000,
    deliveryFee: 15000,
    discount: 0,
    total: 203000,
    paymentMethod: 'qris',
    paymentStatus: 'lunas',
    orderStatus: 'diproses_dapur',
    adminNotes: 'Batch #12 sedang dipanggang di oven utama.',
  },
  {
    id: '#MB-1023',
    createdAt: '2025-04-20T07:15:00Z',
    customerName: 'Nadia Salsabila',
    customerPhone: '085748829148',
    orderType: 'pickup',
    deliveryNotes: 'Diambil saat pulang kantor sore hari.',
    poDate: '2025-04-21',
    poSlot: '15:00 – 18:00',
    items: [
      {
        id: 'cart-item-4',
        menuItem: initialMenuItems[3], // Brownies Cookies
        quantity: 4,
        selectedCustomizations: [
          { groupName: 'Pilihan Tekstur', selectedLabel: 'Gooey Fudgy (Lumer Meleleh)', extraPrice: 0 },
        ],
        notes: 'Diberi pita cantik untuk hampers kado ultah',
        itemPrice: 36000,
        totalPrice: 144000,
      },
    ],
    subtotal: 144000,
    deliveryFee: 0,
    discount: 0,
    total: 144000,
    paymentMethod: 'bca',
    paymentStatus: 'lunas',
    orderStatus: 'siap',
    adminNotes: 'Pesanan box hampers sudah di packaging cantik di pick-up shelf.',
  },
  {
    id: '#MB-1022',
    createdAt: '2025-04-19T14:40:00Z',
    customerName: 'Bima Satria',
    customerPhone: '081399887766',
    orderType: 'pickup',
    deliveryNotes: 'Ambil langsung di outlet Mooi Bites',
    poDate: '2025-04-21',
    poSlot: '09:00 – 12:00',
    items: [
      {
        id: 'cart-item-5',
        menuItem: initialMenuItems[0], // Classic OG
        quantity: 3,
        selectedCustomizations: [],
        notes: '',
        itemPrice: 28000,
        totalPrice: 84000,
      },
      {
        id: 'cart-item-6',
        menuItem: initialMenuItems[1], // Double Choco
        quantity: 3,
        selectedCustomizations: [],
        notes: '',
        itemPrice: 32000,
        totalPrice: 96000,
      },
    ],
    subtotal: 180000,
    deliveryFee: 0,
    discount: 10000,
    total: 170000,
    paymentMethod: 'qris',
    paymentStatus: 'lunas',
    orderStatus: 'menunggu_konfirmasi',
    adminNotes: 'Menunggu verifikasi bukti transfer QRIS.',
  },
];

export const initialAffiliatePICs: AffiliatePIC[] = [
  {
    id: 'pic-1',
    code: 'MOOI-SURABAYA-BARAT',
    name: 'Sarah Wijaya',
    phone: '085748829148',
    status: 'active',
    pickupLocationName: 'Outlet Utama Mooi Bites • Dukuh Pakis',
    pickupAddress: 'Jl. Darmo Permai Timur No. 18, Dukuh Pakis, Surabaya',
    pickupNotes: 'Titik pickup outlet resmi Mooi Bites Cookie',
    commissionRatePercent: 8,
    bankAccount: 'BCA 8420-192-881 a.n Mooi Bites',
    isActive: true,
    registeredAt: '2025-04-01T00:00:00Z',
  },
];

export const initialAffiliateSettings: AffiliateSettings = {
  defaultCommissionRatePercent: 8,
  customerDiscountPerPortion: 2000,
  updatedAt: '2025-04-01T00:00:00Z',
};

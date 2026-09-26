import { Order, OrderStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function getStatusDetails(status: OrderStatus): {
  label: string;
  badgeClass: string;
  description: string;
  stepIndex: number;
} {
  switch (status) {
    case 'menunggu_konfirmasi':
      return {
        label: 'Menunggu Konfirmasi',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Pesanan telah masuk dan menunggu verifikasi penjual.',
        stepIndex: 1,
      };
    case 'dikonfirmasi':
      return {
        label: 'PO Dikonfirmasi',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        description: 'Slot PO Anda telah dikunci dan dijadwalkan ke dapur.',
        stepIndex: 2,
      };
    case 'diproses_dapur':
      return {
        label: 'Sedang Dipanggang / Disiapkan',
        badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
        description: 'Dapur pastry sedang memanggang dessert segar sesuai jadwal batch.',
        stepIndex: 3,
      };
    case 'siap':
      return {
        label: 'Siap Diambil / Diantar',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Pesanan telah dikemas rapi dan siap dikirim atau diambil.',
        stepIndex: 4,
      };
    case 'selesai':
      return {
        label: 'Selesai',
        badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
        description: 'Pesanan telah diterima. Terima kasih telah memesan!',
        stepIndex: 5,
      };
    case 'dibatalkan':
      return {
        label: 'Dibatalkan',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        description: 'Pesanan PO telah dibatalkan.',
        stepIndex: 0,
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
        description: '',
        stepIndex: 1,
      };
  }
}

/**
 * Generate formatted WhatsApp message text
 */
export function generateWhatsAppOrderMessage(order: Order, storeName: string): string {
  const dateFormatted = formatDateIndo(order.poDate);
  const itemsText = order.items
    .map((item, idx) => {
      let customStr = '';
      if (item.selectedCustomizations.length > 0) {
        customStr = `\n   └ Varian: ${item.selectedCustomizations.map((c) => c.selectedLabel).join(', ')}`;
      }
      if (item.notes) {
        customStr += `\n   └ Catatan: "${item.notes}"`;
      }
      return `${idx + 1}. *${item.menuItem.name}* (${item.quantity}x) = ${formatRupiah(item.totalPrice)}${customStr}`;
    })
    .join('\n');

  const deliveryInfo =
    order.orderType === 'delivery'
      ? `🚚 *Metode:* Diantar (Delivery)\n📍 *Alamat:* ${order.deliveryAddress || '-'}${order.deliveryNotes ? `\n📝 *Patokan:* ${order.deliveryNotes}` : ''}`
      : `🏪 *Metode:* Ambil Sendiri (Self Pickup di Dapur)`;

  return `Halo Admin *${storeName}*, saya ingin konfirmasi Pre-Order dessert (Cookies & Cheesecake) dengan rincian berikut:

📋 *KODE BOOKING PO:* #${order.id}
👤 *Nama:* ${order.customerName}
📱 *No. WhatsApp:* ${order.customerPhone}

📅 *Jadwal Pengiriman/Ambil:*
• Tanggal: ${dateFormatted}
• Sesi/Slot: ${order.poSlot}
${deliveryInfo}

🍽️ *Rincian Pesanan:*
${itemsText}

💰 *Ringkasan Pembayaran:*
• Subtotal: ${formatRupiah(order.subtotal)}
• Ongkir: ${formatRupiah(order.deliveryFee)}${order.discount > 0 ? `\n• Diskon: -${formatRupiah(order.discount)} (${order.promoCode || 'Promo'})` : ''}
*TOTAL PEMBAYARAN:* *${formatRupiah(order.total)}*

💳 *Metode Bayar:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'lunas' ? 'Sudah Lunas' : 'Menunggu Verifikasi'})

Mohon bantuannya untuk mengonfirmasi slot PO pesanan saya. Terima kasih banyak!`;
}

/**
 * Creates wa.me URL
 */
export function getWhatsAppLink(phone?: string | null, text: string = ''): string {
  if (!phone) return '#';
  // normalize Indonesian phone number e.g. 0812 -> 62812
  let cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate full WhatsApp link directly from order
 */
export function generateWhatsAppUrl(order: Order, storePhone: string, storeName: string): string {
  const text = generateWhatsAppOrderMessage(order, storeName);
  return getWhatsAppLink(storePhone, text);
}


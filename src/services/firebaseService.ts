import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  AffiliatePIC,
  AffiliateSettings,
  AuthUser,
  MenuItem,
  Order,
  OrderStatus,
  POBatchSchedule,
  UserRole,
  VoucherReward,
  CustomerLoyaltyRecord,
} from '../types';
import {
  initialAffiliatePICs,
  initialAffiliateSettings,
  initialBatchSchedules,
  initialMenuItems,
  initialOrders,
} from '../data/initialData';

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  AFFILIATES: 'affiliates',
  SETTINGS: 'settings',
  ORDERS: 'orders',
  BATCHES: 'batchSchedules',
  LOYALTY: 'loyalty',
  VOUCHERS: 'vouchers',
};

// Local storage keys for resilient fallback
const LS_KEYS = {
  AFFILIATES: 'dessert_po_affiliates_v3',
  SETTINGS: 'dessert_po_affiliate_settings_v3',
  ORDERS: 'dessert_po_orders_v2',
  USERS: 'dessert_po_auth_user_v2',
  LOYALTY: 'dessert_po_loyalty_records_v3',
};

/**
 * Generate a unique Affiliate Code, e.g. AFF_ANI8421
 */
export function generateAffiliateCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'PIC';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `AFF_${cleanName}${randomDigits}`;
}

/**
 * Get Affiliate Settings
 */
export async function getAffiliateSettings(): Promise<AffiliateSettings> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'affiliate');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AffiliateSettings;
    }
  } catch (err) {
    console.warn('Firestore offline/fallback for affiliate settings:', err);
  }

  // Fallback to localStorage or initialData
  try {
    const local = localStorage.getItem(LS_KEYS.SETTINGS);
    if (local) return JSON.parse(local);
  } catch {}
  return initialAffiliateSettings;
}

/**
 * Save Affiliate Settings (Admin only)
 */
export async function saveAffiliateSettings(settings: AffiliateSettings): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'affiliate');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc failed, saving to localStorage:', err);
  }
  try {
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

/**
 * Get all Affiliates
 */
export async function getAffiliates(): Promise<AffiliatePIC[]> {
  try {
    const colRef = collection(db, COLLECTIONS.AFFILIATES);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const list: AffiliatePIC[] = [];
      snap.forEach((d) => list.push(d.data() as AffiliatePIC));
      return list;
    }
  } catch (err) {
    console.warn('Firestore fallback for affiliates list:', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LS_KEYS.AFFILIATES);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return initialAffiliatePICs;
}

/**
 * Save or Update an Affiliate
 */
export async function saveAffiliate(affiliate: AffiliatePIC): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.AFFILIATES, affiliate.id);
    await setDoc(docRef, affiliate, { merge: true });
  } catch (err) {
    console.warn('Firestore affiliate save error, fallback to local:', err);
  }

  // Update local storage
  try {
    const current = await getAffiliates();
    const idx = current.findIndex((a) => a.id === affiliate.id);
    let updated: AffiliatePIC[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = affiliate;
    } else {
      updated = [affiliate, ...current];
    }
    localStorage.setItem(LS_KEYS.AFFILIATES, JSON.stringify(updated));
  } catch {}
}

/**
 * Delete an Affiliate
 */
export async function deleteAffiliate(affiliateId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.AFFILIATES, affiliateId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }
  try {
    const current = await getAffiliates();
    const updated = current.filter((a) => a.id !== affiliateId);
    localStorage.setItem(LS_KEYS.AFFILIATES, JSON.stringify(updated));
  } catch {}
}

/**
 * Google Sign-In with Firebase
 */
export async function signInWithGoogleAuth(): Promise<AuthUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const email = user.email || '';
  
  // Check if admin email
  const isAdmin = email.toLowerCase() === 'ahmad.23188@mhs.unesa.ac.id' || email.includes('admin') || email.includes('baker');

  const authUser: AuthUser = {
    id: user.uid,
    name: user.displayName || 'Pengguna Google',
    email: email,
    phone: user.phoneNumber || '',
    role: isAdmin ? 'admin' : 'pelanggan',
    title: isAdmin ? 'Admin Utama Crumb & Cream' : 'Pelanggan PO',
    lastLoginAt: new Date().toISOString(),
  };

  // Sync to Firestore
  try {
    const userDoc = doc(db, COLLECTIONS.USERS, user.uid);
    await setDoc(userDoc, authUser, { merge: true });
  } catch (err) {
    console.warn('Could not sync Google user to Firestore:', err);
  }

  return authUser;
}

/**
 * Sign out
 */
export async function logOutAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign out error:', err);
  }
  localStorage.removeItem(LS_KEYS.USERS);
}

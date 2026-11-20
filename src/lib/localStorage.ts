import { createSeedState } from '../data/seed';
import type { PrototypeState } from '../types';

export const STORAGE_KEY = 'moolya-prototype-v2';
const LEGACY_KEYS = ['moolya-prototype-v1'];

/** Loads saved state and fills any fields added since it was saved, so old browsers never crash. */
export const loadState = (): PrototypeState | null => {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<PrototypeState>;
    const seed = createSeedState();
    if (!Array.isArray(saved.products) || !Array.isArray(saved.orders)) return null;
    return {
      ...seed,
      ...saved,
      wishlist: Array.isArray(saved.wishlist) ? saved.wishlist : [],
      reviews: Array.isArray(saved.reviews) ? saved.reviews : seed.reviews,
      myOrderIds: Array.isArray(saved.myOrderIds) ? saved.myOrderIds : [],
      toastMessages: [],
    };
  } catch {
    return null;
  }
};
export const saveState = (state: PrototypeState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toastMessages: [] }));
  } catch {
    /* private mode or storage full: the demo keeps working in memory */
  }
};
export const resetPrototypeStorage = () => localStorage.removeItem(STORAGE_KEY);

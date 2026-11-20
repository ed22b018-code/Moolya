import type { Coupon, InventoryBatch, OrderItem, PrototypeState, TraceabilityRecord } from '../types';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    value,
  );
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
let idCounter = 1000;
export const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(++idCounter).toString(36)}`.toUpperCase();
export const getSKUInventory = (state: PrototypeState, skuId: string) =>
  state.inventoryBatches.filter((b) => b.skuId === skuId).reduce((sum, b) => sum + b.quantityAvailable, 0);
export const getProducerCredits = (state: PrototypeState, producerId: string) =>
  state.payouts
    .filter((p) => p.producerId === producerId && p.type === 'credit')
    .reduce((s, p) => s + p.amount, 0);
export const getProducerPaid = (state: PrototypeState, producerId: string) =>
  state.payouts
    .filter((p) => p.producerId === producerId && p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);
export const getProducerPending = (state: PrototypeState, producerId: string) =>
  state.payouts
    .filter((p) => p.producerId === producerId && p.status !== 'paid' && p.status !== 'held')
    .reduce((s, p) => s + p.amount, 0);
export const calculateDemandRemaining = (target: number, accepted: number) => Math.max(0, target - accepted);
export const calculateQCAcceptance = (accepted: number, total: number) =>
  total ? Math.round((accepted / total) * 100) : 0;

export function allocateOrderInventory(batches: InventoryBatch[], items: OrderItem[]) {
  const next = batches.map((b) => ({ ...b }));
  const allocated = items.map((item) => {
    let needed = item.quantity;
    const traceability: TraceabilityRecord[] = [];
    const ids: string[] = [];
    const eligible = next
      .filter((b) => b.skuId === item.skuId && b.quantityAvailable > 0)
      .sort((a, b) => a.acceptedAt.localeCompare(b.acceptedAt));
    for (const batch of eligible) {
      const take = Math.min(needed, batch.quantityAvailable);
      for (let i = 0; i < take; i++)
        traceability.push({
          unitIndex: traceability.length + 1,
          batchId: batch.id,
          producerId: batch.producerId,
          qcRecordId: batch.qcRecordId,
        });
      if (take) {
        ids.push(batch.id);
        batch.quantityAvailable -= take;
        batch.status = batch.quantityAvailable === 0 ? 'depleted' : 'available';
        needed -= take;
      }
      if (!needed) break;
    }
    if (needed > 0)
      throw new Error(`Only ${item.quantity - needed} verified units are available for ${item.skuId}.`);
    return { ...item, allocatedBatchIds: ids, traceability };
  });
  return { batches: next, items: allocated };
}

export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 79;

export function findCoupon(coupons: Coupon[], code?: string) {
  if (!code) return undefined;
  return coupons.find((c) => c.code === code.trim().toUpperCase());
}

/** Single source of truth for cart, checkout and order totals. */
export function calculateTotals(subtotal: number, coupon?: Coupon) {
  const eligible = coupon && subtotal >= coupon.minSubtotal ? coupon : undefined;
  const discount = eligible ? Math.round((subtotal * eligible.percentOff) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = subtotal === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: afterDiscount + shipping, coupon: eligible };
}

export function cartSubtotal(state: PrototypeState) {
  return state.cart.reduce(
    (s, c) => s + (state.products.find((p) => p.id === c.productId)?.price || 0) * c.quantity,
    0,
  );
}

/** Prototype delivery estimate: nearer PIN zones arrive sooner. */
export function estimateDelivery(pin: string, from = new Date()) {
  if (!/^[1-9][0-9]{5}$/.test(pin)) return null;
  const zone = Number(pin[0]);
  const days = pin.startsWith('533') || pin.startsWith('534') ? 2 : zone === 5 ? 3 : zone <= 6 ? 4 : 6;
  const date = new Date(from.getTime() + days * 86400000);
  return {
    days,
    label: new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(
      date,
    ),
  };
}

export const averageRating = (ratings: number[]) =>
  ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;

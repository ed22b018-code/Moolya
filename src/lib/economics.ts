import type { Category } from '../types';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from './core';

/**
 * Indicative unit-economics model for the pilot. Every figure is an editable assumption,
 * not a quotation: prices are GST-inclusive, and costs are per unit unless stated.
 */
export interface CostAssumptions {
  gstPct: number; // GST included in the retail price
  paymentPct: number; // blended payment-gateway fee (UPI / card / COD)
  collectionQc: number; // ₹ per unit: pickup from producer + inspection labour
  shippingPerOrder: number; // ₹ forward courier cost per order
  returnRatePct: number; // % of units returned
  reverseCostPerReturn: number; // ₹ reverse pickup + re-inspection per returned unit
  cacPerOrder: number; // ₹ marketing spend to win one order (blended new + repeat)
  unitsPerOrder: number; // average units in an order
  fixedMonthly: number; // ₹ hub rent, tools, coordinator stipend, content
}

export const defaultAssumptions: CostAssumptions = {
  gstPct: 5,
  paymentPct: 2,
  collectionQc: 30,
  shippingPerOrder: 90,
  returnRatePct: 5,
  reverseCostPerReturn: 120,
  cacPerOrder: 220,
  unitsPerOrder: 1.6,
  fixedMonthly: 150000,
};

export const packagingByCategory: Record<Category, number> = { Handloom: 40, Craft: 60, Natural: 45 };

export interface EconomicsLine {
  key: string;
  label: string;
  amount: number; // signed: revenue positive, costs negative
  group: 'revenue' | 'maker' | 'tax' | 'operations' | 'growth';
}

export function unitEconomics(
  price: number,
  producerRate: number,
  category: Category,
  a: CostAssumptions = defaultAssumptions,
) {
  const units = Math.max(1, a.unitsPerOrder);
  const orderValue = price * units;
  const gst = price - price / (1 + a.gstPct / 100);
  const shippingFee = orderValue >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE / units;
  const lines: EconomicsLine[] = [
    { key: 'price', label: 'Retail price (incl. GST)', amount: price, group: 'revenue' },
    { key: 'shipFee', label: 'Shipping fee charged', amount: shippingFee, group: 'revenue' },
    { key: 'gst', label: 'GST', amount: -gst, group: 'tax' },
    { key: 'maker', label: 'Maker payout', amount: -producerRate, group: 'maker' },
    { key: 'qc', label: 'Collection & QC', amount: -a.collectionQc, group: 'operations' },
    {
      key: 'pack',
      label: 'Packaging & origin card',
      amount: -packagingByCategory[category],
      group: 'operations',
    },
    { key: 'ship', label: 'Courier', amount: -a.shippingPerOrder / units, group: 'operations' },
    {
      key: 'pay',
      label: 'Payment fees',
      amount: -(price + shippingFee) * (a.paymentPct / 100),
      group: 'operations',
    },
    {
      key: 'returns',
      label: 'Returns allowance',
      amount: -(a.returnRatePct / 100) * (a.reverseCostPerReturn + packagingByCategory[category]),
      group: 'operations',
    },
    { key: 'cac', label: 'Marketing (CAC)', amount: -a.cacPerOrder / units, group: 'growth' },
  ];
  const contribution = lines.reduce((s, l) => s + l.amount, 0);
  const netRevenue = price - gst;
  return {
    lines,
    contribution,
    contributionPct: (contribution / price) * 100,
    makerShareOfNet: (producerRate / netRevenue) * 100,
    makerShareOfPrice: (producerRate / price) * 100,
    contributionPerOrder: contribution * units,
  };
}

/** Consumer-facing breakdown of where each rupee of the price goes. */
export function priceBreakdown(price: number, producerRate: number, category: Category) {
  const e = unitEconomics(price, producerRate, category);
  const get = (k: string) => -(e.lines.find((l) => l.key === k)?.amount || 0);
  const maker = producerRate;
  const tax = get('gst');
  const quality = get('qc');
  const logistics =
    get('pack') +
    get('ship') +
    get('returns') +
    get('pay') -
    (e.lines.find((l) => l.key === 'shipFee')?.amount || 0);
  const rest = price - maker - tax - quality - logistics;
  return [
    { key: 'maker', label: 'Goes to the maker', amount: maker },
    { key: 'tax', label: 'GST to the government', amount: tax },
    { key: 'quality', label: 'Collection & quality checks', amount: quality },
    { key: 'logistics', label: 'Packaging, delivery & returns', amount: Math.max(0, logistics) },
    { key: 'platform', label: 'Reaching buyers & running Moolya', amount: Math.max(0, rest) },
  ];
}

export function breakEvenOrders(contributionPerOrder: number, fixedMonthly: number) {
  return contributionPerOrder > 0 ? Math.ceil(fixedMonthly / contributionPerOrder) : Infinity;
}

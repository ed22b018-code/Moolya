import { createSeedState } from '../src/data/seed';
import { prototypeReducer } from '../src/app/prototypeReducer';
import { calculateTotals, estimateDelivery, getSKUInventory } from '../src/lib/core';

const ok = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};
const checkout = {
  customer: { name: 'Shopper Test', email: 'shopper@example.test', phone: '9876543210' },
  shippingAddress: { line: '12 Main Road', city: 'Kakinada', state: 'Andhra Pradesh', pin: '533001' },
  paymentMethod: 'Cash on Delivery' as const,
};
let s = createSeedState();

// Catalogue: every product has real photos and a sensible default variant.
ok(
  s.products.every((p) => p.images.length >= 2 && p.images[0].startsWith('https://images.unsplash.com/')),
  'All products need photos',
);
ok(
  s.products.find((p) => p.skuId === 'N001')!.variants[0] === '500 g',
  'Honey must not offer clothing sizes',
);

// Totals: free shipping threshold and coupon minimums.
ok(calculateTotals(1290).shipping === 79, 'Below ₹1,500 pays shipping');
ok(calculateTotals(1600).shipping === 0, 'Above ₹1,500 ships free');
ok(
  calculateTotals(1000, { code: 'MAKERS15', label: '', percentOff: 15, minSubtotal: 2000 }).discount === 0,
  'Coupon minimum enforced',
);
ok(estimateDelivery('533101')?.days === 2, 'Local PIN delivers in 2 days');
ok(estimateDelivery('12345') === null, 'Invalid PIN rejected');

// Wishlist toggles.
s = prototypeReducer(s, { type: 'TOGGLE_WISHLIST', payload: { productId: 'C001-product-id' } });
ok(s.wishlist.includes('C001-product-id'), 'Wishlist add');
s = prototypeReducer(s, { type: 'TOGGLE_WISHLIST', payload: { productId: 'C001-product-id' } });
ok(!s.wishlist.includes('C001-product-id'), 'Wishlist remove');

// Invalid then valid coupon, multi-item order with discount and per-unit trace.
s = prototypeReducer(s, { type: 'APPLY_COUPON', payload: { code: 'NOPE' } });
ok(!s.appliedCoupon, 'Invalid coupon rejected');
s = prototypeReducer(s, { type: 'APPLY_COUPON', payload: { code: 'godavari10' } });
ok(s.appliedCoupon === 'GODAVARI10', 'Coupon codes are case-insensitive');
const before = getSKUInventory(s, 'N001');
s = prototypeReducer(s, {
  type: 'ADD_TO_CART',
  payload: { productId: 'N001-product-id', skuId: 'N001', variant: '500 g', quantity: 3 },
});
s = prototypeReducer(s, {
  type: 'ADD_TO_CART',
  payload: { productId: 'H003-product-id', skuId: 'H003', variant: 'Indigo with temple border', quantity: 1 },
});
s = prototypeReducer(s, { type: 'CREATE_ORDER', payload: checkout });
const order = s.orders[0];
ok(order.subtotal === 449 * 3 + 2490, 'Subtotal');
ok(order.discount === Math.round(order.subtotal * 0.1), '10% discount applied');
ok(order.total === order.subtotal - order.discount! + order.shipping, 'Total reconciles');
ok(order.items[0].traceability.length === 3, 'Each unit traced');
ok(getSKUInventory(s, 'N001') === before - 3, 'Inventory decremented');
ok(
  s.myOrderIds[0] === order.id && !s.appliedCoupon && !s.cart.length,
  'Order recorded, cart and coupon cleared',
);

// Verified review only after purchase.
s = prototypeReducer(s, {
  type: 'ADD_REVIEW',
  payload: {
    productId: 'N001-product-id',
    author: 'Tester',
    city: 'Kakinada',
    rating: 5,
    title: 'Great',
    body: 'Lovely honey.',
  },
});
ok(s.reviews[0].verified, 'Purchaser review is verified');
s = prototypeReducer(s, {
  type: 'ADD_REVIEW',
  payload: {
    productId: 'C002-product-id',
    author: 'Tester',
    city: '',
    rating: 4,
    title: '',
    body: 'Nice box.',
  },
});
ok(!s.reviews[0].verified, 'Non-purchaser review is not verified');

// Ops status updates flow to the order.
s = prototypeReducer(s, { type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'shipped' } });
ok(s.orders[0].status === 'shipped', 'Status update');

// Over-stock add is refused.
const stock = getSKUInventory(s, 'C002');
s = prototypeReducer(s, {
  type: 'ADD_TO_CART',
  payload: { productId: 'C002-product-id', skuId: 'C002', variant: 'Standard', quantity: stock + 1 },
});
ok(!s.cart.length, 'Cannot exceed verified stock');

console.log(
  'Shopper flow passed: photos, totals, coupons, wishlist, multi-item trace, reviews, order status.',
);

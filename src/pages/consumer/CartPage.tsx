import { useState } from 'react';
import { ArrowRight, Heart, Minus, Plus, Tag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common';
import { ConsumerLayout, ProductGrid } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { coupons } from '../../data/seed';
import {
  calculateTotals,
  cartSubtotal,
  findCoupon,
  formatCurrency,
  FREE_SHIPPING_THRESHOLD,
} from '../../lib/core';
import { onImgError } from '../../data/media';

export function OrderSummary({ showCoupon = true }: { showCoupon?: boolean }) {
  const { state, dispatch } = usePrototype();
  const [code, setCode] = useState('');
  const applied = findCoupon(coupons, state.appliedCoupon);
  const t = calculateTotals(cartSubtotal(state), applied);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - (t.subtotal - t.discount));
  return (
    <>
      <div className="ship-progress">
        {remaining > 0 ? (
          <span>
            Add <b>{formatCurrency(remaining)}</b> more for free shipping
          </span>
        ) : (
          <span>🎉 You’ve unlocked free shipping</span>
        )}
        <i>
          <i
            style={{
              width: `${Math.min(100, ((t.subtotal - t.discount) / FREE_SHIPPING_THRESHOLD) * 100)}%`,
            }}
          />
        </i>
      </div>
      <div>
        <span>Subtotal</span>
        <b>{formatCurrency(t.subtotal)}</b>
      </div>
      {applied && (
        <div className="discount-line">
          <span>
            <Tag size={14} /> {applied.code}
            <button
              type="button"
              className="icon-button"
              aria-label="Remove coupon"
              onClick={() => dispatch({ type: 'REMOVE_COUPON' })}
            >
              <X size={14} />
            </button>
          </span>
          <b>
            {t.discount ? `− ${formatCurrency(t.discount)}` : `Needs ${formatCurrency(applied.minSubtotal)}+`}
          </b>
        </div>
      )}
      <div>
        <span>Shipping</span>
        <b>{t.shipping ? formatCurrency(t.shipping) : 'Free'}</b>
      </div>
      <hr />
      <div className="total">
        <span>Total</span>
        <b>{formatCurrency(t.total)}</b>
      </div>
      {showCoupon && !applied && (
        <div className="coupon-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            aria-label="Coupon code"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && code) {
                e.preventDefault();
                dispatch({ type: 'APPLY_COUPON', payload: { code } });
              }
            }}
          />
          <button type="button" onClick={() => code && dispatch({ type: 'APPLY_COUPON', payload: { code } })}>
            Apply
          </button>
        </div>
      )}
      {showCoupon && !applied && (
        <small className="coupon-hint">
          Try <b>GODAVARI10</b> (10% off) or <b>MAKERS15</b> (15% off over ₹2,000)
        </small>
      )}
    </>
  );
}

export function CartPage() {
  const { state, dispatch } = usePrototype();
  const items = state.cart
    .map((c) => ({ ...c, product: state.products.find((p) => p.id === c.productId) }))
    .filter((i): i is typeof i & { product: NonNullable<typeof i.product> } => !!i.product);
  const suggestions = state.products.filter((p) => !state.cart.some((c) => c.productId === p.id)).slice(0, 3);
  const update = (productId: string, variant: string | undefined, quantity: number) =>
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, variant, quantity } });
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Your selection</span>
          <h1>Cart{items.length ? ` (${items.reduce((s, i) => s + i.quantity, 0)})` : ''}</h1>
        </div>
      </section>
      <section className="container cart-layout">
        {!items.length ? (
          <div className="empty-cart">
            <EmptyState
              title="Your cart is empty"
              copy="Explore the collection and choose a verified product."
            />
            <Link className="button button-primary" to="/shop">
              Start shopping <ArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((i) => (
                <article key={`${i.productId}${i.variant}`}>
                  <Link to={`/product/${i.productId}`}>
                    <img src={i.product.images[0]} alt="" onError={onImgError} />
                  </Link>
                  <div>
                    <span>
                      {i.product.category}
                      {i.variant && i.variant !== 'Standard' ? ` · ${i.variant}` : ''}
                    </span>
                    <Link to={`/product/${i.productId}`}>
                      <h3>{i.product.name}</h3>
                    </Link>
                    <small>{formatCurrency(i.product.price)} each</small>
                    <div className="quantity">
                      <button
                        onClick={() => update(i.productId, i.variant, i.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus />
                      </button>
                      <b>{i.quantity}</b>
                      <button
                        onClick={() => update(i.productId, i.variant, i.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>
                  <div className="cart-price">
                    <b>{formatCurrency(i.product.price * i.quantity)}</b>
                    <button
                      onClick={() => {
                        if (!state.wishlist.includes(i.productId))
                          dispatch({ type: 'TOGGLE_WISHLIST', payload: { productId: i.productId } });
                        dispatch({
                          type: 'REMOVE_FROM_CART',
                          payload: { productId: i.productId, variant: i.variant },
                        });
                      }}
                    >
                      <Heart /> Save for later
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'REMOVE_FROM_CART',
                          payload: { productId: i.productId, variant: i.variant },
                        })
                      }
                    >
                      <Trash2 /> Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <h2>Order summary</h2>
              <OrderSummary />
              <Link className="button button-primary" to="/checkout">
                Checkout <ArrowRight />
              </Link>
              <small>Each unit is allocated to a real QC’d batch when you place the order.</small>
            </aside>
          </>
        )}
      </section>
      {suggestions.length > 0 && (
        <section className="section container">
          <h2 className="related-title">{items.length ? 'Complete the set' : 'Popular picks'}</h2>
          <ProductGrid products={suggestions} />
        </section>
      )}
      {items.length > 0 && (
        <div className="sticky-buy">
          <div>
            <b>
              {formatCurrency(
                calculateTotals(cartSubtotal(state), findCoupon(coupons, state.appliedCoupon)).total,
              )}
            </b>
            <small>Total</small>
          </div>
          <Link className="button button-primary" to="/checkout">
            Checkout
          </Link>
        </div>
      )}
    </ConsumerLayout>
  );
}

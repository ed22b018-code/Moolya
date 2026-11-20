import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button, EmptyState } from '../../components/common';
import { ConsumerLayout } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { estimateDelivery, formatCurrency } from '../../lib/core';
import { onImgError } from '../../data/media';
import { cn } from '../../lib/cn';
import type { CheckoutInput } from '../../types';
import { OrderSummary } from './CartPage';

type Field = 'name' | 'email' | 'phone' | 'line' | 'city' | 'state' | 'pin';
const validators: Record<Field, (v: string) => string | null> = {
  name: (v) => (v.trim().length >= 2 ? null : 'Please enter your full name.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Enter a valid email address.'),
  phone: (v) => (/^[6-9]\d{9}$/.test(v.replace(/\D/g, '').slice(-10)) ? null : 'Enter a 10-digit Indian mobile number.'),
  line: (v) => (v.trim().length >= 6 ? null : 'Add house number, street and area.'),
  city: (v) => (v.trim() ? null : 'Enter your city.'),
  state: (v) => (v.trim() ? null : 'Enter your state.'),
  pin: (v) => (/^[1-9][0-9]{5}$/.test(v) ? null : 'Enter a valid 6-digit PIN code.'),
};
const STATES = [
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra', 'Delhi', 'Gujarat',
  'West Bengal', 'Odisha', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar', 'Goa', 'Other',
];

export function CheckoutPage() {
  const { state, dispatch } = usePrototype();
  const navigate = useNavigate();
  const orderCountBefore = useRef(state.orders.length);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [data, setData] = useState<CheckoutInput>({
    customer: { name: '', email: '', phone: '' },
    shippingAddress: { line: '', city: '', state: 'Andhra Pradesh', pin: '' },
    paymentMethod: 'UPI',
  });
  const values: Record<Field, string> = { ...data.customer, ...data.shippingAddress };
  const errors = Object.fromEntries(
    (Object.keys(validators) as Field[]).map((k) => [k, validators[k](values[k])]),
  ) as Record<Field, string | null>;
  const valid = Object.values(errors).every((e) => !e);
  const delivery = estimateDelivery(data.shippingAddress.pin);

  useEffect(() => {
    if (submitted && state.orders.length > orderCountBefore.current) navigate(`/order-success/${state.orders[0].id}`);
    else if (submitted && state.cart.length && state.orders.length === orderCountBefore.current) setSubmitted(false);
  }, [state.orders, state.cart.length, submitted, navigate]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(Object.fromEntries(Object.keys(validators).map((k) => [k, true])));
    if (!valid) {
      document.querySelector<HTMLElement>('.has-error input, .has-error select')?.focus();
      return;
    }
    orderCountBefore.current = state.orders.length;
    setSubmitted(true);
    dispatch({ type: 'CREATE_ORDER', payload: data });
  };
  const input = (field: Field, label: string, opts: { type?: string; span?: boolean; inputMode?: 'numeric' | 'tel' | 'email'; autoComplete?: string; maxLength?: number } = {}) => {
    const isCustomer = field === 'name' || field === 'email' || field === 'phone';
    const show = touched[field] && errors[field];
    return (
      <label className={cn(opts.span && 'span-2', show && 'has-error')}>
        {label}
        <input
          type={opts.type || 'text'}
          inputMode={opts.inputMode}
          autoComplete={opts.autoComplete}
          maxLength={opts.maxLength}
          value={values[field]}
          aria-invalid={!!show}
          onBlur={() => setTouched((t) => ({ ...t, [field]: true }))}
          onChange={(e) => {
            const v = field === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value;
            setData(
              isCustomer
                ? { ...data, customer: { ...data.customer, [field]: v } }
                : { ...data, shippingAddress: { ...data.shippingAddress, [field]: v } },
            );
          }}
        />
        {show && <small className="field-error">{errors[field]}</small>}
      </label>
    );
  };

  if (!state.cart.length && !submitted)
    return (
      <ConsumerLayout>
        <div className="container empty-cart">
          <EmptyState title="Nothing to check out" copy="Add a product to your cart first." />
          <Link className="button button-primary" to="/shop">
            Browse products
          </Link>
        </div>
      </ConsumerLayout>
    );
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <ol className="steps">
            <li className="done">Cart</li>
            <li className="current">Details &amp; payment</li>
            <li>Origin revealed</li>
          </ol>
          <h1>Checkout</h1>
        </div>
      </section>
      <form className="container checkout-layout" onSubmit={submit} noValidate>
        <div className="checkout-form">
          <h2>Contact</h2>
          <div className="form-grid">
            {input('name', 'Full name', { span: true, autoComplete: 'name' })}
            {input('email', 'Email', { type: 'email', inputMode: 'email', autoComplete: 'email' })}
            {input('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 14 })}
          </div>
          <h2>Delivery address</h2>
          <div className="form-grid">
            {input('line', 'House no., street, area', { span: true, autoComplete: 'street-address' })}
            {input('pin', 'PIN code', { inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 6 })}
            {input('city', 'City', { autoComplete: 'address-level2' })}
            <label>
              State
              <select
                value={data.shippingAddress.state}
                onChange={(e) => setData({ ...data, shippingAddress: { ...data.shippingAddress, state: e.target.value } })}
              >
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {delivery && (
              <p className="pin-result span-2">
                Estimated delivery by <b>{delivery.label}</b>
              </p>
            )}
          </div>
          <h2>Payment</h2>
          <div className="payment-options">
            {(
              [
                ['UPI', 'GPay, PhonePe, Paytm or any UPI app'],
                ['Card', 'Credit or debit card'],
                ['Cash on Delivery', 'Pay when your order arrives'],
              ] as const
            ).map(([m, sub]) => (
              <label className={data.paymentMethod === m ? 'active' : ''} key={m}>
                <input type="radio" name="payment" checked={data.paymentMethod === m} onChange={() => setData({ ...data, paymentMethod: m })} />
                <span>
                  {m}
                  <small>{sub}</small>
                </span>
              </label>
            ))}
          </div>
          <div className="info-box">
            <Lock size={14} /> Prototype checkout — no payment is collected and no real order is shipped.
          </div>
        </div>
        <aside className="cart-summary">
          <h2>Your order</h2>
          <div className="mini-cart">
            {state.cart.map((c) => {
              const p = state.products.find((x) => x.id === c.productId);
              return p ? (
                <div key={c.productId + c.variant}>
                  <span className="mini-thumb">
                    <img src={p.images[0].replace('w=1100', 'w=160')} alt="" onError={onImgError} />
                    <i>{c.quantity}</i>
                  </span>
                  <span>
                    {p.name}
                    {c.variant && c.variant !== 'Standard' && <small>{c.variant}</small>}
                  </span>
                  <b>{formatCurrency(p.price * c.quantity)}</b>
                </div>
              ) : null;
            })}
          </div>
          <OrderSummary />
          <Button type="submit" disabled={submitted}>
            {submitted ? 'Allocating origin…' : 'Place order'}
          </Button>
          <small>Each unit is allocated to an actual accepted batch, oldest first.</small>
        </aside>
      </form>
    </ConsumerLayout>
  );
}

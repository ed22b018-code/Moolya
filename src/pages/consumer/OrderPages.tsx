import { useState } from 'react';
import { PackageCheck, Search, Truck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState, StatusChip } from '../../components/common';
import { ConsumerLayout } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { formatCurrency, formatDate } from '../../lib/core';
import { onImgError } from '../../data/media';
import type { Order, OrderStatus } from '../../types';

const STATUS_STEPS: OrderStatus[] = ['placed', 'packed', 'shipped', 'delivered'];

function MockQR({ value }: { value: string }) {
  const bits = Array.from({ length: 81 }, (_, i) => (value.charCodeAt(i % value.length) + i * 7) % 3 !== 0);
  return (
    <div className="mock-qr">
      <div>
        {bits.map((on, i) => (
          <i key={i} className={on ? 'on' : ''} />
        ))}
      </div>
      <small>Prototype trace code</small>
    </div>
  );
}

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const { state } = usePrototype();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order)
    return (
      <ConsumerLayout>
        <EmptyState title="Order not found" copy="This order is not in the current prototype state." />
      </ConsumerLayout>
    );
  return (
    <ConsumerLayout>
      <section className="success container">
        <div className="success-icon">
          <PackageCheck />
        </div>
        <span className="eyebrow">Order placed · {order.id}</span>
        <h1>Your order has an origin.</h1>
        <p>
          Thank you, {order.customer.name.split(' ')[0]}. Each piece is now connected to its actual accepted batch and
          maker. A confirmation would be sent to {order.customer.email}.
        </p>
        {order.items.map((item) => {
          const product = state.products.find((p) => p.id === item.productId);
          const makers = [...new Set(item.traceability.map((t) => t.producerId))];
          return makers.map((pid) => {
            const units = item.traceability.filter((t) => t.producerId === pid);
            const producer = state.producers.find((p) => p.id === pid);
            const batch = state.inventoryBatches.find((b) => b.id === units[0]?.batchId);
            return (
              <div className="origin-reveal" key={item.id + pid}>
                <img src={product?.images[0]} alt="" onError={onImgError} />
                <div>
                  <span>
                    {product?.name} · {units.length} unit{units.length > 1 ? 's' : ''} made by
                  </span>
                  <h2>{producer?.name}</h2>
                  <p>
                    {producer?.type} · {producer?.village}, {producer?.district}
                  </p>
                  <dl>
                    <div>
                      <dt>Batch</dt>
                      <dd>{batch?.id}</dd>
                    </div>
                    <div>
                      <dt>QC standard</dt>
                      <dd>{batch?.qcStandardVersion}</dd>
                    </div>
                    <div>
                      <dt>Accepted</dt>
                      <dd>{batch && formatDate(batch.acceptedAt)}</dd>
                    </div>
                    <div>
                      <dt>QC record</dt>
                      <dd>{units[0]?.qcRecordId}</dd>
                    </div>
                  </dl>
                </div>
                <MockQR value={order.id + (batch?.id || '')} />
              </div>
            );
          });
        })}
        <div className="order-totals">
          <span>Subtotal {formatCurrency(order.subtotal)}</span>
          {order.discount ? (
            <span>
              {order.couponCode} − {formatCurrency(order.discount)}
            </span>
          ) : null}
          <span>Shipping {order.shipping ? formatCurrency(order.shipping) : 'Free'}</span>
          <b>Paid via {order.paymentMethod} · Total {formatCurrency(order.total)}</b>
        </div>
        <div className="success-actions">
          <Link className="button button-primary" to={`/orders/${order.id}`}>
            Track order
          </Link>
          <Link className="button button-secondary" to="/producers">
            Meet the makers
          </Link>
          <Link className="button button-ghost" to="/shop">
            Continue shopping
          </Link>
        </div>
      </section>
    </ConsumerLayout>
  );
}

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const { state } = usePrototype();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order)
    return (
      <ConsumerLayout>
        <div className="container empty-cart">
          <EmptyState title="Order not found" copy="Check the order ID and try again." />
          <Link className="button button-primary" to="/orders">
            Look up an order
          </Link>
        </div>
      </ConsumerLayout>
    );
  const reached = STATUS_STEPS.indexOf(order.status);
  const steps: [string, boolean][] = [
    ['Order placed', true],
    ['Origin allocated & QC record attached', true],
    ['Packed at Rajamahendravaram hub', reached >= 1],
    ['Shipped', reached >= 2],
    ['Delivered', reached >= 3],
  ];
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">{order.id}</span>
          <h1>Order journey</h1>
          <p>
            Placed {formatDate(order.placedAt)} · <StatusChip status={order.status} />
          </p>
        </div>
      </section>
      <div className="container tracking">
        <div>
          <div className="journey vertical">
            {steps.map(([x, done], i) => (
              <div className={done ? 'done' : ''} key={x}>
                <i>{done ? '✓' : i + 1}</i>
                <span>
                  {x}
                  <small>{done ? 'Complete' : 'Upcoming'}</small>
                </span>
              </div>
            ))}
          </div>
          <div className="tracking-items">
            {order.items.map((item) => {
              const p = state.products.find((x) => x.id === item.productId);
              const maker = state.producers.find((x) => x.id === item.traceability[0]?.producerId);
              return (
                <Link to={`/product/${item.productId}`} key={item.id}>
                  <img src={p?.images[0].replace('w=1100', 'w=200')} alt="" onError={onImgError} />
                  <span>
                    <b>{p?.name}</b>
                    <small>
                      Qty {item.quantity} · made by {maker?.name || 'an approved maker'}
                    </small>
                  </span>
                  <b>{formatCurrency(item.unitPrice * item.quantity)}</b>
                </Link>
              );
            })}
          </div>
        </div>
        <aside>
          <Truck />
          <h2>Delivering to</h2>
          <p>
            {order.customer.name}
            <br />
            {order.shippingAddress.line}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pin}
          </p>
          <p>
            Total <b>{formatCurrency(order.total)}</b> · {order.paymentMethod}
          </p>
          <small>Status updates come from the Operations portal in this prototype.</small>
        </aside>
      </div>
    </ConsumerLayout>
  );
}

function OrderRow({ order }: { order: Order }) {
  const { state } = usePrototype();
  const first = state.products.find((p) => p.id === order.items[0]?.productId);
  const units = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <Link to={`/orders/${order.id}`} className="order-row">
      <img src={first?.images[0].replace('w=1100', 'w=200')} alt="" onError={onImgError} />
      <span>
        <b>{order.id}</b>
        <small>
          {formatDate(order.placedAt)} · {units} item{units > 1 ? 's' : ''}
        </small>
      </span>
      <StatusChip status={order.status} />
      <b>{formatCurrency(order.total)}</b>
    </Link>
  );
}

export function MyOrdersPage() {
  const { state } = usePrototype();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const mine = state.orders.filter((o) => state.myOrderIds.includes(o.id));
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Orders</span>
          <h1>Track your orders</h1>
          <form
            className="lookup"
            onSubmit={(e) => {
              e.preventDefault();
              const found = state.orders.find((o) => o.id.toLowerCase() === q.trim().toLowerCase());
              if (found) nav(`/orders/${found.id}`);
              else setErr('No order with that ID. Try ORD-2608-001 from the demo data.');
            }}
          >
            <Search size={18} />
            <input value={q} onChange={(e) => (setQ(e.target.value), setErr(''))} placeholder="Enter order ID, e.g. ORD-2608-001" aria-label="Order ID" />
            <button type="submit">Track</button>
          </form>
          {err && <p className="field-error">{err}</p>}
        </div>
      </section>
      <section className="container order-list">
        <h2>Orders placed on this device</h2>
        {mine.length ? (
          mine.map((o) => <OrderRow key={o.id} order={o} />)
        ) : (
          <div className="empty-cart">
            <EmptyState title="No orders yet" copy="Orders you place in this browser will appear here." />
            <Link className="button button-primary" to="/shop">
              Start shopping
            </Link>
          </div>
        )}
      </section>
    </ConsumerLayout>
  );
}

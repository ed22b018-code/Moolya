import { useEffect, useState, type FormEvent } from 'react';
import { BadgeCheck, ChevronDown, Minus, Plus, RotateCcw, Share2, ShoppingBag, Truck, Zap } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, QCVerifiedBadge } from '../../components/common';
import { ConsumerLayout, ProductGrid, Stars, useProductRating, WishlistButton } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { estimateDelivery, formatCurrency, formatDate, FREE_SHIPPING_THRESHOLD, getSKUInventory } from '../../lib/core';
import { onImgError } from '../../data/media';
import { cn } from '../../lib/cn';

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('accordion', open && 'open')}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}
        <ChevronDown size={18} />
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const { dispatch } = usePrototype();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ author: '', city: '', rating: 5, title: '', body: '' });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.body.trim()) return;
    dispatch({ type: 'ADD_REVIEW', payload: { ...form, productId } });
    setForm({ author: '', city: '', rating: 5, title: '', body: '' });
    setOpen(false);
  };
  if (!open)
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );
  return (
    <form className="review-form" onSubmit={submit}>
      <div className="rating-picker" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={form.rating === n}
            className={n <= form.rating ? 'on' : ''}
            onClick={() => setForm({ ...form, rating: n })}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="form-grid">
        <label>
          Name
          <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </label>
        <label>
          City
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="span-2">
          Headline
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sum it up in a few words" />
        </label>
        <label className="span-2">
          Review
          <textarea required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
      </div>
      <div className="row-actions">
        <Button type="submit">Post review</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const { state, dispatch } = usePrototype();
  const nav = useNavigate();
  const product = state.products.find((p) => p.id === id || p.skuId === id || p.slug === id);
  const [variant, setVariant] = useState(product?.variants[0] || '');
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [pin, setPin] = useState('');
  const [checkedPin, setCheckedPin] = useState('');
  const { rating, count, reviews } = useProductRating(product?.id || '');
  useEffect(() => {
    setVariant(product?.variants[0] || '');
    setQty(1);
    setActive(0);
  }, [product?.id, product?.variants]);
  if (!product)
    return (
      <ConsumerLayout>
        <EmptyState title="Product not found" copy="This pilot SKU may no longer be active." />
      </ConsumerLayout>
    );
  const sku = state.skus.find((s) => s.id === product.skuId)!;
  const stock = getSKUInventory(state, sku.id);
  const sample = state.inventoryBatches
    .filter((b) => b.skuId === sku.id && b.quantityAvailable > 0)
    .sort((a, b) => a.acceptedAt.localeCompare(b.acceptedAt))[0];
  const sampleProducer = state.producers.find((p) => p.id === sample?.producerId);
  const related = state.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const fill = related.length < 3 ? state.products.filter((p) => p.featured && p.category !== product.category).slice(0, 3 - related.length) : [];
  const delivery = checkedPin ? estimateDelivery(checkedPin) : null;
  const add = (then?: string) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id, skuId: sku.id, variant, quantity: qty } });
    if (then) nav(then);
  };
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  return (
    <ConsumerLayout>
      <nav className="container breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to={`/shop/${product.category.toLowerCase()}`}>{product.category}</Link> /{' '}
        <span>{product.name}</span>
      </nav>
      <section className="container product-detail">
        <div className="gallery">
          <div className="gallery-main">
            <img src={product.images[active]} alt={product.name} onError={onImgError} />
            <WishlistButton productId={product.id} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}>
                  <img src={src.replace('w=1100', 'w=200')} alt="" onError={onImgError} />
                </button>
              ))}
            </div>
          )}
          <span>Photos illustrate the product type; your piece is handmade and will vary slightly.</span>
        </div>
        <div className="product-info">
          <span className="eyebrow">
            {product.category} · SKU {sku.code}
          </span>
          <h1>{product.name}</h1>
          <a className="rating-link" href="#reviews">
            <Stars value={rating} /> {rating.toFixed(1)} · {count} reviews
          </a>
          <div className="price">
            {formatCurrency(product.price)} {product.compareAtPrice && <del>{formatCurrency(product.compareAtPrice)}</del>}
            {product.compareAtPrice && (
              <span className="save">Save {formatCurrency(product.compareAtPrice - product.price)}</span>
            )}
          </div>
          <small className="tax-note">Inclusive of all taxes</small>
          <p className="lead">{product.shortDescription}</p>
          {product.highlights && (
            <ul className="highlights">
              {product.highlights.map((h) => (
                <li key={h}>
                  <BadgeCheck size={16} /> {h}
                </li>
              ))}
            </ul>
          )}
          <div className="verified-panel">
            <QCVerifiedBadge />
            <p>
              {stock > 0 ? (
                <>
                  <b>{stock} verified units</b> in stock from {sku.approvedProducerIds.length} approved makers.
                  {stock <= sku.lowStockThreshold && <span className="low-stock"> Selling fast.</span>}
                </>
              ) : (
                <b>Currently sold out — new batches are in QC.</b>
              )}
            </p>
          </div>
          {product.variants.length > 1 && (
            <div className="field">
              <span className="field-label">
                {product.category === 'Handloom' && product.variants[0] === 'S' ? 'Size' : 'Option'}: <b>{variant}</b>
              </span>
              <div className="variant-row">
                {product.variants.map((v) => (
                  <button className={variant === v ? 'active' : ''} onClick={() => setVariant(v)} key={v} aria-pressed={variant === v}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="buy-row">
            <div className="quantity" aria-label="Quantity">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>
                <Minus />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(stock, qty + 1))} aria-label="Increase quantity" disabled={qty >= stock}>
                <Plus />
              </button>
            </div>
            <Button disabled={!stock || qty > stock} onClick={() => add()}>
              <ShoppingBag /> Add to cart
            </Button>
            <Button variant="dark" disabled={!stock || qty > stock} onClick={() => add('/checkout')}>
              <Zap /> Buy now
            </Button>
          </div>
          <form
            className="pin-check"
            onSubmit={(e) => {
              e.preventDefault();
              setCheckedPin(pin);
            }}
          >
            <Truck size={18} />
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter PIN code for delivery date"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              aria-label="Delivery PIN code"
            />
            <button type="submit">Check</button>
          </form>
          {checkedPin && (
            <p className={cn('pin-result', !delivery && 'error')}>
              {delivery ? (
                <>
                  Delivery by <b>{delivery.label}</b> to {checkedPin}.{' '}
                  {product.price * qty >= FREE_SHIPPING_THRESHOLD ? 'Free shipping.' : `Free shipping over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.`}
                </>
              ) : (
                'Please enter a valid 6-digit PIN code.'
              )}
            </p>
          )}
          <div className="service-row">
            <span>
              <RotateCcw size={16} /> 7-day easy returns
            </span>
            <span>
              <BadgeCheck size={16} /> Cash on delivery
            </span>
            <button
              className="text-button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).then(
                  () => dispatch({ type: 'CREATE_TOAST', payload: { id: `share-${Date.now()}`, message: 'Link copied.', tone: 'info' } }),
                  () => undefined,
                );
              }}
            >
              <Share2 size={16} /> Share
            </button>
          </div>
          <div className="accordions">
            <Accordion title="Description" defaultOpen>
              <p>{product.longDescription}</p>
            </Accordion>
            <Accordion title="Materials & dimensions">
              <dl className="spec-list">
                <div>
                  <dt>Material</dt>
                  <dd>{product.materials.join(', ')}</dd>
                </div>
                {product.dimensions && (
                  <div>
                    <dt>Size</dt>
                    <dd>{product.dimensions}</dd>
                  </div>
                )}
                <div>
                  <dt>Tolerance</dt>
                  <dd>{sku.allowedTolerance}</dd>
                </div>
              </dl>
            </Accordion>
            {product.care && (
              <Accordion title="Care">
                <p>{product.care}</p>
              </Accordion>
            )}
            <Accordion title="Quality specification">
              <ul className="checklist">
                {sku.qualityChecklist.map((c) => (
                  <li key={c}>
                    <BadgeCheck size={15} /> {c}
                  </li>
                ))}
              </ul>
              <p className="muted">Standard {sku.specificationVersion}. Only accepted units enter pooled inventory.</p>
            </Accordion>
            <Accordion title="Shipping & returns">
              <p>
                Dispatched within 1–2 days from Rajamahendravaram. Free shipping on orders over{' '}
                {formatCurrency(FREE_SHIPPING_THRESHOLD)}. Unused items can be returned within 7 days of delivery.
              </p>
            </Accordion>
          </div>
        </div>
      </section>
      <section className="container trace-preview">
        <div>
          <span className="eyebrow">Traceability</span>
          <h2>Your piece will carry its actual maker and QC batch.</h2>
          <p>Origin is allocated when you place your order, using the oldest accepted inventory first.</p>
        </div>
        <div className="origin-card sample">
          <span>Next unit would come from</span>
          <b>{sampleProducer?.name || 'Approved maker'}</b>
          <p>{sampleProducer?.village}, East Godavari</p>
          <dl>
            <div>
              <dt>Batch</dt>
              <dd>{sample?.id || '—'}</dd>
            </div>
            <div>
              <dt>QC standard</dt>
              <dd>{sample?.qcStandardVersion || sku.specificationVersion}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="container reviews" id="reviews">
        <div className="reviews-summary">
          <span className="eyebrow">Customer reviews</span>
          <h2>{rating.toFixed(1)} out of 5</h2>
          <Stars value={rating} size={18} />
          <p className="muted">Based on {count} reviews</p>
          <div className="rating-bars">
            {dist.map(({ n, c }) => (
              <div key={n}>
                <span>{n}★</span>
                <i>
                  <i style={{ width: `${reviews.length ? (c / reviews.length) * 100 : 0}%` }} />
                </i>
                <small>{c}</small>
              </div>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </div>
        <div className="review-list">
          {reviews.map((r) => (
            <article key={r.id}>
              <div className="review-head">
                <Stars value={r.rating} />
                <b>{r.title || 'Review'}</b>
              </div>
              <p>{r.body}</p>
              <small>
                {r.author}
                {r.city && `, ${r.city}`} · {formatDate(r.createdAt)}
                {r.verified && <span className="verified"> · Verified buyer</span>}
              </small>
            </article>
          ))}
        </div>
      </section>
      <section className="section container">
        <h2 className="related-title">You may also like</h2>
        <ProductGrid products={[...related, ...fill]} />
      </section>
      <div className="sticky-buy">
        <div>
          <b>{formatCurrency(product.price)}</b>
          <small>{variant}</small>
        </div>
        <Button disabled={!stock} onClick={() => add()}>
          <ShoppingBag /> Add to cart
        </Button>
      </div>
    </ConsumerLayout>
  );
}

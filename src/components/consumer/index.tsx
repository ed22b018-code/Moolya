import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, Package, Plus, Search, ShoppingBag, Star, X } from 'lucide-react';
import { MoolyaLogo, PrototypeRoleSwitcher, QCVerifiedBadge } from '../common';
import { usePrototype } from '../../hooks/usePrototype';
import { averageRating, formatCurrency, FREE_SHIPPING_THRESHOLD, getSKUInventory } from '../../lib/core';
import { onImgError } from '../../data/media';
import { cn } from '../../lib/cn';
import type { Product, SKU } from '../../types';

export function Stars({ value, size = 14, count }: { value: number; size?: number; count?: number }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? 'on' : ''} />
      ))}
      {count !== undefined && <small>({count})</small>}
    </span>
  );
}

export function useProductRating(productId: string) {
  const { state } = usePrototype();
  return useMemo(() => {
    const product = state.products.find((p) => p.id === productId);
    const own = state.reviews.filter((r) => r.productId === productId);
    const added = own.filter((r) => !r.id.startsWith('REV-'));
    // Seeded rating/count represent historical reviews; new reviews blend in.
    const baseCount = product?.reviewCount ?? 0;
    const baseRating = product?.rating ?? 0;
    const count = baseCount + added.length;
    const rating = count
      ? Math.round(((baseRating * baseCount + added.reduce((s, r) => s + r.rating, 0)) / count) * 10) / 10
      : averageRating(own.map((r) => r.rating));
    return { rating, count, reviews: own };
  }, [state.products, state.reviews, productId]);
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { state } = usePrototype();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  const results = q.trim()
    ? state.products.filter((p) =>
        [p.name, p.category, p.subcategory, ...p.materials, p.shortDescription]
          .join(' ')
          .toLowerCase()
          .includes(q.trim().toLowerCase()),
      )
    : state.products.filter((p) => p.featured).slice(0, 4);
  const go = (path: string) => {
    onClose();
    nav(path);
  };
  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onMouseDown={onClose}
    >
      <div className="search-panel" onMouseDown={(e) => e.stopPropagation()}>
        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            go(`/shop?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <Search />
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sarees, honey, baskets…"
            aria-label="Search products"
          />
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close search">
            <X />
          </button>
        </form>
        <span className="search-label">{q.trim() ? `${results.length} results` : 'Popular right now'}</span>
        <div className="search-results">
          {results.slice(0, 6).map((p) => (
            <button key={p.id} onClick={() => go(`/product/${p.id}`)}>
              <img src={p.images[0].replace('w=1100', 'w=160')} alt="" onError={onImgError} />
              <span>
                <b>{p.name}</b>
                <small>
                  {p.category} · {formatCurrency(p.price)}
                </small>
              </span>
            </button>
          ))}
          {q.trim() && !results.length && (
            <p className="muted">No products match “{q}”. Try “cotton”, “honey” or “basket”.</p>
          )}
        </div>
        {q.trim() && results.length > 0 && (
          <button className="text-link" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>
            See all results →
          </button>
        )}
      </div>
    </div>
  );
}

export function ConsumerHeader() {
  const { state } = usePrototype();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const loc = useLocation();
  const count = state.cart.reduce((s, i) => s + i.quantity, 0);
  useEffect(() => setOpen(false), [loc.pathname]);
  return (
    <>
      <div className="announcement">
        Free shipping over {formatCurrency(FREE_SHIPPING_THRESHOLD)} · Use <b>GODAVARI10</b> for 10% off your
        first order
      </div>
      <div className="top-prototype">
        <PrototypeRoleSwitcher />
      </div>
      <header className="consumer-header">
        <div className="container header-inner">
          <button
            className="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
          <Link to="/" aria-label="Moolya home">
            <MoolyaLogo />
          </Link>
          <nav className={open ? 'open' : ''}>
            <NavLink to="/shop" end>
              Shop all
            </NavLink>
            <NavLink to="/shop/handloom">Handloom</NavLink>
            <NavLink to="/shop/craft">Craft</NavLink>
            <NavLink to="/shop/natural">Honey</NavLink>
            <NavLink to="/gifting">Gifting</NavLink>
            <NavLink to="/story">How it works</NavLink>
            <NavLink to="/producers">Makers</NavLink>
            <NavLink to="/orders" className="mobile-only">
              My orders
            </NavLink>
          </nav>
          <div className="header-actions">
            <button className="icon-button" onClick={() => setSearching(true)} aria-label="Search">
              <Search />
            </button>
            <Link className="desktop-only icon-button" to="/orders" aria-label="My orders" title="My orders">
              <Package />
            </Link>
            <Link
              className="cart-link"
              to="/wishlist"
              aria-label={`Wishlist, ${state.wishlist.length} items`}
            >
              <Heart />
              {state.wishlist.length > 0 && <b>{state.wishlist.length}</b>}
            </Link>
            <Link className="cart-link" to="/cart" aria-label={`Cart, ${count} items`}>
              <ShoppingBag />
              <b>{count}</b>
            </Link>
          </div>
        </div>
      </header>
      {searching && <SearchOverlay onClose={() => setSearching(false)} />}
    </>
  );
}
export function ConsumerFooter() {
  return (
    <footer className="consumer-footer">
      <div className="container footer-grid">
        <div>
          <MoolyaLogo light />
          <p>
            Good products. Known origins.
            <br />
            Fairer economics.
          </p>
        </div>
        <div>
          <b>Shop</b>
          <Link to="/shop/handloom">Handloom</Link>
          <Link to="/shop/craft">Home &amp; craft</Link>
          <Link to="/shop/natural">Honey</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>
        <div>
          <b>Help</b>
          <Link to="/orders">Track an order</Link>
          <Link to="/story">How Moolya works</Link>
          <Link to="/producers">Our makers</Link>
          <Link to="/faq">FAQs &amp; returns</Link>
          <Link to="/gifting">Corporate gifting</Link>
        </div>
        <div>
          <b>Prototype</b>
          <Link to="/demo">Guided demo</Link>
          <Link to="/producer">Producer portal</Link>
          <Link to="/admin">Operations</Link>
          <Link to="/makers/join">Become a maker</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        © 2026 Moolya prototype · All names, prices and operating data are fictional. Photography via
        Unsplash; images illustrate product types and are not photos of the actual pilot SKUs.
      </div>
    </footer>
  );
}
export function ConsumerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ConsumerHeader />
      <main id="main">{children}</main>
      <ConsumerFooter />
    </>
  );
}

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const { state, dispatch } = usePrototype();
  const saved = state.wishlist.includes(productId);
  return (
    <button
      className={cn('wish-button', saved && 'saved', className)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'TOGGLE_WISHLIST', payload: { productId } });
      }}
    >
      <Heart size={18} />
    </button>
  );
}

export function ProductCard({ product, sku }: { product: Product; sku: SKU }) {
  const { state, dispatch } = usePrototype();
  const inventory = getSKUInventory(state, sku.id);
  const { rating, count } = useProductRating(product.id);
  const low = inventory > 0 && inventory <= sku.lowStockThreshold;
  const off = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image">
        <img src={product.images[0]} alt={product.name} loading="lazy" onError={onImgError} />
        {product.images[1] && (
          <img className="alt-image" src={product.images[1]} alt="" loading="lazy" onError={onImgError} />
        )}
        <span className="card-tags">
          {inventory === 0 ? (
            <i className="tag-out">Sold out</i>
          ) : low ? (
            <i className="tag-low">Only {inventory} left</i>
          ) : product.featured ? (
            <i>Bestseller</i>
          ) : null}
          {off > 0 && <i className="tag-off">{off}% off</i>}
        </span>
        <WishlistButton productId={product.id} />
        {inventory > 0 && product.variants.length === 1 && (
          <button
            className="quick-add"
            onClick={(e) => {
              e.preventDefault();
              dispatch({
                type: 'ADD_TO_CART',
                payload: { productId: product.id, skuId: sku.id, variant: product.variants[0], quantity: 1 },
              });
            }}
          >
            <Plus size={16} /> Quick add
          </button>
        )}
      </Link>
      <div className="product-meta">
        <div className="category-line">
          <span>{product.subcategory}</span>
          <QCVerifiedBadge />
        </div>
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price-line">
          <p>{formatCurrency(product.price)}</p>
          {product.compareAtPrice && <del>{formatCurrency(product.compareAtPrice)}</del>}
          <Stars value={rating} count={count} size={13} />
        </div>
        <small>
          {inventory} verified units from {sku.approvedProducerIds.length} approved makers
        </small>
      </div>
    </article>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  const { state } = usePrototype();
  return (
    <div className="product-grid">
      {products.map((p) => {
        const sku = state.skus.find((s) => s.id === p.skuId);
        return sku ? <ProductCard key={p.id} product={p} sku={sku} /> : null;
      })}
    </div>
  );
}
export function TrustStrip() {
  return (
    <div className="trust-strip container">
      {[
        ['QC verified', 'Every unit inspected against one standard'],
        ['Known origin', 'See the maker and batch after you order'],
        ['Fair credit', 'Makers are credited for every accepted unit'],
        ['7-day returns', 'Easy returns on unused products'],
      ].map(([x, sub], i) => (
        <div key={x}>
          <b>0{i + 1}</b>
          <span>
            {x}
            <small>{sub}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

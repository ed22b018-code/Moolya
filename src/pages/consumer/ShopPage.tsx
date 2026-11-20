import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/common';
import { ConsumerLayout, ProductGrid } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { getSKUInventory } from '../../lib/core';
import { cn } from '../../lib/cn';

const categoryCopy: Record<string, [string, string]> = {
  all: ['Shop all products', 'Every product follows a shared specification before it enters the Moolya pool.'],
  handloom: ['Handloom', 'Shirts, sarees, stoles and home linen woven on looms across East Godavari.'],
  craft: ['Home & Craft', 'Palm-leaf baskets and hand-finished wood, made by artisans and self-help groups.'],
  natural: ['Honey & Natural', 'Raw, small-batch honey tested for moisture and dated by batch.'],
};

export function ShopPage({ category }: { category?: string }) {
  const { state } = usePrototype();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const search = params.get('q') || '';
  const cat = (category || params.get('category') || 'all').toLowerCase();
  const min = Number(params.get('min') || 0);
  const max = Number(params.get('max') || 0) || Infinity;
  const available = params.get('available') === '1';
  const onSale = params.get('sale') === '1';
  const sort = params.get('sort') || 'featured';
  const products = useMemo(
    () =>
      state.products
        .filter(
          (p) =>
            p.active &&
            (cat === 'all' || p.category.toLowerCase() === cat) &&
            [p.name, p.category, p.subcategory, p.shortDescription, ...p.materials]
              .join(' ')
              .toLowerCase()
              .includes(search.toLowerCase()) &&
            p.price >= min &&
            p.price <= max &&
            (!available || getSKUInventory(state, p.skuId) > 0) &&
            (!onSale || !!p.compareAtPrice),
        )
        .sort((a, b) =>
          sort === 'low'
            ? a.price - b.price
            : sort === 'high'
              ? b.price - a.price
              : sort === 'rating'
                ? b.rating - a.rating
                : Number(b.featured) - Number(a.featured),
        ),
    [state, cat, min, max, available, onSale, search, sort],
  );
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  };
  const activeFilters = [search && 'q', params.get('min') && 'min', params.get('max') && 'max', available && 'available', onSale && 'sale'].filter(Boolean) as string[];
  const [title, copy] = categoryCopy[cat] || [cat, ''];
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Pilot collection</span>
          <h1>{title}</h1>
          <p>{copy}</p>
          <div className="chip-row">
            {(['all', 'handloom', 'craft', 'natural'] as const).map((c) => (
              <Link
                key={c}
                to={c === 'all' ? `/shop${params.toString() ? `?${params}` : ''}` : `/shop/${c}${params.toString() ? `?${params}` : ''}`}
                className={cn('chip', cat === c && 'active')}
              >
                {c === 'all' ? 'All' : categoryCopy[c][0]}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container shop-layout">
        <aside className={cn('filters', filtersOpen && 'open')}>
          <div className="filters-head">
            <h3>Filter</h3>
            <button className="icon-button mobile-only" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X />
            </button>
          </div>
          <label>
            Search
            <div className="search-input">
              <Search />
              <input value={search} onChange={(e) => set('q', e.target.value)} placeholder="Product, material…" />
            </div>
          </label>
          <div className="field-row">
            <label>
              Min ₹
              <input type="number" min={0} inputMode="numeric" value={params.get('min') || ''} onChange={(e) => set('min', e.target.value)} />
            </label>
            <label>
              Max ₹
              <input type="number" min={0} inputMode="numeric" value={params.get('max') || ''} onChange={(e) => set('max', e.target.value)} />
            </label>
          </div>
          <div className="price-presets">
            {[
              ['Under ₹500', '', '500'],
              ['₹500–1,000', '500', '1000'],
              ['₹1,000+', '1000', ''],
            ].map(([l, a, b]) => (
              <button
                key={l}
                className={cn('chip', params.get('min') === (a || null) && params.get('max') === (b || null) && 'active')}
                onClick={() => {
                  const n = new URLSearchParams(params);
                  if (a) n.set('min', a);
                  else n.delete('min');
                  if (b) n.set('max', b);
                  else n.delete('max');
                  setParams(n, { replace: true });
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={available} onChange={(e) => set('available', e.target.checked ? '1' : '')} /> In stock only
          </label>
          <label className="check">
            <input type="checkbox" checked={onSale} onChange={(e) => set('sale', e.target.checked ? '1' : '')} /> On offer
          </label>
          <p className="filter-note">Every product shown is QC-verified against a shared specification.</p>
          {activeFilters.length > 0 && (
            <button
              className="button button-ghost"
              onClick={() => {
                const n = new URLSearchParams(params);
                activeFilters.forEach((k) => n.delete(k));
                setParams(n, { replace: true });
              }}
            >
              Clear filters
            </button>
          )}
        </aside>
        <div className="shop-results">
          <div className="result-bar">
            <button className="button button-secondary mobile-only filter-toggle" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} /> Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}
            </button>
            <span>
              {products.length} product{products.length === 1 ? '' : 's'}
              {search && <> for “{search}”</>}
            </span>
            <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort products">
              <option value="featured">Featured</option>
              <option value="rating">Top rated</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <EmptyState title="No matching products" copy="Try widening your price range or clearing a filter." />
          )}
        </div>
      </section>
    </ConsumerLayout>
  );
}
export function CategoryPage() {
  const { category } = useParams();
  return <ShopPage category={category} />;
}

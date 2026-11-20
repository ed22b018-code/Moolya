import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, ChevronDown, Search, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common';
import { ConsumerLayout, ProductGrid } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { onImgError, scenes, unsplash } from '../../data/media';
import { cn } from '../../lib/cn';

export function HowMoolyaWorksPage() {
  const steps: [string, string, string, string][] = [
    ['01', 'Demand-selected SKU', 'We begin with a product requirement shaped by buyer demand, maker capability and repeatable quality.', scenes.loomThreads],
    ['02', 'Approved production', 'Multiple makers produce against the same material, measurement and finish standard.', scenes.womanWeaving],
    ['03', 'QC and credit', 'Accepted units enter the pool and immediately create a maker credit. Rework stays outside inventory.', scenes.artisanAtWork],
    ['04', 'Pooled fulfilment', 'Orders draw from the oldest accepted batch first, while each unit keeps its exact origin.', scenes.loomRoom],
  ];
  return (
    <ConsumerLayout>
      <section className="page-hero image-hero">
        <img src={unsplash(scenes.communityLoom, 1800, 800)} alt="" onError={onImgError} />
        <div className="container">
          <span className="eyebrow">The operating model</span>
          <h1>
            Commerce that remembers
            <br />
            how a product was made.
          </h1>
          <p>
            Moolya starts with demand, gives approved makers one shared standard, credits only accepted work, and keeps
            origin attached through sale.
          </p>
        </div>
      </section>
      <section className="container story-steps photo-steps">
        {steps.map(([n, t, c, img]) => (
          <article key={n}>
            <img src={unsplash(img, 700, 460)} alt="" loading="lazy" onError={onImgError} />
            <b>{n}</b>
            <h2>{t}</h2>
            <p>{c}</p>
          </article>
        ))}
      </section>
      <section className="section container compare">
        <h2>What changes for each side</h2>
        <div className="compare-grid">
          <div>
            <h3>For customers</h3>
            <ul>
              <li><BadgeCheck size={16} /> One consistent product, whichever maker made it</li>
              <li><BadgeCheck size={16} /> The maker, batch and QC record of your exact piece</li>
              <li><BadgeCheck size={16} /> Honest pricing with transparent maker credit</li>
            </ul>
          </div>
          <div>
            <h3>For makers</h3>
            <ul>
              <li><BadgeCheck size={16} /> Clear demand before they produce</li>
              <li><BadgeCheck size={16} /> Credit on acceptance, not on eventual sale</li>
              <li><BadgeCheck size={16} /> Specific rework feedback instead of rejection</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="principle">
        <div className="container">
          <Waves />
          <h2>One shared standard is the bridge.</h2>
          <p>It lets a customer buy one reliable SKU while independent makers keep their production records and fair credit.</p>
          <Link className="button button-light" to="/demo">
            Walk through the live demo <ArrowRight />
          </Link>
        </div>
      </section>
    </ConsumerLayout>
  );
}

const PAGE = 12;
export function ProducersPage() {
  const { state } = usePrototype();
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [village, setVillage] = useState('All');
  const [shown, setShown] = useState(PAGE);
  const villages = useMemo(() => ['All', ...new Set(state.producers.map((p) => p.village))], [state.producers]);
  const list = state.producers.filter(
    (p) =>
      (type === 'All' || p.type === type) &&
      (village === 'All' || p.village === village) &&
      [p.name, p.village, ...p.skills].join(' ').toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <ConsumerLayout>
      <section className="page-hero image-hero">
        <img src={unsplash(scenes.riverBoat, 1800, 800)} alt="" onError={onImgError} />
        <div className="container">
          <span className="eyebrow">{state.producers.length} approved makers</span>
          <h1>Known makers. Shared standards.</h1>
          <p>Weavers, artisans and self-help groups across {villages.length - 1} villages of the East Godavari pilot.</p>
        </div>
      </section>
      <section className="container maker-stats">
        {(['Weaver', 'Artisan', 'SHG'] as const).map((t) => (
          <div key={t}>
            <b>{state.producers.filter((p) => p.type === t).length}</b>
            <span>{t === 'SHG' ? 'Self-help groups' : `${t}s`}</span>
          </div>
        ))}
        <div>
          <b>
            {Math.round(state.producers.reduce((s, p) => s + p.qcAcceptanceRate, 0) / state.producers.length)}%
          </b>
          <span>Avg. QC acceptance</span>
        </div>
      </section>
      <section className="container directory-filters">
        <div className="search-input">
          <Search />
          <input value={q} onChange={(e) => (setQ(e.target.value), setShown(PAGE))} placeholder="Search by name, village or skill" />
        </div>
        <div className="chip-row">
          {['All', 'Weaver', 'Artisan', 'SHG'].map((t) => (
            <button key={t} className={cn('chip', type === t && 'active')} onClick={() => (setType(t), setShown(PAGE))}>
              {t === 'SHG' ? 'Self-help groups' : t === 'All' ? 'All types' : `${t}s`}
            </button>
          ))}
        </div>
        <select value={village} onChange={(e) => (setVillage(e.target.value), setShown(PAGE))} aria-label="Filter by village">
          {villages.map((v) => (
            <option key={v} value={v}>
              {v === 'All' ? 'All villages' : v}
            </option>
          ))}
        </select>
      </section>
      <section className="container producer-directory">
        {list.slice(0, shown).map((p, i) => (
          <article key={p.id}>
            <div className={`avatar avatar-${i % 3}`}>{p.name.split(' ').pop()?.[0]}</div>
            <div>
              <span>
                {p.type} · {p.yearsExperience} yrs
              </span>
              <h3>{p.name}</h3>
              <p>
                {p.village} · {p.skills.join(', ')}
              </p>
              <b>{p.qcAcceptanceRate}% QC acceptance</b>
              <small>
                Makes:{' '}
                {p.approvedSkuIds
                  .map((id) => state.products.find((x) => x.skuId === id)?.name.replace('East Godavari ', ''))
                  .filter(Boolean)
                  .join(', ')}
              </small>
            </div>
          </article>
        ))}
      </section>
      {!list.length && <EmptyState title="No makers match" copy="Try a different village or clear the search." />}
      {shown < list.length && (
        <div className="load-more">
          <button className="button button-secondary" onClick={() => setShown(shown + PAGE)}>
            Show more makers ({list.length - shown} more)
          </button>
        </div>
      )}
    </ConsumerLayout>
  );
}

export function WishlistPage() {
  const { state } = usePrototype();
  const products = state.wishlist.map((id) => state.products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Saved for later</span>
          <h1>Wishlist</h1>
        </div>
      </section>
      <section className="container section-tight">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="empty-cart">
            <EmptyState title="Nothing saved yet" copy="Tap the heart on any product to save it here." />
            <Link className="button button-primary" to="/shop">
              Browse the collection
            </Link>
          </div>
        )}
      </section>
    </ConsumerLayout>
  );
}

const faqs: [string, string][] = [
  ['What does “QC verified” mean?', 'Every unit is inspected against the SKU’s shared specification—material, measurements, finish, damage, colour and packaging—before it can be sold. Units that need rework go back to the maker with specific feedback.'],
  ['How do I find out who made my product?', 'When you place an order, Moolya allocates each unit to a real accepted batch (oldest first). The confirmation page and your order page show the maker, village, batch and QC record.'],
  ['How are makers paid?', 'Makers are credited the agreed producer rate as soon as their units pass QC—not when the product eventually sells. Credits are then paid out and tracked separately.'],
  ['Why do handmade pieces vary slightly?', 'Each piece is made by hand. The shared standard keeps size, material and finish within a set tolerance, but small variations in weave, grain or colour are natural.'],
  ['What is your returns policy?', 'Unused products in their original packaging can be returned within 7 days of delivery. Honey cannot be returned once opened for hygiene reasons.'],
  ['Which payment methods do you accept?', 'UPI, credit and debit cards, and cash on delivery. In this prototype no payment is actually collected.'],
  ['Do you ship across India?', 'Yes. Orders dispatch from Rajamahendravaram within 1–2 days. Andhra Pradesh deliveries usually arrive in 2–3 days and the rest of India in 4–6 days.'],
  ['Is this a real store?', 'Not yet. Moolya is a working prototype. Products, makers, prices and orders are fictional, and the photos illustrate product types rather than actual pilot SKUs.'],
];
export function FAQPage() {
  const [open, setOpen] = useState(0);
  return (
    <ConsumerLayout>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Help centre</span>
          <h1>Frequently asked questions</h1>
        </div>
      </section>
      <section className="container faq-list">
        {faqs.map(([q, a], i) => (
          <div key={q} className={cn('accordion', open === i && 'open')}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {q}
              <ChevronDown size={18} />
            </button>
            {open === i && <div className="accordion-body">{a}</div>}
          </div>
        ))}
        <p className="muted">
          Still have a question? <Link to="/orders" className="text-link">Track an order</Link> or explore{' '}
          <Link to="/story" className="text-link">how Moolya works</Link>.
        </p>
      </section>
    </ConsumerLayout>
  );
}

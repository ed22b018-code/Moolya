import { ArrowRight, BadgeCheck, ChevronRight, Quote, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DemoDisclaimer, PrototypeDataLabel, QCVerifiedBadge, SectionHeading } from '../../components/common';
import { ConsumerLayout, ProductGrid, TrustStrip } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { getSKUInventory } from '../../lib/core';
import { onImgError, productPhotos, scenes, unsplash } from '../../data/media';

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

export function HomePage() {
  const { state } = usePrototype();
  const featured = state.products.filter((p) => p.featured).slice(0, 6);
  const h001 = state.skus.find((s) => s.id === 'H001')!;
  const producers = state.producers.slice(0, 3);
  const accepted = state.qcRecords.reduce((s, q) => s + q.accepted, 0);
  const inspected = state.qcRecords.reduce((s, q) => s + q.accepted + q.rework + q.rejected, 0);
  const acceptance = inspected ? Math.round((accepted / inspected) * 100) : 0;
  return (
    <ConsumerLayout>
      <section className="hero">
        <div className="container hero-grid">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <span className="eyebrow">Handmade in East Godavari</span>
            <h1>
              Good products.
              <br />
              Known origins.
              <br />
              <em>One quality standard.</em>
            </h1>
            <p>
              Handloom, craft and raw honey from East Godavari’s weavers, artisans and self-help groups—checked
              against one shared standard, with the maker of your exact piece revealed when you order.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/shop">
                Shop the collection <ArrowRight />
              </Link>
              <Link className="button button-secondary" to="/story">
                How Moolya works
              </Link>
            </div>
          </motion.div>
          <div className="hero-visual">
            <img className="hero-shirt" src={unsplash(scenes.weaverAtLoom, 900, 1000)} alt="A weaver at a handloom" onError={onImgError} />
            <img className="hero-honey" src={unsplash(productPhotos.N001[0], 500, 560)} alt="A jar of raw honey" onError={onImgError} />
            <img className="hero-craft" src={unsplash(productPhotos.C001[0], 500, 500)} alt="Hand-coiled palm baskets" onError={onImgError} />
            <div className="hero-stat">
              <b>{acceptance}%</b>
              <span>QC acceptance</span>
              <PrototypeDataLabel />
            </div>
          </div>
        </div>
        <div className="container hero-metrics">
          <div>
            <strong>{state.products.length}</strong>
            <span>Pilot products</span>
          </div>
          <div>
            <strong>{state.producers.length}</strong>
            <span>Approved makers</span>
          </div>
          <div>
            <strong>{state.inventoryBatches.length}</strong>
            <span>QC’d batches in stock</span>
          </div>
        </div>
      </section>
      <section className="flow-section">
        <div className="container flow-row">
          {['Demand', 'Makers', 'Quality check', 'Pooled stock', 'Your home'].map((x, i) => (
            <div key={x}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b>{x}</b>
              {i < 4 && <ChevronRight />}
            </div>
          ))}
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="Shop by category"
          title="Made with place and purpose."
          copy="A deliberately small collection, selected for demand and standardised for shared production."
        />
        <div className="category-grid">
          {(
            [
              ['handloom', 'Handloom', 'Shirts, sarees, stoles and home linen', productPhotos.H003[0]],
              ['craft', 'Home & Craft', 'Useful objects, finished by hand', productPhotos.C001[1]],
              ['natural', 'Honey & Natural', 'Small-batch honey with known origins', productPhotos.N001[1]],
            ] as const
          ).map(([slug, name, copy, img]) => (
            <motion.div {...fade} key={slug}>
              <Link to={`/shop/${slug}`} className="category-card">
                <img src={unsplash(img, 800, 1000)} alt="" loading="lazy" onError={onImgError} />
                <div>
                  <span>
                    {state.products.filter((p) => p.category.toLowerCase() === slug).length} products · Explore
                  </span>
                  <h3>{name}</h3>
                  <p>{copy}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="Bestsellers"
          title="Products with a known operating story."
          action={
            <Link className="text-link" to="/shop">
              View all <ArrowRight />
            </Link>
          }
        />
        <ProductGrid products={featured} />
      </section>
      <section className="section woven-section">
        <div className="container two-col">
          <motion.div {...fade}>
            <span className="eyebrow">One SKU, many makers</span>
            <h2>One shirt. Multiple approved makers. One shared specification.</h2>
            <p>
              Moolya pools accepted pieces into a single verified inventory—without losing the identity of the
              person who made each unit.
            </p>
            <Link className="text-link" to="/product/H001-product-id">
              Explore the Godavari shirt <ArrowRight />
            </Link>
          </motion.div>
          <div className="network">
            <div className="network-center">
              H001<small>Shared standard</small>
            </div>
            {['Lakshmi', 'Ravi', 'Anitha', 'Suresh'].map((n, i) => (
              <div key={n} className={`node node-${i}`}>
                {n}
              </div>
            ))}
            <div className="network-qc">
              <ShieldCheck /> Moolya QC
            </div>
            <div className="network-stock">
              {getSKUInventory(state, 'H001')} <small>verified units</small>
            </div>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading eyebrow="How we choose" title="Selected for demand, not uploaded at random." />
        <div className="criteria-grid">
          {[
            ['Consumer demand', 'Is there a clear buyer need?'],
            ['Maker capability', 'Can approved makers produce it well?'],
            ['Quality repeatability', 'Can one standard be repeated?'],
            ['Unit economics', 'Does value flow fairly to the maker?'],
            ['Shipping suitability', 'Will it travel safely?'],
            ['Repeat potential', 'Will customers come back for it?'],
          ].map(([a, b], i) => (
            <div key={a}>
              <span>0{i + 1}</span>
              <h3>{a}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section sku-story">
        <div className="container story-grid">
          <img src={unsplash(scenes.womanWeaving, 1000, 1100)} alt="A weaver working at a handloom" loading="lazy" onError={onImgError} />
          <div>
            <span className="eyebrow">Featured SKU story</span>
            <div className="sku-code">
              SKU H001 <QCVerifiedBadge />
            </div>
            <h2>Godavari Everyday Cotton Shirt</h2>
            <p>
              Approved makers work to the same material, measurement and finish specification. Every accepted
              unit enters one inventory pool; every dispatched unit keeps its actual origin.
            </p>
            <div className="fact-row">
              <div>
                <b>{h001.approvedProducerIds.length}</b>
                <span>Approved makers</span>
              </div>
              <div>
                <b>{getSKUInventory(state, 'H001')}</b>
                <span>Pooled units</span>
              </div>
              <div>
                <b>{h001.specificationVersion}</b>
                <span>QC standard</span>
              </div>
            </div>
            <Link className="button button-primary" to="/product/H001-product-id">
              View the shirt
            </Link>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading eyebrow="From requirement to doorstep" title="Every order follows the same six steps." />
        <div className="journey">
          {['Requirement', 'Produced', 'QC', 'Pooled', 'Ordered', 'Delivered'].map((x, i) => (
            <div key={x}>
              <i>{i + 1}</i>
              <span>{x}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section place-band">
        <img src={unsplash(scenes.godavariBridge, 1800, 700)} alt="Bridges across the Godavari at Rajamahendravaram" loading="lazy" onError={onImgError} />
        <div className="container">
          <span className="eyebrow">The place</span>
          <h2>Rooted along the Godavari.</h2>
          <p>
            From the looms of Mandapeta to the palm-weavers of Konaseema and the beekeepers at the forest edge,
            the pilot works with makers across nine villages of the district.
          </p>
          <Link className="button button-light" to="/producers">
            Meet the makers <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="section container">
        <SectionHeading eyebrow="The people behind the pool" title="Maker records stay connected." />
        <div className="producer-cards">
          {producers.map((p, i) => (
            <article key={p.id}>
              <div className={`avatar avatar-${i}`}>{p.name.split(' ').pop()?.[0]}</div>
              <span>
                {p.type} · {p.yearsExperience} years
              </span>
              <h3>{p.name}</h3>
              <p>{p.village}, East Godavari</p>
              <div>
                <BadgeCheck /> {p.qcAcceptanceRate}% QC acceptance
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section testimonials">
        <div className="container">
          <SectionHeading eyebrow="What customers say" title="Quality you can trace." />
          <div className="testimonial-grid">
            {state.reviews
              .filter((r) => r.rating === 5)
              .slice(0, 3)
              .map((r) => (
                <figure key={r.id}>
                  <Quote />
                  <blockquote>{r.body}</blockquote>
                  <figcaption>
                    <b>{r.author}</b> · {r.city}
                    <small>
                      on {state.products.find((p) => p.id === r.productId)?.name}
                    </small>
                  </figcaption>
                </figure>
              ))}
          </div>
        </div>
      </section>
      <TrustStrip />
      <DemoDisclaimer />
    </ConsumerLayout>
  );
}

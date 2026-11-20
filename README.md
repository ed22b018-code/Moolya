# Moolya

**Good products. Known origins. Fairer economics.**

Moolya is a local, presentation-ready D2C aggregation prototype for East Godavari producers, artisans, weavers and self-help groups. It demonstrates a connected operating loop rather than a conventional marketplace:

`Consumer demand → SKU requirement → Producer supply → QC → Producer credit → Pooled inventory → Consumer order → Batch/producer traceability`

All names, prices, orders, producers and operating figures are fictional prototype data. Product photography is served from the Unsplash CDN (Unsplash License) and illustrates product types, not the actual pilot SKUs.

## What's new in v3 (end-semester)

- **Unit economics** (`/admin/economics`): per-SKU cost waterfall (GST, maker payout, collection & QC, packaging, courier, payment fees, returns, marketing), adjustable assumptions and monthly break-even. Shows that small honey jars lose money alone and must be bundled.
- **Where your money goes** on every product page: an open, indicative price split with the maker’s share.
- **Corporate & bulk gifting** (`/gifting`) with hampers and a quote form, plus an Operations enquiry pipeline (`/admin/enquiries`: new → quoted → won/lost).
- **Become a maker** (`/makers/join`) applications and an approval queue (`/admin/applications`) that adds approved makers to the network and to chosen SKUs.
- **Pilot readiness** (`/admin/readiness`): 15 launch dependencies by area and owner.
- Tests: `tests/growth.ts` covers the economics model, enquiries, maker approval and readiness.

## What's new in v2

- **Real photography** for every product (2–3 images each with gallery thumbnails and hover swap), plus photo-led home, story and makers pages.
- **Shopper features:** live search overlay, wishlist, star ratings and customer reviews (write your own; purchasers are marked verified), related products, PIN-code delivery estimates, Buy now, share link, product details/care/spec accordions, correct per-product variants (sizes only on the shirt).
- **Cart & checkout:** coupon codes (`GODAVARI10`, `MAKERS15`), free-shipping progress bar, save for later, inline form validation (Indian mobile, PIN, email), order summary with thumbnails.
- **Orders:** confirmation reveals the maker, batch and QC record for *every* item (not just the first), status-driven tracking page, “My orders” with order-ID lookup. Operations can advance order status (placed → packed → shipped → delivered) and filter orders.
- **Makers directory:** search, filter by type and village, all 63 makers with “show more”.
- **Quality:** FAQ/returns page, page titles per route, scroll-to-top on navigation, mobile filter drawer and sticky buy bar, reduced-motion support, image fallbacks, and portal code-splitting (main bundle ~485 KB, down from ~913 KB).
- **Safe upgrades:** state is stored under `moolya-prototype-v2` and older saved state is migrated or discarded instead of crashing.

## Why there are three portals

- **Consumer storefront** presents a concise pilot collection with shared quality standards, pooled stock and post-order origin reveal.
- **Producer portal** shows approved demand, standards, submissions, rework feedback and the credited/paid/pending ledger for S. Lakshmi.
- **Operations portal** controls SKU requirements, QC acceptance, pooled batches, producer credits, orders and state-derived analytics.

All portals use the same reducer-backed `PrototypeState` and persist to `localStorage` under `moolya-prototype-v1`.

## Tech stack

- React 19 + TypeScript
- Vite 8
- React Router
- Framer Motion
- Lucide React
- Recharts
- `clsx` + `tailwind-merge`
- Handwritten responsive CSS and local product SVG artwork

No backend, remote database, auth provider, payment API, map API, image API or AI API is used.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL in the terminal (normally `http://localhost:5173`).

Production build:

```bash
npm run build
```

Lint and tests:

```bash
npm run lint
npm run test:flow   # operations acceptance flow + shopper flow
```

## Deploying

The app is a static SPA. `vercel.json` (Vercel) and `public/_redirects` (Netlify) route every path to `index.html` so deep links such as `/product/H001-product-id` work on refresh.

## Architecture

- `src/app/` — router, provider, typed actions and connected reducer
- `src/data/` — deterministic seed state and Telugu translation subset
- `src/types/` — strict domain model
- `src/lib/` — inventory allocation, currency, ledger and storage helpers
- `src/components/` — common design system and portal shells
- `src/pages/consumer/` — storefront, cart, checkout and origin reveal
- `src/pages/producer/` — demand, submission, QC and earnings views
- `src/pages/admin/` — operations, QC, inventory, payouts and analytics
- `src/data/media.ts` — Unsplash photo IDs for products and scenes

## Routes

Consumer: `/gifting`, `/makers/join`, `/`, `/shop`, `/shop/:category`, `/product/:id`, `/cart`, `/checkout`, `/order-success/:orderId`, `/orders`, `/orders/:orderId`, `/wishlist`, `/faq`, `/story`, `/producers`

Producer: `/producer`, `/producer/demand`, `/producer/submit`, `/producer/submissions`, `/producer/quality`, `/producer/earnings`, `/producer/profile`

Operations: `/admin`, `/admin/skus`, `/admin/skus/:skuId`, `/admin/demand`, `/admin/qc`, `/admin/inventory`, `/admin/producers`, `/admin/producers/:producerId`, `/admin/payouts`, `/admin/orders`, `/admin/analytics`, `/admin/economics`, `/admin/enquiries`, `/admin/applications`, `/admin/readiness`

Walkthrough: `/demo`

## Prototype state model

The provider owns products, SKUs, producers, submissions, QC records, inventory batches, orders, payouts, demand requirements, cart state, portal role, selected producer, language and toast messages. The reducer implements cart operations, submission creation, QC processing, order creation, demand changes, SKU creation, payouts and a full prototype reset.

Corrupt or missing browser storage safely falls back to the deterministic seed state: 63 producers, 10 SKUs/products, 25 submissions, 20 QC records, 15 inventory batches, 10 payout records and 20 orders.

## Demo scenario

Open `/demo` for the guided stakeholder view, or run the connected flow manually:

1. Initial H001 inventory is 42. Open `/admin/qc` and select Lakshmi’s pending eight-unit H001 submission.
2. Enter 7 accepted, 1 rework and 0 rejected, then complete QC.
3. H001 inventory becomes 49; Lakshmi receives a ₹5,040 credit; the one rework unit appears in her quality view.
4. Open `/product/H001-product-id`, add one shirt, check out and place the prototype order.
5. H001 inventory becomes 48. The order success screen reveals the actual FIFO batch, producer and QC record.
6. Open `/admin/payouts`, locate the new Lakshmi credit and mark it paid. Her producer ledger moves that amount from pending to paid.

## How QC changes state

QC requires accepted + rework + rejected to equal the submitted quantity. Accepted units create a `QCRecord`, a new `InventoryBatch`, a producer credit, updated producer aggregates and updated accepted/remaining demand. Rework and rejected units do not enter inventory.

## How traceability is allocated

Checkout verifies pooled stock, allocates each order item from available batches FIFO by acceptance date, decrements batch availability, and writes unit-level `{ batchId, producerId, qcRecordId }` trace records onto the order. No batch is promised before purchase.

## Resetting the demo

Use the reset icon in the **Prototype mode** switcher or the **Reset demo** button on `/demo`. This restores the complete deterministic starting state and overwrites persisted prototype changes.

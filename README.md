# Moolya

**Good products. Known origins. Fairer economics.**

Moolya is a local, presentation-ready D2C aggregation prototype for East Godavari producers, artisans, weavers and self-help groups. It demonstrates a connected operating loop rather than a conventional marketplace:

`Consumer demand → SKU requirement → Producer supply → QC → Producer credit → Pooled inventory → Consumer order → Batch/producer traceability`

All names, prices, orders, producers and operating figures are fictional prototype data.

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

Lint:

```bash
npm run lint
```

## Architecture

- `src/app/` — router, provider, typed actions and connected reducer
- `src/data/` — deterministic seed state and Telugu translation subset
- `src/types/` — strict domain model
- `src/lib/` — inventory allocation, currency, ledger and storage helpers
- `src/components/` — common design system and portal shells
- `src/pages/consumer/` — storefront, cart, checkout and origin reveal
- `src/pages/producer/` — demand, submission, QC and earnings views
- `src/pages/admin/` — operations, QC, inventory, payouts and analytics
- `public/mock-products/` — ten custom local SVG product illustrations

## Routes

Consumer: `/`, `/shop`, `/shop/:category`, `/product/:id`, `/cart`, `/checkout`, `/order-success/:orderId`, `/orders/:orderId`, `/story`, `/producers`

Producer: `/producer`, `/producer/demand`, `/producer/submit`, `/producer/submissions`, `/producer/quality`, `/producer/earnings`, `/producer/profile`

Operations: `/admin`, `/admin/skus`, `/admin/skus/:skuId`, `/admin/demand`, `/admin/qc`, `/admin/inventory`, `/admin/producers`, `/admin/producers/:producerId`, `/admin/payouts`, `/admin/orders`, `/admin/analytics`

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

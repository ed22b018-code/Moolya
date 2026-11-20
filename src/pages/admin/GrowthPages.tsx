import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Mail, Phone, RotateCcw, UserPlus } from 'lucide-react';
import { AdminShell } from '../../components/admin';
import { Button, EmptyState, MetricCard, SectionHeading, StatusChip } from '../../components/common';
import { usePrototype } from '../../hooks/usePrototype';
import { formatCurrency, formatDate } from '../../lib/core';
import {
  breakEvenOrders,
  defaultAssumptions,
  unitEconomics,
  type CostAssumptions,
} from '../../lib/economics';
import { cn } from '../../lib/cn';
import type { EnquiryStatus, ReadinessStatus } from '../../types';

const sliders: [keyof CostAssumptions, string, number, number, number, (v: number) => string][] = [
  ['cacPerOrder', 'Marketing cost per order (CAC)', 0, 600, 10, (v) => formatCurrency(v)],
  ['unitsPerOrder', 'Units per order', 1, 4, 0.1, (v) => v.toFixed(1)],
  ['returnRatePct', 'Return rate', 0, 25, 1, (v) => `${v}%`],
  ['shippingPerOrder', 'Courier cost per order', 40, 200, 5, (v) => formatCurrency(v)],
  ['collectionQc', 'Collection & QC per unit', 0, 100, 5, (v) => formatCurrency(v)],
  ['paymentPct', 'Payment fees', 0, 4, 0.1, (v) => `${v.toFixed(1)}%`],
  ['fixedMonthly', 'Fixed cost per month', 50000, 500000, 10000, (v) => formatCurrency(v)],
];

const rupees = (v: number) => `${v < 0 ? '−' : ''}${formatCurrency(Math.abs(Math.round(v)))}`;

export function AdminEconomicsPage() {
  const { state } = usePrototype();
  const [a, setA] = useState<CostAssumptions>(defaultAssumptions);
  const [selected, setSelected] = useState('H001');
  const rows = useMemo(
    () =>
      state.skus.map((sku) => {
        const product = state.products.find((p) => p.id === sku.productId)!;
        return { sku, product, e: unitEconomics(product.price, sku.producerRate, sku.category, a) };
      }),
    [state.skus, state.products, a],
  );
  // Blend by planned demand: each SKU's share of target units.
  const totalTarget = rows.reduce((s, r) => s + r.sku.targetDemand, 0);
  const blendedPerUnit = rows.reduce((s, r) => s + r.e.contribution * (r.sku.targetDemand / totalTarget), 0);
  const blendedPrice = rows.reduce((s, r) => s + r.product.price * (r.sku.targetDemand / totalTarget), 0);
  const blendedMaker = rows.reduce(
    (s, r) => s + r.e.makerShareOfPrice * (r.sku.targetDemand / totalTarget),
    0,
  );
  const perOrder = blendedPerUnit * a.unitsPerOrder;
  const be = breakEvenOrders(perOrder, a.fixedMonthly);
  const sel = rows.find((r) => r.sku.id === selected) || rows[0];
  const maxAbs = Math.max(...sel.e.lines.map((l) => Math.abs(l.amount)));
  const losing = rows.filter((r) => r.e.contribution < 0);
  return (
    <AdminShell title="Unit economics">
      <SectionHeading
        eyebrow="Indicative model · all figures are assumptions"
        title={
          perOrder > 0
            ? `${rupees(perOrder)} contribution per order at these assumptions`
            : 'Orders lose money at these assumptions'
        }
        copy="Retail prices are GST-inclusive. Move the assumptions to see which SKUs carry the model and how many orders cover fixed costs."
        action={
          <Button variant="secondary" onClick={() => setA(defaultAssumptions)}>
            <RotateCcw size={15} /> Reset assumptions
          </Button>
        }
      />
      <div className="metrics four">
        <MetricCard
          label="Blended price per unit"
          value={formatCurrency(Math.round(blendedPrice))}
          note="Weighted by planned demand"
        />
        <MetricCard
          label="Maker share of price"
          value={`${Math.round(blendedMaker)}%`}
          note="Paid on QC acceptance"
        />
        <MetricCard
          label="Contribution per order"
          value={rupees(perOrder)}
          note={`${a.unitsPerOrder.toFixed(1)} units per order`}
        />
        <MetricCard
          label="Break-even orders / month"
          value={Number.isFinite(be) ? be.toLocaleString('en-IN') : 'Not reached'}
          note={Number.isFinite(be) ? `≈ ${Math.ceil(be / 30)} orders a day` : 'Contribution is negative'}
        />
      </div>
      <div className="econ-layout">
        <section className="panel econ-assumptions">
          <h3>Assumptions</h3>
          {sliders.map(([key, label, min, max, step, fmt]) => (
            <label key={key}>
              <span>
                {label}
                <b>{fmt(a[key])}</b>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={a[key]}
                onChange={(e) => setA({ ...a, [key]: Number(e.target.value) })}
              />
            </label>
          ))}
          <p className="muted small">GST {a.gstPct}% · free shipping above ₹1,500, else ₹79 charged.</p>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h3>Where the money goes · {sel.product.name}</h3>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Choose SKU">
              {rows.map((r) => (
                <option key={r.sku.id} value={r.sku.id}>
                  {r.sku.code} · {r.product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="waterfall">
            {sel.e.lines
              .filter((l) => Math.abs(l.amount) >= 0.5)
              .map((l) => (
                <div key={l.key} className={cn('wf-row', `wf-${l.group}`)}>
                  <span>{l.label}</span>
                  <i>
                    <i style={{ width: `${(Math.abs(l.amount) / maxAbs) * 100}%` }} />
                  </i>
                  <b>{rupees(l.amount)}</b>
                </div>
              ))}
            <div className={cn('wf-row wf-total', sel.e.contribution < 0 && 'negative')}>
              <span>Contribution per unit</span>
              <i />
              <b>
                {rupees(sel.e.contribution)} ({sel.e.contributionPct.toFixed(0)}%)
              </b>
            </div>
          </div>
        </section>
      </div>
      <section className="panel">
        <h3>SKU portfolio</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Price</th>
                <th>Maker payout</th>
                <th>Maker share of net</th>
                <th>Contribution / unit</th>
                <th>Margin</th>
                <th>Read</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.sku.id}
                  className={r.sku.id === selected ? 'selected' : ''}
                  onClick={() => setSelected(r.sku.id)}
                >
                  <td>
                    <b>{r.sku.code}</b> {r.product.name}
                  </td>
                  <td>{formatCurrency(r.product.price)}</td>
                  <td>{formatCurrency(r.sku.producerRate)}</td>
                  <td>{r.e.makerShareOfNet.toFixed(0)}%</td>
                  <td className={r.e.contribution < 0 ? 'neg' : ''}>{rupees(r.e.contribution)}</td>
                  <td className={r.e.contribution < 0 ? 'neg' : ''}>{r.e.contributionPct.toFixed(0)}%</td>
                  <td>
                    <StatusChip
                      status={
                        r.e.contributionPct >= 15 ? 'healthy' : r.e.contributionPct >= 0 ? 'thin' : 'loss'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {losing.length > 0 && (
          <p className="econ-insight">
            <AlertTriangle size={16} /> {losing.map((r) => r.sku.code).join(', ')} lose money when sold alone
            at these assumptions — sell them as add-ons, in bundles or gift hampers so they share one courier
            and one acquisition cost.
          </p>
        )}
      </section>
    </AdminShell>
  );
}

const ENQUIRY_FLOW: EnquiryStatus[] = ['new', 'quoted', 'won', 'lost'];
export function AdminEnquiriesPage() {
  const { state, dispatch } = usePrototype();
  const pipeline = state.enquiries.filter((e) => e.status === 'new' || e.status === 'quoted');
  const value = pipeline.reduce((s, e) => s + e.quantity * e.budgetPerUnit, 0);
  return (
    <AdminShell title="Bulk & gifting enquiries">
      <SectionHeading
        eyebrow="B2B channel"
        title={`${formatCurrency(value)} in open enquiries`}
        copy="Corporate gifting, wedding and wholesale enquiries from the gifting page. Reply within one working day with a quote built from pooled stock."
      />
      <div className="metrics four">
        {ENQUIRY_FLOW.map((s) => (
          <MetricCard
            key={s}
            label={s[0].toUpperCase() + s.slice(1)}
            value={state.enquiries.filter((e) => e.status === s).length}
          />
        ))}
      </div>
      <div className="enquiry-list">
        {state.enquiries.map((e) => (
          <article key={e.id} className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">
                  {e.id} · {e.occasion}
                </span>
                <h3>{e.organisation || e.name}</h3>
              </div>
              <StatusChip status={e.status} />
            </div>
            <p>{e.message}</p>
            <dl className="enquiry-facts">
              <div>
                <dt>Quantity</dt>
                <dd>{e.quantity}</dd>
              </div>
              <div>
                <dt>Budget / unit</dt>
                <dd>{formatCurrency(e.budgetPerUnit)}</dd>
              </div>
              <div>
                <dt>Value</dt>
                <dd>{formatCurrency(e.quantity * e.budgetPerUnit)}</dd>
              </div>
              <div>
                <dt>Needed by</dt>
                <dd>{formatDate(e.neededBy)}</dd>
              </div>
              <div>
                <dt>Products</dt>
                <dd>
                  {e.productIds.map((id) => state.products.find((p) => p.id === id)?.skuId).join(', ') ||
                    'Open'}
                </dd>
              </div>
            </dl>
            <div className="row-actions">
              <span className="muted small">
                <Mail size={13} /> {e.email} · <Phone size={13} /> {e.phone} · received{' '}
                {formatDate(e.createdAt)}
              </span>
              <span className="spacer" />
              {e.status === 'new' && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    dispatch({ type: 'UPDATE_ENQUIRY_STATUS', payload: { id: e.id, status: 'quoted' } })
                  }
                >
                  Mark quoted
                </Button>
              )}
              {e.status === 'quoted' && (
                <>
                  <Button
                    onClick={() =>
                      dispatch({ type: 'UPDATE_ENQUIRY_STATUS', payload: { id: e.id, status: 'won' } })
                    }
                  >
                    Won
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      dispatch({ type: 'UPDATE_ENQUIRY_STATUS', payload: { id: e.id, status: 'lost' } })
                    }
                  >
                    Lost
                  </Button>
                </>
              )}
            </div>
          </article>
        ))}
        {!state.enquiries.length && (
          <EmptyState title="No enquiries yet" copy="Enquiries from the gifting page appear here." />
        )}
      </div>
    </AdminShell>
  );
}

export function AdminApplicationsPage() {
  const { state, dispatch } = usePrototype();
  const [skuPick, setSkuPick] = useState<Record<string, string[]>>({});
  const pending = state.applications.filter((a) => a.status === 'pending');
  return (
    <AdminShell title="Maker applications">
      <SectionHeading
        eyebrow="Supply onboarding"
        title={`${pending.length} application${pending.length === 1 ? '' : 's'} awaiting a sample check`}
        copy="Approve a maker only after a sample passes the SKU’s QC checklist. Approval adds them to the network and to the SKUs you select."
      />
      <div className="enquiry-list">
        {state.applications.map((a) => (
          <article key={a.id} className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">
                  {a.id} · {a.type} · {a.village}
                </span>
                <h3>{a.name}</h3>
              </div>
              <StatusChip
                status={
                  a.status === 'approved' ? 'accepted' : a.status === 'declined' ? 'rejected' : 'pending_qc'
                }
              />
            </div>
            <p>
              <b>{a.craft}</b> — {a.note}
            </p>
            <dl className="enquiry-facts">
              <div>
                <dt>Experience</dt>
                <dd>{a.yearsExperience} yrs</dd>
              </div>
              <div>
                <dt>Group size</dt>
                <dd>{a.groupSize}</dd>
              </div>
              <div>
                <dt>Capacity / month</dt>
                <dd>{a.monthlyCapacity} units</dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{a.language === 'te' ? 'Telugu' : 'English'}</dd>
              </div>
            </dl>
            {a.status === 'pending' && (
              <>
                <div className="sku-picker">
                  <span className="muted small">Approve for SKUs:</span>
                  {state.skus.map((s) => {
                    const on = (skuPick[a.id] || []).includes(s.id);
                    return (
                      <button
                        key={s.id}
                        className={cn('chip', on && 'active')}
                        onClick={() =>
                          setSkuPick({
                            ...skuPick,
                            [a.id]: on
                              ? (skuPick[a.id] || []).filter((x) => x !== s.id)
                              : [...(skuPick[a.id] || []), s.id],
                          })
                        }
                      >
                        {s.code}
                      </button>
                    );
                  })}
                </div>
                <div className="row-actions">
                  <Button
                    onClick={() =>
                      dispatch({
                        type: 'REVIEW_APPLICATION',
                        payload: { id: a.id, decision: 'approved', skuIds: skuPick[a.id] },
                      })
                    }
                  >
                    <UserPlus size={15} /> Sample passed — approve
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      dispatch({ type: 'REVIEW_APPLICATION', payload: { id: a.id, decision: 'declined' } })
                    }
                  >
                    Decline with feedback
                  </Button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </AdminShell>
  );
}

const READY_NEXT: Record<ReadinessStatus, ReadinessStatus> = {
  open: 'in_progress',
  in_progress: 'done',
  done: 'open',
};
export function AdminReadinessPage() {
  const { state, dispatch } = usePrototype();
  const done = state.readiness.filter((r) => r.status === 'done').length;
  const pct = Math.round((done / state.readiness.length) * 100);
  const areas = [...new Set(state.readiness.map((r) => r.area))];
  return (
    <AdminShell title="Pilot readiness">
      <SectionHeading
        eyebrow="Launch dependencies"
        title={`${done} of ${state.readiness.length} pilot dependencies complete (${pct}%)`}
        copy="What must be true before the first real order. Click a status to move it: open → in progress → done."
      />
      <div className="readiness-bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="readiness-grid">
        {areas.map((area) => (
          <section key={area} className="panel">
            <h3>{area}</h3>
            {state.readiness
              .filter((r) => r.area === area)
              .map((r) => (
                <div key={r.id} className={cn('readiness-item', r.status)}>
                  <button
                    onClick={() =>
                      dispatch({ type: 'SET_READINESS', payload: { id: r.id, status: READY_NEXT[r.status] } })
                    }
                    aria-label={`Status: ${r.status.replace('_', ' ')}. Click to change.`}
                  >
                    {r.status === 'done' ? <CheckCircle2 size={18} /> : <i />}
                  </button>
                  <span>
                    {r.task}
                    <small>
                      {r.owner} · {r.status.replace('_', ' ')}
                    </small>
                  </span>
                </div>
              ))}
          </section>
        ))}
      </div>
    </AdminShell>
  );
}

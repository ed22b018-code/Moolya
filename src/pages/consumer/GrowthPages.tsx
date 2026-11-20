import { useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, Gift, Handshake, IndianRupee, Languages, Truck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common';
import { ConsumerLayout } from '../../components/consumer';
import { usePrototype } from '../../hooks/usePrototype';
import { formatCurrency } from '../../lib/core';
import { onImgError, productPhotos, scenes, unsplash } from '../../data/media';
import { cn } from '../../lib/cn';
import type { Enquiry, MakerApplication } from '../../types';

const OCCASIONS: Enquiry['occasion'][] = [
  'Corporate gifting',
  'Wedding & festive',
  'Retail / wholesale',
  'Other',
];

export function GiftingPage() {
  const { state, dispatch } = usePrototype();
  const [sent, setSent] = useState('');
  const [f, setF] = useState({
    name: '',
    organisation: '',
    email: '',
    phone: '',
    occasion: OCCASIONS[0],
    quantity: 50,
    budgetPerUnit: 1000,
    productIds: [] as string[],
    neededBy: '',
    message: '',
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'CREATE_ENQUIRY', payload: f });
    if (f.name.trim() && f.email.trim() && f.quantity >= 10) setSent(f.name.split(' ')[0]);
  };
  const toggle = (id: string) =>
    setF({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter((x) => x !== id) : [...f.productIds, id],
    });
  return (
    <ConsumerLayout>
      <section className="page-hero image-hero">
        <img src={unsplash(productPhotos.H002[2], 1800, 800)} alt="" onError={onImgError} />
        <div className="container">
          <span className="eyebrow">Corporate & bulk gifting</span>
          <h1>Gifts with a maker’s name on them.</h1>
          <p>
            Hampers of handloom, craft and raw honey for teams, weddings and festivals—each piece QC-checked
            and sent with a card naming the maker and village it came from.
          </p>
        </div>
      </section>
      <section className="container gift-benefits">
        {[
          [Gift, 'Curated hampers', 'Stole + honey, runner + basket, or your own mix from the pilot range.'],
          [
            BadgeCheck,
            'One quality standard',
            'Every unit passes the same QC checklist, so 200 gifts look like one.',
          ],
          [
            Users,
            'Maker cards',
            'Each gift carries the maker, village and batch—a story your recipients can trace.',
          ],
          [
            Truck,
            'Delivered across India',
            'Bulk dispatch to one address, or individual delivery to each recipient.',
          ],
        ].map(([Icon, t, c]) => {
          const I = Icon as typeof Gift;
          return (
            <article key={t as string}>
              <I />
              <h3>{t as string}</h3>
              <p>{c as string}</p>
            </article>
          );
        })}
      </section>
      <section className="container gift-layout">
        <div>
          <span className="eyebrow">Popular hampers</span>
          <h2>Starting points</h2>
          {[
            ['The Godavari Welcome', ['H002', 'N001'], 1240],
            ['Table & Home', ['H004', 'C001'], 1390],
            ['The Festive Saree Box', ['H003', 'N002'], 2690],
          ].map(([name, skus, price]) => (
            <div className="hamper" key={name as string}>
              <div className="hamper-imgs">
                {(skus as string[]).map((k) => (
                  <img key={k} src={unsplash(productPhotos[k][0], 200, 200)} alt="" onError={onImgError} />
                ))}
              </div>
              <span>
                <b>{name as string}</b>
                <small>
                  {(skus as string[]).map((k) => state.products.find((p) => p.skuId === k)?.name).join(' + ')}
                </small>
              </span>
              <b>from {formatCurrency(price as number)}</b>
            </div>
          ))}
          <p className="muted small">
            Indicative per-hamper prices for 50+ units, before branding. Final quotes depend on stock in the
            pool.
          </p>
        </div>
        <form className="checkout-form gift-form" onSubmit={submit}>
          {sent ? (
            <div className="sent">
              <BadgeCheck size={40} />
              <h2>Thank you, {sent}.</h2>
              <p>
                We’ve logged your enquiry. In a live pilot the team would reply within one working day with a
                quote built from verified stock.
              </p>
              <Button type="button" variant="secondary" onClick={() => setSent('')}>
                Send another enquiry
              </Button>
            </div>
          ) : (
            <>
              <h2>Request a quote</h2>
              <div className="form-grid">
                <label>
                  Your name
                  <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </label>
                <label>
                  Organisation
                  <input
                    value={f.organisation}
                    onChange={(e) => setF({ ...f, organisation: e.target.value })}
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                  />
                </label>
                <label>
                  Phone
                  <input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                </label>
                <label>
                  Occasion
                  <select
                    value={f.occasion}
                    onChange={(e) => setF({ ...f, occasion: e.target.value as Enquiry['occasion'] })}
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Needed by
                  <input
                    type="date"
                    value={f.neededBy}
                    onChange={(e) => setF({ ...f, neededBy: e.target.value })}
                  />
                </label>
                <label>
                  Quantity (min 10)
                  <input
                    type="number"
                    min={10}
                    value={f.quantity}
                    onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Budget per gift (₹)
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={f.budgetPerUnit}
                    onChange={(e) => setF({ ...f, budgetPerUnit: Number(e.target.value) })}
                  />
                </label>
                <div className="span-2 field">
                  <span className="field-label">Products you are interested in</span>
                  <div className="chip-row tight">
                    {state.products.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={cn('chip', f.productIds.includes(p.id) && 'active')}
                        onClick={() => toggle(p.id)}
                      >
                        {p.name.replace('East Godavari ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="span-2">
                  Anything else?
                  <textarea
                    rows={3}
                    value={f.message}
                    onChange={(e) => setF({ ...f, message: e.target.value })}
                    placeholder="Branding, packaging, delivery to many addresses…"
                  />
                </label>
              </div>
              <p className="muted small">
                Estimated value: <b>{formatCurrency(f.quantity * f.budgetPerUnit)}</b>
              </p>
              <Button type="submit">
                Send enquiry <ArrowRight />
              </Button>
            </>
          )}
        </form>
      </section>
    </ConsumerLayout>
  );
}

export function JoinMakersPage() {
  const { dispatch } = usePrototype();
  const [sent, setSent] = useState(false);
  const [f, setF] = useState<Omit<MakerApplication, 'id' | 'status' | 'createdAt'>>({
    name: '',
    village: '',
    type: 'Weaver',
    craft: '',
    yearsExperience: 5,
    groupSize: 1,
    monthlyCapacity: 20,
    phone: '',
    language: 'te',
    note: '',
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'CREATE_APPLICATION', payload: f });
    if (f.name.trim() && f.village.trim() && f.craft.trim()) setSent(true);
  };
  return (
    <ConsumerLayout>
      <section className="page-hero image-hero">
        <img src={unsplash(scenes.loomRoom, 1800, 800)} alt="" onError={onImgError} />
        <div className="container">
          <span className="eyebrow">For weavers, artisans and SHGs</span>
          <h1>Make for Moolya.</h1>
          <p>
            Steady demand, one clear standard, and payment credited the day your pieces pass quality
            checks—not when they sell.
          </p>
        </div>
      </section>
      <section className="container gift-benefits">
        {[
          [
            Handshake,
            'Demand first',
            'See exactly which products and quantities are needed before you make them.',
          ],
          [
            BadgeCheck,
            'Clear standard',
            'A simple checklist for material, size and finish, with rework notes instead of rejection.',
          ],
          [
            IndianRupee,
            'Credit on acceptance',
            'The agreed rate is credited when units pass QC; your ledger shows paid and pending.',
          ],
          [
            Languages,
            'In Telugu, with help',
            'A coordinator helps with submissions; the portal works in Telugu and English.',
          ],
        ].map(([Icon, t, c]) => {
          const I = Icon as typeof Gift;
          return (
            <article key={t as string}>
              <I />
              <h3>{t as string}</h3>
              <p>{c as string}</p>
            </article>
          );
        })}
      </section>
      <section className="container gift-layout">
        <div>
          <span className="eyebrow">How joining works</span>
          <h2>Four steps</h2>
          <ol className="join-steps">
            <li>
              <b>Apply</b> with this form or through your SHG coordinator.
            </li>
            <li>
              <b>Sample check</b>: send one piece; we inspect it against the SKU checklist.
            </li>
            <li>
              <b>Approval</b> for one or more SKUs, with the producer rate agreed in writing.
            </li>
            <li>
              <b>Start supplying</b> against open requirements in the producer portal.
            </li>
          </ol>
          <Link className="text-link" to="/producer">
            Preview the producer portal <ArrowRight />
          </Link>
        </div>
        <form className="checkout-form gift-form" onSubmit={submit}>
          {sent ? (
            <div className="sent">
              <BadgeCheck size={40} />
              <h2>Application received.</h2>
              <p>
                In a live pilot a coordinator would call within a week to arrange a sample check. You can see
                it in Operations → Applications.
              </p>
              <Button type="button" variant="secondary" onClick={() => setSent(false)}>
                Submit another
              </Button>
            </div>
          ) : (
            <>
              <h2>Apply to join</h2>
              <div className="form-grid">
                <label>
                  Name or SHG name
                  <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </label>
                <label>
                  Village / mandal
                  <input
                    required
                    value={f.village}
                    onChange={(e) => setF({ ...f, village: e.target.value })}
                  />
                </label>
                <label>
                  You are
                  <select
                    value={f.type}
                    onChange={(e) => setF({ ...f, type: e.target.value as MakerApplication['type'] })}
                  >
                    <option>Weaver</option>
                    <option>Artisan</option>
                    <option value="SHG">Self-help group</option>
                  </select>
                </label>
                <label>
                  Phone
                  <input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                </label>
                <label className="span-2">
                  What do you make?
                  <input
                    required
                    value={f.craft}
                    onChange={(e) => setF({ ...f, craft: e.target.value })}
                    placeholder="e.g. cotton sarees, palm-leaf baskets, honey"
                  />
                </label>
                <label>
                  Years of experience
                  <input
                    type="number"
                    min={0}
                    value={f.yearsExperience}
                    onChange={(e) => setF({ ...f, yearsExperience: Number(e.target.value) })}
                  />
                </label>
                <label>
                  People in your group
                  <input
                    type="number"
                    min={1}
                    value={f.groupSize}
                    onChange={(e) => setF({ ...f, groupSize: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Pieces you can make a month
                  <input
                    type="number"
                    min={1}
                    value={f.monthlyCapacity}
                    onChange={(e) => setF({ ...f, monthlyCapacity: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Preferred language
                  <select
                    value={f.language}
                    onChange={(e) => setF({ ...f, language: e.target.value as 'en' | 'te' })}
                  >
                    <option value="te">Telugu</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <label className="span-2">
                  Anything we should know?
                  <textarea rows={3} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                </label>
              </div>
              <Button type="submit">
                Submit application <ArrowRight />
              </Button>
            </>
          )}
        </form>
      </section>
    </ConsumerLayout>
  );
}

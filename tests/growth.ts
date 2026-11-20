import { createSeedState } from '../src/data/seed';
import { prototypeReducer } from '../src/app/prototypeReducer';
import { breakEvenOrders, defaultAssumptions, priceBreakdown, unitEconomics } from '../src/lib/economics';

const ok = (c: boolean, m: string) => {
  if (!c) throw new Error(m);
};
const shirt = unitEconomics(1290, 720, 'Handloom');
const honey = unitEconomics(329, 180, 'Natural');
ok(shirt.contribution > 0, 'Shirt should carry positive contribution');
ok(honey.contribution < 0, 'Small honey jar alone should lose money (needs bundling)');
ok(
  Math.abs(priceBreakdown(1290, 720, 'Handloom').reduce((s, b) => s + b.amount, 0) - 1290) < 1,
  'Breakdown sums to price',
);
ok(
  Number.isFinite(breakEvenOrders(shirt.contributionPerOrder, defaultAssumptions.fixedMonthly)),
  'Break-even reachable',
);
ok(breakEvenOrders(-10, 1000) === Infinity, 'Negative contribution never breaks even');

let s = createSeedState();
const n = s.enquiries.length;
s = prototypeReducer(s, {
  type: 'CREATE_ENQUIRY',
  payload: {
    name: 'A',
    organisation: 'B',
    email: 'a@b.test',
    phone: '',
    occasion: 'Corporate gifting',
    quantity: 5,
    budgetPerUnit: 900,
    productIds: [],
    neededBy: '',
    message: '',
  },
});
ok(s.enquiries.length === n, 'Enquiry below 10 units refused');
s = prototypeReducer(s, {
  type: 'CREATE_ENQUIRY',
  payload: {
    name: 'A',
    organisation: 'B',
    email: 'a@b.test',
    phone: '',
    occasion: 'Corporate gifting',
    quantity: 50,
    budgetPerUnit: 900,
    productIds: ['H002-product-id'],
    neededBy: '',
    message: '',
  },
});
ok(s.enquiries.length === n + 1 && s.enquiries[0].status === 'new', 'Enquiry created');
s = prototypeReducer(s, { type: 'UPDATE_ENQUIRY_STATUS', payload: { id: s.enquiries[0].id, status: 'won' } });
ok(s.enquiries[0].status === 'won', 'Enquiry won');

const producers = s.producers.length;
const app = s.applications.find((a) => a.status === 'pending')!;
s = prototypeReducer(s, {
  type: 'REVIEW_APPLICATION',
  payload: { id: app.id, decision: 'approved', skuIds: ['H002'] },
});
const newbie = s.producers.at(-1)!;
ok(s.producers.length === producers + 1 && newbie.name === app.name, 'Approved maker added');
ok(s.skus.find((k) => k.id === 'H002')!.approvedProducerIds.includes(newbie.id), 'Maker approved for SKU');
s = prototypeReducer(s, { type: 'REVIEW_APPLICATION', payload: { id: app.id, decision: 'declined' } });
ok(s.producers.length === producers + 1, 'Reviewing twice has no effect');
s = prototypeReducer(s, { type: 'SET_READINESS', payload: { id: 'R03', status: 'done' } });
ok(s.readiness.find((r) => r.id === 'R03')!.status === 'done', 'Readiness toggles');
const sub = s.submissions.find((x) => x.status === 'pending_qc')!;
const qcBefore = s.qcRecords.length;
s = prototypeReducer(s, {
  type: 'PROCESS_QC',
  payload: { submissionId: sub.id, accepted: 1, rework: 0, rejected: 0, checks: { material: true, measurements: true, finish: true, damage: true, colour: true, packaging: true }, notes: '' },
});
ok(s.qcRecords.length === qcBefore, 'QC counts that do not add up are refused');
console.log(
  `Growth flow passed: shirt ₹${Math.round(shirt.contribution)}/unit, honey ₹${Math.round(honey.contribution)}/unit, enquiries, maker approval, readiness.`,
);

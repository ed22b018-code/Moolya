import type {
  Category,
  Coupon,
  DemandRequirement,
  InventoryBatch,
  Order,
  Payout,
  Producer,
  ProducerSubmission,
  Product,
  PrototypeState,
  QCRecord,
  Review,
  SKU,
} from '../types';
import { productPhotos, unsplash } from './media';

const productDefs: [string, string, Category, number, string, string[]][] = [
  [
    'H001',
    'Godavari Everyday Cotton Shirt',
    'Handloom',
    1290,
    'A breathable indigo shirt woven for everyday ease.',
    ['Handloom cotton', 'Natural indigo'],
  ],
  [
    'H002',
    'Riverline Cotton Stole',
    'Handloom',
    890,
    'A light cotton stole with river-inspired stripes.',
    ['Fine cotton'],
  ],
  [
    'H003',
    'East Godavari Handloom Saree',
    'Handloom',
    2490,
    'A soft handloom saree with a restrained temple border.',
    ['Handloom cotton'],
  ],
  [
    'H004',
    'Woven Table Runner',
    'Handloom',
    790,
    'Textured table linen woven in warm, grounded tones.',
    ['Cotton yarn'],
  ],
  [
    'H005',
    'Handloom Cushion Pair',
    'Handloom',
    1190,
    'A pair of tactile woven cushion covers.',
    ['Cotton', 'Jute blend'],
  ],
  [
    'C001',
    'Palm Weave Storage Basket',
    'Craft',
    699,
    'A sturdy palm-leaf basket for everyday storage.',
    ['Palm leaf'],
  ],
  [
    'C002',
    'Riverbank Wooden Keepsake',
    'Craft',
    1150,
    'A compact hand-finished keepsake box.',
    ['Local wood'],
  ],
  [
    'C003',
    'Handcrafted Table Accent',
    'Craft',
    899,
    'A sculptural accent shaped and finished by hand.',
    ['Wood', 'Natural wax'],
  ],
  [
    'N001',
    'East Godavari Multiflora Honey 500g',
    'Natural',
    449,
    'Raw multiflora honey sourced in small batches.',
    ['Raw honey'],
  ],
  ['N002', 'Forest Honey 250g', 'Natural', 329, 'Deep, floral forest honey in a small jar.', ['Raw honey']],
];
interface ProductExtra {
  variants: string[];
  dimensions: string;
  care: string;
  highlights: string[];
  longDescription: string;
}
const extras: Record<string, ProductExtra> = {
  H001: {
    variants: ['S', 'M', 'L', 'XL', 'XXL'],
    dimensions: 'Chest 38–46 in by size · regular fit · 74 cm length (M)',
    care: 'Cold hand wash separately for the first three washes. Dry in shade. Warm iron.',
    highlights: ['Natural indigo dye', 'Coconut-shell buttons', 'Pre-washed for shrinkage'],
    longDescription:
      'Woven on pit looms in East Godavari and stitched to one shared Moolya pattern, this indigo shirt softens with every wash. Eight approved producers make it against specification v1.2, so every size fits the same way no matter which home it came from.',
  },
  H002: {
    variants: ['Indigo stripe', 'Madder stripe', 'Natural'],
    dimensions: '200 × 70 cm · 140 g',
    care: 'Gentle hand wash in cold water. Do not wring. Dry flat in shade.',
    highlights: ['Fine 80s count cotton', 'Hand-knotted tassels', 'Lightweight for Indian summers'],
    longDescription:
      'A light, breathable stole with stripes that echo the Godavari’s braided channels. Woven on frame looms by weaving households and finished with hand-knotted tassels.',
  },
  H003: {
    variants: ['Indigo with temple border', 'Mustard with temple border'],
    dimensions: '6.2 m with 0.8 m running blouse piece',
    care: 'First wash: dry clean. Afterwards, gentle hand wash in cold water; starch optional.',
    highlights: ['Handwoven temple border', 'Running blouse piece', 'QC tag with batch ID'],
    longDescription:
      'A soft handloom cotton saree with a restrained temple border. Every saree is checked for weave density, border alignment and colour fastness before it enters the Moolya pool.',
  },
  H004: {
    variants: ['150 cm', '180 cm'],
    dimensions: '33 cm wide · 150 or 180 cm long',
    care: 'Machine wash cold on a gentle cycle. Line dry. Iron on reverse.',
    highlights: ['Double-woven for body', 'Fringed ends', 'Fits 4–6 seater tables'],
    longDescription:
      'Textured table linen woven in warm, grounded tones. A double weave gives it enough body to lie flat on the table and stand up to everyday meals.',
  },
  H005: {
    variants: ['Pair · 40 × 40 cm', 'Pair · 45 × 45 cm'],
    dimensions: 'Set of two covers · concealed zip · inserts not included',
    care: 'Machine wash cold, inside out. Dry in shade.',
    highlights: ['Cotton–jute blend', 'Concealed YKK zip', 'Sold as a matched pair'],
    longDescription:
      'A matched pair of tactile woven cushion covers. Each pair is drawn from the same dye lot so colours match across the set.',
  },
  C001: {
    variants: ['Small', 'Medium', 'Large'],
    dimensions: 'S 20 cm · M 28 cm · L 36 cm diameter',
    care: 'Wipe with a dry cloth. Keep away from prolonged moisture.',
    highlights: ['Hand-coiled palm leaf', 'Sturdy flat base', 'Nests for storage'],
    longDescription:
      'A sturdy palm-leaf basket coiled by hand by self-help group members in the Konaseema belt. Useful for fruit, yarn, toys or the daily jumble by the door.',
  },
  C002: {
    variants: ['Standard'],
    dimensions: '18 × 12 × 8 cm · hinged lid',
    care: 'Dust with a soft cloth. Re-oil with a drop of coconut oil every few months.',
    highlights: ['Single-block local wood', 'Hand-rubbed oil finish', 'Brass hinge'],
    longDescription:
      'A compact, hand-finished keepsake box for jewellery, letters or small treasures. Each box is checked for joint fit, finish and smooth lid action.',
  },
  C003: {
    variants: ['Standard'],
    dimensions: 'Approx. 22 cm tall · 14 cm wide',
    care: 'Dust gently. Avoid direct sun and water.',
    highlights: ['Hand-carved detail', 'Natural wax finish', 'Each piece is unique'],
    longDescription:
      'A sculptural accent shaped and finished by hand by woodcarvers in the district. Minor variations in grain and carving are part of the piece.',
  },
  N001: {
    variants: ['500 g'],
    dimensions: '500 g glass jar',
    care: 'Store at room temperature. Natural crystallisation is a sign of raw honey—warm gently to liquefy.',
    highlights: ['Raw and unheated', 'Lab-tested for moisture', 'Batch-dated jar'],
    longDescription:
      'Raw multiflora honey from coconut, mango and drumstick blossoms, collected in small batches by beekeeping groups and tested for moisture before it is jarred.',
  },
  N002: {
    variants: ['250 g'],
    dimensions: '250 g glass jar',
    care: 'Store at room temperature away from sunlight. Use a dry spoon.',
    highlights: ['Wild forest harvest', 'Deep, floral taste', 'No added sugar'],
    longDescription:
      'Deep, floral honey gathered from the forest edge of the Eastern Ghats. Smaller harvests, darker colour and a richer taste than multiflora.',
  },
};

export const seedProducts: Product[] = productDefs.map(([code, name, category, price, desc, materials], i) => {
  const x = extras[code];
  return {
    id: `${code}-product-id`,
    skuId: code,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    shortDescription: desc,
    longDescription: x.longDescription,
    category,
    subcategory: category === 'Natural' ? 'Honey' : category,
    price,
    compareAtPrice: i % 3 === 0 ? price + 200 : undefined,
    images: productPhotos[code].map((id) => unsplash(id, 1100)),
    materials,
    variants: x.variants,
    rating: 4.5 + (i % 4) * 0.1,
    reviewCount: 18 + i * 7,
    featured: i < 6,
    active: true,
    dimensions: x.dimensions,
    care: x.care,
    highlights: x.highlights,
  };
});

const reviewTemplates: [string, string, number, string, string][] = [
  ['Priya R.', 'Hyderabad', 5, 'Exactly as described', 'Lovely quality and the origin card in the parcel made it feel personal. Will buy again.'],
  ['Arjun M.', 'Bengaluru', 5, 'Great finish', 'Neatly finished, well packed and arrived in four days. You can tell it was checked properly.'],
  ['Sneha K.', 'Visakhapatnam', 4, 'Good value', 'Good value for a handmade product. Colour was slightly deeper than the photo, which I actually prefer.'],
  ['Rahul V.', 'Chennai', 5, 'Loved knowing who made it', 'Seeing the producer and batch after ordering is a really nice touch. Quality is consistent.'],
  ['Kavya S.', 'Pune', 4, 'Would recommend', 'Solid product. Delivery took a day longer than estimated but support kept me posted.'],
];
export const seedReviews: Review[] = productDefs.flatMap(([code], pi) =>
  [0, 1, 2].map((k) => {
    const [author, city, rating, title, body] = reviewTemplates[(pi + k) % reviewTemplates.length];
    return {
      id: `REV-${code}-${k + 1}`,
      productId: `${code}-product-id`,
      author,
      city,
      rating,
      title,
      body,
      createdAt: new Date(Date.UTC(2026, 8, 3 + pi * 2 + k * 5)).toISOString(),
      verified: k !== 2,
    };
  }),
);

export const coupons: Coupon[] = [
  { code: 'GODAVARI10', label: '10% off your first order', percentOff: 10, minSubtotal: 0 },
  { code: 'MAKERS15', label: '15% off orders above ₹2,000', percentOff: 15, minSubtotal: 2000 },
];

const villages = [
  'Atreyapuram',
  'Amalapuram',
  'Razole',
  'Mandapeta',
  'Kakinada Rural',
  'Peddapuram',
  'Ramachandrapuram',
  'Mummidivaram',
  'Samalkot',
];
const names = [
  'S. Lakshmi',
  'P. Ravi',
  'K. Anitha',
  'V. Suresh',
  'M. Padma',
  'B. Srinivas',
  'D. Jyothi',
  'R. Satya',
  'G. Mani',
  'T. Devi',
  'A. Kumar',
  'N. Rani',
];
export const seedProducers: Producer[] = Array.from({ length: 63 }, (_, i) => {
  const id = i === 0 ? 'EG-P-017' : `EG-P-${String(100 + i).padStart(3, '0')}`;
  const approved = i < 8 ? ['H001', 'H003', 'H004'] : [productDefs[i % 10][0]];
  return {
    id,
    name: i === 0 ? 'S. Lakshmi' : `${names[i % names.length]} ${i + 1}`,
    village: villages[i % villages.length],
    district: 'East Godavari',
    type: i % 5 === 4 ? 'SHG' : i % 3 === 0 ? 'Weaver' : 'Artisan',
    skills: i % 3 === 0 ? ['Weaving', 'Finishing'] : ['Crafting', 'Quality packing'],
    approvedSkuIds: approved,
    yearsExperience: 4 + (i % 19),
    qcAcceptanceRate: i === 0 ? 94 : 84 + (i % 14),
    totalUnitsSubmitted: i === 0 ? 149 : 24 + i * 3,
    totalUnitsAccepted: i === 0 ? 140 : 20 + i * 2,
    totalCredited: i === 0 ? 18450 : 12000 + i * 560,
    totalPaid: i === 0 ? 12800 : 9000 + i * 380,
    phone: `+91 90000 ${String(10000 + i).slice(-5)}`,
    language: i % 4 === 0 ? 'te' : 'en',
    active: true,
  };
});

export const seedSKUs: SKU[] = productDefs.map(([code, name, category, price, _, materials], i) => ({
  id: code,
  code,
  productId: `${code}-product-id`,
  name,
  category,
  status: 'active',
  specificationVersion: code === 'H001' ? 'v1.2' : 'v1.0',
  materialSpecification: materials.join(', '),
  qualityChecklist: [
    'Approved material',
    'Measurements within tolerance',
    'Clean finish',
    'No damage',
    'Approved colour',
    'Protective packaging',
  ],
  allowedTolerance: code === 'H001' ? '±1.5 cm' : '±2 cm',
  approvedProducerIds: seedProducers
    .filter((p) => p.approvedSkuIds.includes(code))
    .slice(0, code === 'H001' ? 8 : 6)
    .map((p) => p.id),
  producerRate: code === 'H001' ? 720 : Math.round((price * 0.55) / 10) * 10,
  consumerPrice: price,
  targetDemand: code === 'H001' ? 100 : 45 + i * 5,
  currentDemand: code === 'H001' ? 74 : 24 + i * 3,
  lowStockThreshold: 10 + (i % 3) * 5,
  selectionScores: {
    consumerDemand: 78 + (i % 5) * 4,
    producerCapability: 74 + (i % 6) * 4,
    standardisability: 70 + (i % 4) * 6,
    shippingSuitability: 76 + (i % 5) * 4,
    marginPotential: 68 + (i % 6) * 5,
    repeatPotential: 72 + (i % 5) * 5,
  },
}));

const baseChecks = {
  material: true,
  measurements: true,
  finish: true,
  damage: true,
  colour: true,
  packaging: true,
};
export const seedSubmissions: ProducerSubmission[] = Array.from({ length: 25 }, (_, i) =>
  i === 0
    ? {
        id: 'SUB-H001-LAKSHMI-08',
        producerId: 'EG-P-017',
        skuId: 'H001',
        quantitySubmitted: 8,
        quantityAccepted: 0,
        quantityRework: 0,
        quantityRejected: 0,
        submittedAt: '2026-09-06T10:00:00.000Z',
        status: 'pending_qc',
        producerNote: 'Eight indigo shirts completed against v1.2.',
      }
    : {
        id: `SUB-${String(i + 1).padStart(3, '0')}`,
        producerId: seedProducers[(i * 3) % 63].id,
        skuId: productDefs[i % 10][0],
        quantitySubmitted: 5 + (i % 8),
        quantityAccepted: i <= 20 ? 4 + (i % 7) : 0,
        quantityRework: i <= 20 && i % 4 === 0 ? 1 : 0,
        quantityRejected: i <= 20 && i % 6 === 0 ? 1 : 0,
        submittedAt: new Date(Date.UTC(2026, 7, 1 + i)).toISOString(),
        status: i <= 20 ? (i % 4 === 0 ? 'partially_accepted' : 'accepted') : 'pending_qc',
        qcNotes: i <= 20 ? 'Checked against current shared standard.' : '',
      },
);

export const seedQCRecords: QCRecord[] = seedSubmissions
  .slice(1, 21)
  .map((s, i) => ({
    id: `QC-${s.skuId}-${2400 + i}`,
    submissionId: s.id,
    producerId: s.producerId,
    skuId: s.skuId,
    inspectedAt: new Date(Date.UTC(2026, 7, 2 + i)).toISOString(),
    accepted: s.quantityAccepted,
    rework: s.quantityRework,
    rejected: Math.max(0, s.quantitySubmitted - s.quantityAccepted - s.quantityRework),
    checks: { ...baseChecks, finish: i % 4 !== 0 },
    notes:
      i % 4 === 0 ? 'One unit: reinforce seam and resubmit.' : 'Accepted against the shared specification.',
    batchIds: s.quantityAccepted ? [`BATCH-${s.skuId}-${2400 + i}`] : [],
  }));

const batchSeed: [string, string, string, number, string][] = [
  ['BATCH-H001-2301', 'H001', 'EG-P-017', 14, '2026-07-10'],
  ['BATCH-H001-2318', 'H001', 'EG-P-101', 16, '2026-07-22'],
  ['BATCH-H001-2407', 'H001', 'EG-P-102', 12, '2026-08-12'],
  ['BATCH-H002-1', 'H002', 'EG-P-101', 18, '2026-08-03'],
  ['BATCH-H003-1', 'H003', 'EG-P-017', 9, '2026-08-04'],
  ['BATCH-H004-1', 'H004', 'EG-P-017', 15, '2026-08-05'],
  ['BATCH-H005-1', 'H005', 'EG-P-104', 12, '2026-08-06'],
  ['BATCH-C001-1', 'C001', 'EG-P-105', 20, '2026-08-07'],
  ['BATCH-C002-1', 'C002', 'EG-P-106', 8, '2026-08-08'],
  ['BATCH-C003-1', 'C003', 'EG-P-107', 11, '2026-08-09'],
  ['BATCH-N001-1', 'N001', 'EG-P-108', 25, '2026-08-10'],
  ['BATCH-N002-1', 'N002', 'EG-P-109', 19, '2026-08-11'],
  ['BATCH-H002-2', 'H002', 'EG-P-110', 12, '2026-08-13'],
  ['BATCH-C001-2', 'C001', 'EG-P-111', 14, '2026-08-14'],
  ['BATCH-N001-2', 'N001', 'EG-P-112', 16, '2026-08-15'],
];
export const seedInventoryBatches: InventoryBatch[] = batchSeed.map(
  ([id, skuId, producerId, qty, date], i) => ({
    id,
    skuId,
    producerId,
    qcRecordId: seedQCRecords[i % seedQCRecords.length].id,
    quantityInitial: qty,
    quantityAvailable: qty,
    quantityReserved: 0,
    acceptedAt: `${date}T10:00:00.000Z`,
    qcStandardVersion: skuId === 'H001' ? 'v1.2' : 'v1.0',
    status: 'available',
  }),
);

export const seedPayouts: Payout[] = [
  {
    id: 'PAY-LAK-PAID',
    producerId: 'EG-P-017',
    type: 'credit',
    referenceId: 'BATCH-H001-2301',
    skuId: 'H001',
    acceptedQuantity: 18,
    rate: 711.11,
    amount: 12800,
    status: 'paid',
    createdAt: '2026-08-01',
    paidAt: '2026-08-04',
  },
  {
    id: 'PAY-LAK-PENDING',
    producerId: 'EG-P-017',
    type: 'credit',
    referenceId: 'BATCH-H003-1',
    skuId: 'H003',
    acceptedQuantity: 5,
    rate: 1130,
    amount: 5650,
    status: 'credited',
    createdAt: '2026-08-18',
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `PAY-${i + 3}`,
    producerId: seedProducers[i + 1].id,
    type: 'credit' as const,
    referenceId: `QC-${i + 3}`,
    skuId: productDefs[(i + 1) % 10][0],
    acceptedQuantity: 5 + i,
    rate: 500 + i * 30,
    amount: (5 + i) * (500 + i * 30),
    status: (i % 3 === 0 ? 'paid' : 'credited') as Payout['status'],
    createdAt: new Date(Date.UTC(2026, 7, 10 + i)).toISOString(),
    paidAt: i % 3 === 0 ? new Date(Date.UTC(2026, 7, 13 + i)).toISOString() : undefined,
  })),
];

export const seedDemandRequirements: DemandRequirement[] = seedSKUs.map((s, i) => ({
  id: `DEM-${s.code}`,
  skuId: s.id,
  targetQuantity: s.targetDemand,
  acceptedQuantity: s.currentDemand,
  pendingQCQuantity: s.id === 'H001' ? 8 : i % 4,
  remainingQuantity: Math.max(0, s.targetDemand - s.currentDemand),
  dueDate: new Date(Date.UTC(2026, 8, 15 + i)).toISOString(),
  producerRate: s.producerRate,
  status: 'open',
}));

export const seedOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
  const p = seedProducts[(i + 1) % 10];
  const batch = seedInventoryBatches.find((b) => b.skuId === p.skuId);
  return {
    id: `ORD-2608-${String(i + 1).padStart(3, '0')}`,
    customer: {
      name: `Prototype Customer ${i + 1}`,
      email: `customer${i + 1}@example.test`,
      phone: '9000000000',
    },
    items: [
      {
        id: `OI-${i + 1}`,
        productId: p.id,
        skuId: p.skuId,
        quantity: 1,
        unitPrice: p.price,
        allocatedBatchIds: batch ? [batch.id] : [],
        traceability: batch
          ? [{ unitIndex: 1, batchId: batch.id, producerId: batch.producerId, qcRecordId: batch.qcRecordId }]
          : [],
      },
    ],
    subtotal: p.price,
    shipping: p.price >= 1500 ? 0 : 79,
    total: p.price + (p.price >= 1500 ? 0 : 79),
    paymentMethod: i % 3 === 0 ? 'UPI' : 'Cash on Delivery',
    status: i % 4 === 0 ? 'delivered' : 'placed',
    placedAt: new Date(Date.UTC(2026, 7, 10 + i)).toISOString(),
    shippingAddress: {
      line: 'Prototype address',
      city: 'Rajamahendravaram',
      state: 'Andhra Pradesh',
      pin: '533101',
    },
  };
});

export function createSeedState(): PrototypeState {
  return {
    products: seedProducts,
    skus: seedSKUs,
    producers: seedProducers,
    submissions: seedSubmissions,
    qcRecords: seedQCRecords,
    inventoryBatches: seedInventoryBatches,
    orders: seedOrders,
    payouts: seedPayouts,
    demandRequirements: seedDemandRequirements,
    cart: [],
    wishlist: [],
    reviews: seedReviews,
    appliedCoupon: undefined,
    myOrderIds: [],
    selectedPrototypeRole: 'consumer',
    selectedProducerId: 'EG-P-017',
    language: 'en',
    toastMessages: [],
  };
}

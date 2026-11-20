import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  HomePage,
  ShopPage,
  CategoryPage,
  ProductPage,
  CartPage,
  CheckoutPage,
  OrderSuccessPage,
  OrderTrackingPage,
  MyOrdersPage,
  HowMoolyaWorksPage,
  ProducersPage,
  WishlistPage,
  FAQPage,
} from '../pages/consumer';
import { ConsumerLayout } from '../components/consumer';
import { EmptyState } from '../components/common';

// Producer, operations and demo portals are split into their own bundles so shoppers load less code.
const producer = () => import('../pages/producer');
const admin = () => import('../pages/admin');
const P = {
  Dashboard: lazy(() => producer().then((m) => ({ default: m.ProducerDashboardPage }))),
  Demand: lazy(() => producer().then((m) => ({ default: m.ProducerDemandPage }))),
  Submit: lazy(() => producer().then((m) => ({ default: m.ProducerSubmitPage }))),
  Submissions: lazy(() => producer().then((m) => ({ default: m.ProducerSubmissionsPage }))),
  Quality: lazy(() => producer().then((m) => ({ default: m.ProducerQualityPage }))),
  Earnings: lazy(() => producer().then((m) => ({ default: m.ProducerEarningsPage }))),
  Profile: lazy(() => producer().then((m) => ({ default: m.ProducerProfilePage }))),
};
const A = {
  Dashboard: lazy(() => admin().then((m) => ({ default: m.AdminDashboardPage }))),
  SKUs: lazy(() => admin().then((m) => ({ default: m.AdminSKUsPage }))),
  SKUDetail: lazy(() => admin().then((m) => ({ default: m.AdminSKUDetailPage }))),
  Demand: lazy(() => admin().then((m) => ({ default: m.AdminDemandPage }))),
  QC: lazy(() => admin().then((m) => ({ default: m.AdminQCPage }))),
  Inventory: lazy(() => admin().then((m) => ({ default: m.AdminInventoryPage }))),
  Producers: lazy(() => admin().then((m) => ({ default: m.AdminProducersPage }))),
  ProducerDetail: lazy(() => admin().then((m) => ({ default: m.AdminProducerDetailPage }))),
  Payouts: lazy(() => admin().then((m) => ({ default: m.AdminPayoutsPage }))),
  Orders: lazy(() => admin().then((m) => ({ default: m.AdminOrdersPage }))),
  Analytics: lazy(() => admin().then((m) => ({ default: m.AdminAnalyticsPage }))),
};
const DemoPage = lazy(() => import('../pages/demo/DemoPage').then((m) => ({ default: m.DemoPage })));

const titles: [RegExp, string][] = [
  [/^\/$/, 'Moolya · Handmade in East Godavari'],
  [/^\/shop/, 'Shop · Moolya'],
  [/^\/product/, 'Product · Moolya'],
  [/^\/cart/, 'Cart · Moolya'],
  [/^\/checkout/, 'Checkout · Moolya'],
  [/^\/orders|^\/order-success/, 'Orders · Moolya'],
  [/^\/wishlist/, 'Wishlist · Moolya'],
  [/^\/producers/, 'Our makers · Moolya'],
  [/^\/story/, 'How it works · Moolya'],
  [/^\/faq/, 'FAQs · Moolya'],
  [/^\/producer/, 'Producer portal · Moolya'],
  [/^\/admin/, 'Operations · Moolya'],
  [/^\/demo/, 'Guided demo · Moolya'],
];
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.title = titles.find(([r]) => r.test(pathname))?.[1] || 'Moolya';
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <ConsumerLayout>
      <div className="not-found">
        <EmptyState title="Page not found" copy="The page you opened is not part of this prototype." />
        <a className="button button-primary" href="/">
          Return home
        </a>
      </div>
    </ConsumerLayout>
  );
}
function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span />
      Loading…
    </div>
  );
}
export function AppRouter() {
  return (
    <>
      <RouteEffects />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/story" element={<HowMoolyaWorksPage />} />
          <Route path="/producers" element={<ProducersPage />} />
          <Route path="/producer" element={<P.Dashboard />} />
          <Route path="/producer/demand" element={<P.Demand />} />
          <Route path="/producer/submit" element={<P.Submit />} />
          <Route path="/producer/submissions" element={<P.Submissions />} />
          <Route path="/producer/quality" element={<P.Quality />} />
          <Route path="/producer/earnings" element={<P.Earnings />} />
          <Route path="/producer/profile" element={<P.Profile />} />
          <Route path="/admin" element={<A.Dashboard />} />
          <Route path="/admin/skus" element={<A.SKUs />} />
          <Route path="/admin/skus/:skuId" element={<A.SKUDetail />} />
          <Route path="/admin/demand" element={<A.Demand />} />
          <Route path="/admin/qc" element={<A.QC />} />
          <Route path="/admin/inventory" element={<A.Inventory />} />
          <Route path="/admin/producers" element={<A.Producers />} />
          <Route path="/admin/producers/:producerId" element={<A.ProducerDetail />} />
          <Route path="/admin/payouts" element={<A.Payouts />} />
          <Route path="/admin/orders" element={<A.Orders />} />
          <Route path="/admin/analytics" element={<A.Analytics />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

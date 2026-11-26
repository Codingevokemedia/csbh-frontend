// Coupon offers for a product, from GET /product/getCouponCodeByProductId/:id.
// Same rules and wording as the Evoke marketplace (evoke_frontend/lib/productOffers.js).
export const COUPON_TYPE = { FIXED: 1, PERCENT: 2, FREE_SHIPPING: 3 };

const SIGN_IN_REQUIRED = ['welcome_login_required', 'one_use_login_required'];

export const formatUsd = (n) => {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
};

// Guests can still pick sign-in-only offers: they sign in on the Evoke cart,
// which re-checks the code for their account.
export const canApplyOffer = (offer) => Boolean(offer?.Available) || SIGN_IN_REQUIRED.includes(offer?.Availability);

export function priceWithOffer(offer, unitPrice) {
  const price = Math.max(0, Number(unitPrice) || 0);
  const amount = Math.max(0, Number(offer?.DiscountVolume) || 0);
  let save = 0;
  if (Number(offer?.CouponTypeID) === COUPON_TYPE.FIXED) save = Math.round(Math.min(amount, price) * 100) / 100;
  if (Number(offer?.CouponTypeID) === COUPON_TYPE.PERCENT) save = Math.min(price, Math.round((price * Math.min(amount, 100)) / 100));
  return { pay: Math.round((price - save) * 100) / 100, save };
}

export function describeOffer(offer) {
  const amount = Number(offer?.DiscountVolume) || 0;
  let text = offer?.CouponName || '';
  if (Number(offer?.CouponTypeID) === COUPON_TYPE.FIXED) text = `Save ${formatUsd(amount)} on this item`;
  if (Number(offer?.CouponTypeID) === COUPON_TYPE.PERCENT) text = `Save ${Number(amount.toFixed(2))}% on this item`;
  if (Number(offer?.CouponTypeID) === COUPON_TYPE.FREE_SHIPPING) text = 'Free shipping on this item';
  if (String(offer?.EligibilityType || '').toLowerCase() === 'welcome') return `${text} · First order only`;
  if (offer?.OneUsePerCustomer) return `${text} · One use per customer`;
  return text;
}

const shortDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
};

/** Short label shown above an offer card, or null (same rules as Evoke). */
export function couponBadge(offer) {
  const welcome = String(offer?.EligibilityType || '').toLowerCase() === 'welcome';
  if (offer?.Availability === 'welcome_login_required') return 'Sign in · first order';
  if (offer?.Availability === 'one_use_login_required') return 'Sign in · one use';
  if (welcome && offer?.Available) return 'Welcome · first order';
  if (offer?.OneUsePerCustomer && offer?.Available) return 'One use per customer';
  if (offer?.Availability === 'scheduled' && offer.StartDateofDiscount) return `Starts ${shortDate(offer.StartDateofDiscount)}`;
  if (offer?.Availability === 'used_up') return 'Fully redeemed';
  if (offer?.Available && !offer.DoNotSetDuration && offer.EndDateofDiscount) {
    const end = new Date(offer.EndDateofDiscount);
    const days = Math.round((end.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (days <= 0) return 'Last day';
    if (days <= 7) return `Ends in ${days} day${days === 1 ? '' : 's'}`;
  }
  return null;
}

export const sortOffers = (offers, unitPrice) =>
  [...(offers || [])].sort((a, b) => {
    if (canApplyOffer(a) !== canApplyOffer(b)) return canApplyOffer(a) ? -1 : 1;
    return priceWithOffer(b, unitPrice).save - priceWithOffer(a, unitPrice).save;
  });

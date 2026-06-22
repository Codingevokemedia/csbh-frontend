# CS Beverly Hills — API Integration Guide

This document explains how to connect the real EVOKE Marketplace APIs when they become available.

---

## Environment Variables

Copy `.env.example` → `.env` and fill in these values:

| Variable | Purpose | Example |
|---|---|---|
| `VITE_EVOKE_API_BASE` | Base URL for EVOKE API | `https://api.evokemarketplace.com/v1` |
| `VITE_EVOKE_API_KEY` | API key sent as `x-api-key` header | `ek_live_xxxx` |
| `VITE_EVOKE_SITE_URL` | Public EVOKE site | `https://www.evokemarketplace.com` |
| `VITE_CSBH_STORE_SLUG` | CS Beverly Hills store identifier | `cs-beverly-hills` |
| `VITE_EVOKE_CART_URL` | Cart page redirect URL | `https://www.evokemarketplace.com/mainCart` |
| `VITE_EVOKE_CHECKOUT_URL` | Checkout redirect URL | `https://www.evokemarketplace.com/checkout` |
| `VITE_EVOKE_AUTH_COOKIE_NAME` | Auth cookie name EVOKE sets | `evoke_user` |

**When `VITE_EVOKE_API_BASE` is empty, the app runs in mock mode automatically.** No code changes needed.

---

## Auth Token Storage

- Token stored in `localStorage` under the key `kich.evoke.token`
- User object stored under `kich.evoke.user`
- Sent as `Authorization: Bearer <token>` on every authenticated request
- On 401 response, token is cleared and `evoke:session-expired` event is fired → `AuthContext` logs the user out

See: `src/services/auth.js` — `saveSession()`, `clearSession()`, `getSession()`

---

## Cart Add + Redirect Flow

1. User clicks "Add to Cart" on a `ProductCard` or `ProductDetail`
2. `CartContext.addAndRedirect()` calls `cart.addToCart({ productId, variantId, quantity })`
3. `addToCart` calls **`POST /cart/add`** with `storeSlug`, `productId`, `variantId`, `quantity`
4. On success, `redirectToMarketplaceCart()` redirects to `VITE_EVOKE_CART_URL`
5. The `CartBridge` page handles deep-link cart adds (e.g., from email campaigns): `/cart-bridge?productId=xxx&variantId=yyy&qty=1`

---

## Placeholder Endpoints — What Needs Mapping

### Products
| Function | Placeholder Endpoint | File |
|---|---|---|
| `getStoreProducts()` | `GET /stores/:slug/products` | `src/services/products.js` |
| `getProductsByCollection(slug)` | `GET /stores/:slug/collections/:slug/products` | `src/services/products.js` |
| `getProductById(id)` | `GET /stores/:slug/products/:id` | `src/services/products.js` |
| `getProductBySlug(slug)` | `GET /stores/:slug/products/slug/:slug` | `src/services/products.js` |
| `getFeaturedProducts()` | `GET /stores/:slug/featured` | `src/services/products.js` |
| `getNewArrivals()` | `GET /stores/:slug/new-arrivals` | `src/services/products.js` |
| `searchProducts(query)` | `GET /stores/:slug/products/search?q=` | `src/services/products.js` |

### Auth
| Function | Placeholder Endpoint | File |
|---|---|---|
| `login(email, password)` | `POST /auth/login` | `src/services/auth.js` |
| `signup(payload)` | `POST /auth/register` | `src/services/auth.js` |
| `logout()` | `POST /auth/logout` | `src/services/auth.js` |
| `getMe()` | `GET /auth/me` | `src/services/auth.js` |

### Cart
| Function | Placeholder Endpoint | File |
|---|---|---|
| `addToCart({ productId, variantId, quantity })` | `POST /cart/add` | `src/services/cart.js` |
| `getCart()` | `GET /cart` | `src/services/cart.js` |
| `updateCartQuantity(itemId, qty)` | `PUT /cart/items/:itemId` | `src/services/cart.js` |
| `removeFromCart(itemId)` | `DELETE /cart/items/:itemId` | `src/services/cart.js` |

### Wishlist
| Function | Placeholder Endpoint | File |
|---|---|---|
| `getWishlist()` | `GET /wishlist?storeSlug=` | `src/services/wishlist.js` |
| `addToWishlist(productId)` | `POST /wishlist` | `src/services/wishlist.js` |
| `removeFromWishlist(productId)` | `DELETE /wishlist/:productId` | `src/services/wishlist.js` |

### Other (to implement)
| Feature | Notes |
|---|---|
| Product Registration | `POST /product-registration` — wired up in `ProductRegistration.jsx` |
| Contact Form | Wire `handleSubmit` in `Contact.jsx` to a CMS or email API |
| Newsletter | Wire subscribe form in `Home.jsx` to a mailing list API |

---

## How to Replace Mock Data with Real Data

1. Set `VITE_EVOKE_API_BASE` in `.env`
2. Each service function checks `isMockMode()` → if false, it calls the real API
3. The `normalizeProduct(raw)` function in `products.js` maps raw EVOKE product fields to the internal shape — update field mappings there if EVOKE's response format differs
4. If real API uses different collection slugs, update the switch in `getProductsByCollection()`

---

## Product Shape (internal)

```js
{
  id:               String,   // EVOKE product ID
  title:            String,
  slug:             String,   // URL-safe handle
  price:            Number,   // in USD
  compareAtPrice:   Number | null,
  image:            String,   // featured image URL
  gallery:          String[], // array of image URLs
  category:         String,   // 'watches', 'jewelry', etc.
  collection:       String,   // 'mens', 'womens', etc.
  tags:             String[], // ['new-arrivals', 'limited-editions', ...]
  description:      String,
  specs:            Object,   // key: value spec pairs
  variants: [
    { id: String, label: String, inStock: Boolean }
  ],
  inStock:          Boolean,
  isNew:            Boolean,
  isLimitedEdition: Boolean,
  isBestSeller:     Boolean,
  limitedEditionNote: String | null,
}
```

---

## Session Sharing with EVOKE Marketplace

- EVOKE sets a cookie (`evoke_user` by default) on login — if your domain and EVOKE's domain share the same cookie scope (e.g., via subdomain), sessions are shared
- The `credentials: 'include'` flag on all API calls ensures cookies are sent cross-origin if CORS allows
- For separate domains: use the JWT token flow (localStorage) and pass it as `Authorization: Bearer` — EVOKE must whitelist your domain in CORS and validate the token

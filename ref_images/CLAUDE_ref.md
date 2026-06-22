# Kich Frontend — CLAUDE.md

## Project Overview

**Kich** is a branded jewelry storefront (React SPA) that sits in front of the **Evoke** multi-vendor marketplace backend. Kich is not a standalone shop — it is a brand-scoped view of the Evoke platform. All API calls go to the Evoke backend; sessions are shared with the Evoke marketplace site via a shared cookie.

- **Storefront brand constant**: `KICH_BRAND = "Kich"` (in `src/services/products.js`)
- **Backend API**: configured via `VITE_EVOKE_API_BASE` (default `http://localhost:3000/api`)
- **Marketplace site**: configured via `VITE_EVOKE_SITE_URL` (default `http://localhost:3005`)
- **Cart / Checkout redirect URL**: `VITE_EVOKE_CHECKOUT_URL` / `VITE_EVOKE_CART_URL`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Router | React Router DOM 7 (`<BrowserRouter>`) |
| Build tool | Vite 8 |
| Styling | Plain CSS per feature folder (no Tailwind, no CSS-in-JS) |
| State | React Context + `useState` / `useEffect` (no Redux/Zustand) |
| HTTP | Native `fetch` wrapped in `src/services/api.js` |

---

## Folder Structure

```
src/
  services/          # All API calls — the ONLY place fetch is called
    api.js           # Core: apiFetch, api.get/post/put/del, auth token, cookie, refresh
    auth.js          # signin, signup, signout, OAuth URLs
    products.js      # Products, categories, variants, reviews, search
    cart.js          # Cart CRUD
    wishlist.js      # Wishlist CRUD
    gift.js          # Gift cards
    template.js      # Home page template (admin)
  contexts/          # React Contexts — wrap providers in main.jsx
    AuthContext.jsx  # useAuth() — token, user, isAuthenticated, signin, signup, signout
    CartContext.jsx  # useCart() — items, count, add, remove, updateQty, clear
    WishlistContext.jsx # useWishlist()
  <feature>/         # One folder per page/feature
    FeatureName.jsx  # Component
    feature.css      # Scoped styles
  assets/
    fonts/           # Local .ttf font files
    images/          # Static images and videos
```

**Convention**: every new page lives in its own `src/<featureName>/` folder with a `.jsx` and a `.css` file that share the same base name.

---

## Making API Calls

### The `api` object (`src/services/api.js`)

```js
import { api } from "../services/api";

// Public endpoint (no auth)
const data = await api.get("/product/getAllProducts");

// Auth-required endpoint
const result = await api.post("/customer/addToWishList", payload, { auth: true });

// Other methods
await api.put("/some/path", body, { auth: true });
await api.del("/some/path", { auth: true });
```

`api` is shorthand for `apiFetch` with preset methods. Pass `{ auth: true }` whenever the backend requires a `Bearer` token — the layer reads it from `localStorage` automatically.

### Writing a new service file

```js
// src/services/myFeature.js
import { api, getCustomerIdFromToken } from "./api";

// Public
export async function getThings() {
  return api.get("/things/getAll");
}

// Auth-required — resolve customer ID from stored token
export async function doSomething(payload) {
  const CustomerID = getCustomerIdFromToken();
  if (!CustomerID) throw new Error("Please sign in first.");
  return api.post("/customer/doSomething", { ...payload, CustomerID }, { auth: true });
}
```

---

## Authentication

### Reading auth state in a component

```jsx
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { isAuthenticated, user, customerId, signin, signout } = useAuth();
  // user: { custID, EmailID, FirstName, LastName, role, token }
  // customerId: shortcut for user.custID
}
```

### Session storage

- JWT token: `localStorage["kich.evoke.token"]`
- User object: `localStorage["kich.evoke.user"]` (JSON)
- Cross-site cookie: `evoke_user` — written by `evokeCookie.write()` so that the Evoke marketplace at `localhost:3005` recognises the session without a separate login

### Auth flow
1. `signin()` calls `POST /auth/signin`, stores token + user in localStorage + cookie
2. On 401, `apiFetch` auto-retries once via `POST /auth/refresh` → `GET /auth/session`
3. If refresh fails, `clearSession()` fires and dispatches `evoke:session-expired` — `AuthContext` clears state, UI shows login prompt
4. OAuth (Google / Facebook) redirects back with `?googleLogin=<encoded>` — `AuthContext` parses this on mount

---

## Cart & Wishlist

Use the context hooks — never call service functions directly from components when the context already manages the state:

```jsx
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";

const { items, count, add, remove, updateQty } = useCart();
const { items: wishItems, toggle, isInWishlist } = useWishlist();

// Add to cart
await add({ ProductID: 42, VariantID: null, Quantity: 1 });

// Toggle wishlist
await toggle(productId);
```

Both contexts refresh automatically when authentication changes.

---

## Products — Data Patterns

Raw API responses use inconsistent field names across endpoints. Always use the provided normalizers and pickers:

```js
import {
  normalizeProduct,    // raw row → { id, name, price, oldPrice, image, soldOut, brand, ... }
  pickProductList,     // response → array of raw rows
  normalizeCategory,   // raw row → { id, name, image, parentId, ... }
  pickCategoryList,    // response → array of raw category rows
  normalizeVariant,    // raw row → { id, name, sku, price, stock, attributes, images }
  pickVariants,        // response → array of raw variant rows
  normalizeReview,     // raw row → { id, name, rating, text, createdDate }
  pickReviews,         // response → array of raw review rows
  filterByBrand,       // filters a product array to KICH_BRAND only
  KICH_BRAND,          // = "Kich"
} from "../services/products";

// Typical usage in a component
const resp = await getProductsByBrand(KICH_BRAND);
const products = pickProductList(resp).map(normalizeProduct).filter(Boolean);
```

**Brand scoping rule**: whenever you use a multi-brand endpoint (featured, top, category lists) always pipe through `filterByBrand()` or use `getProductsByBrand(KICH_BRAND)` to keep the storefront showing only Kich products.

---

## Adding a New Page

1. Create `src/<featureName>/FeatureName.jsx` + `feature.css`
2. Add a `<Route path="/feature-path" element={<FeatureName />} />` in `src/App.jsx`
3. Add a `<Link to="/feature-path">` in `src/header/Navbar.jsx` if it needs a nav entry
4. Add link in `src/footer/Footer.jsx` if it belongs in the footer

### Minimal page template

```jsx
import React, { useEffect, useState } from "react";
import "./myfeature.css";
import { api } from "../services/api"; // or import from a specific service file

export default function MyFeature() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const resp = await api.get("/some/endpoint");
        if (!cancelled) setData(resp);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "#c0392b" }}>{error}</p>;

  return <div className="my-feature">{/* UI */}</div>;
}
```

---

## Environment Variables

All env vars are injected at build time via Vite. Create a `.env.local` for local dev:

```env
VITE_EVOKE_API_BASE=http://localhost:3000/api
VITE_EVOKE_SITE_URL=http://localhost:3005
VITE_EVOKE_CHECKOUT_URL=http://localhost:3005/checkout
VITE_EVOKE_CART_URL=http://localhost:3005/mainCart
```

Access in code: `import.meta.env.VITE_EVOKE_API_BASE`

---

## Provider Tree (`src/main.jsx`)

```
BrowserRouter
  └─ AuthProvider       (must be outermost — Cart/Wishlist depend on it)
       └─ CartProvider
            └─ WishlistProvider
                 └─ App
```

If you add a new context, insert it inside `WishlistProvider` (or a logical sibling), not above `AuthProvider`.

---

## Known API Endpoints

### Auth
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/signin` | No |
| POST | `/customer/signup` | No |
| POST | `/auth/refresh` | Cookie |
| GET  | `/auth/session` | Cookie |
| GET  | `/api/auth/google` | No |
| GET  | `/api/auth/facebook` | No |
| POST | `/customer/forgot-password` | No |
| POST | `/customer/changePassword` | Yes |

### Products
| Method | Path | Auth |
|--------|------|------|
| GET | `/product/getAllProducts` | No |
| GET | `/product/getProductsByBrandName/:brandName` | No |
| GET | `/product/getProductById/:id` | No |
| GET | `/product/getAllCategoriesList` | No |
| GET | `/product/getAllProductsByCategoryId/:id` | No |
| GET | `/product/getFeaturedProducts/:type` | No |
| GET | `/product/getTopProductsWithDeatils` | No |
| GET | `/product/variants/:id` | No |
| GET | `/product/getProductStock/:id` | No |
| GET | `/product/getAllReviewsByProductId/:id` | No |
| POST | `/product/submitProductReview` | Yes |
| GET | `/product/searchCategoriesAndProducts/search?searchText=` | No |
| POST | `/product/notify` | No |

### Cart
| Method | Path | Auth |
|--------|------|------|
| POST | `/customer/addToCustomerCart` | Yes |
| GET  | `/customer/getCustomerCart/:id` | Yes |
| GET  | `/customer/getFullCustomerCart/:id` | Yes |
| POST | `/customer/updateCustomerCartQuantity` | Yes |
| GET  | `/customer/deleteCustomerCartItem/:id` | Yes |
| POST | `/customer/clearCustomerCart` | Yes |

### Wishlist
| Method | Path | Auth |
|--------|------|------|
| POST | `/customer/addToWishList` | Yes |
| GET  | `/customer/getCustomerWishList/:id` | Yes |
| GET  | `/customer/deleteCustomerWishListItem/:id` | Yes |
| POST | `/customer/clearCustomerWishList` | Yes |

### Gift Cards
| Method | Path | Auth |
|--------|------|------|
| GET  | `/giftcard/all` | No |
| GET  | `/giftcard/:id` | No |
| POST | `/customer/addGiftCardToCart` | Yes |

### Home Template (admin)
| Method | Path | Auth |
|--------|------|------|
| GET  | `/kich-template/home` | No |
| POST | `/kich-template/home` | Yes (admin) |

---

## Key Conventions

- **No CSS frameworks** — write scoped CSS in the feature's own `.css` file
- **No global state library** — use React Context; keep context files in `src/contexts/`
- **Service layer is the API boundary** — never call `fetch` directly in a component; always go through `src/services/`
- **`{ auth: true }` on every protected call** — the layer attaches the Bearer token automatically
- **Use `cancelled` guard** in `useEffect` data-fetching to avoid state updates on unmounted components
- **`apiFetch` throws `ApiError`** on non-2xx — catch `e.message` for user-facing error text
- **Checkout redirect** — do not reimplement checkout; redirect users to `CHECKOUT_URL` or `CART_URL` from `src/services/api.js`
- **Fonts** live in `src/assets/fonts/` and are loaded via CSS `@font-face` — do not use Google Fonts

---

## Running Locally

```powershell
npm install
npm run dev        # starts Vite dev server (default http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # preview production build
```

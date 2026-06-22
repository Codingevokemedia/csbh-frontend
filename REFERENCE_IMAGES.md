# CS Beverly Hills — Reference Images Guide

This document explains which images are used, where they come from, and where to place new assets.

---

## Currently Used Images (from `ref_images/`)

These are your existing reference images. They are imported centrally from `src/assets/index.js`.

| Variable | File | Used In |
|---|---|---|
| `heroRaxer` | `ref_images/raxer_first_web.webp` | HeroSlider (Slide 1), NewArrivals banner |
| `heroBanner` | `ref_images/presidential_office_banner_web.webp` | HeroSlider (Slide 2), LimitedEditions banner, About page |
| `heroMillion` | `ref_images/million_dollar_mile_web.webp` | HeroSlider (Slide 3) |
| `goldenWatch` | `ref_images/golden_watch_web.webp` | Men's banner (Home + MensWatches), About page |
| `gearWatch` | `ref_images/gear_watch_web.webp` | Women's banner (Home + WomensWatches) |
| `carVideo` | `ref_images/car_video.svg` | Home lifestyle video section |
| `logo` | `ref_images/cs_bh_logo.png` | Navbar, Footer, CartBridge, Auth pages |
| `flagUSA` | `ref_images/usa.png` | Available for region selector |
| `goldenMoon` | `ref_images/goldenmoon_watch.png` | Mock product: Golden Moon |
| `nightingale` | `ref_images/nightangle_watch.svg` | Mock product: Nightingale |
| `skyTracker` | `ref_images/sky_tracker_watch.png` | Mock product: Sky Tracker |
| `sportFusion` | `ref_images/sport_fusion.png` | Mock product: Sport Fusion |

---

## Placeholder Image Slots

Place final assets in `src/assets/images/` with these exact filenames.
Then update `src/assets/index.js` to import them.

| Filename | Recommended Size | Used In | Notes |
|---|---|---|---|
| `hero-watch.jpg` | 2560×1440 | Future hero slide | Alternative hero image |
| `hero-limited-edition.jpg` | 2560×1440 | Limited Editions hero | Dark, dramatic shot |
| `mens-watch-banner.jpg` | 2560×800 | MensWatches page banner | Horizontal cinematic |
| `womens-watch-banner.jpg` | 2560×800 | WomensWatches page banner | Elegant, soft lighting |
| `about-brand.jpg` | 1600×2000 | About page (portrait) | Workshop or lifestyle |
| `testimonial-bg.jpg` | 1920×600 | Testimonials section background | Subtle, dark textured |
| `contact-hero.jpg` | 1920×500 | Contact page header | Beverly Hills aesthetic |

---

## How to Swap an Image

### Option A: Replace the file (same name)
1. Drop your new file into `ref_images/` with the same name
2. The import in `src/assets/index.js` picks it up automatically on next build

### Option B: Add a new image
1. Place the file in `src/assets/images/`
2. In `src/assets/index.js`, add:
   ```js
   import myNewImage from '../assets/images/my-new-image.jpg';
   export { myNewImage };
   ```
3. Import `myNewImage` from `'../assets'` in any component

---

## Product Images

Product images are currently the same as the ref_images above.
When real product photos arrive:

1. Place them in `src/assets/images/products/`
2. Update the `image` and `gallery` fields in `src/data/mockProducts.js`
3. Real API product images will come from `normalizeProduct(raw)` in `src/services/products.js` — the `image` field maps from `raw.featuredImage?.url`

---

## Logo

Current logo: `ref_images/cs_bh_logo.png`

For best results, provide:
- SVG version for crisp rendering at all sizes
- Dark background version (white/gold logo)
- Light background version if needed

Update the import in `src/assets/index.js` when the final logo file is ready.

---

## Image Best Practices

- Use **WebP** format for photos (smaller file size, better quality)
- Hero images: at least **1440px wide**
- Product images: at least **800×800px** (square)
- Use consistent aspect ratios for product cards (3:4 portrait)
- All `<img>` tags have `alt` attributes for accessibility
- Images are loaded with `loading="lazy"` where appropriate

# MarketHub — Premium Marketing Resources & Services

A full-featured marketing e-commerce storefront built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. MarketHub sells digital marketing products — playbooks, templates, toolkits, and expert services — with a complete shopping experience including cart management, multi-currency support, a 3-step checkout flow, and PowerPoint catalog export.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Key Features](#key-features)
3. [Architecture Overview](#architecture-overview)
4. [Directory Structure](#directory-structure)
5. [Data Flow](#data-flow)
6. [Module Reference](#module-reference)
7. [Getting Started](#getting-started)
8. [Development](#development)
9. [Build & Deployment](#build--deployment)

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.0 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + custom CSS | 4.x |
| Export | pptxgenjs | 4.0.1 |
| Fonts | Geist Sans / Geist Mono (Google Fonts) | — |
| Linting | ESLint + eslint-config-next | 9.x |

---

## Key Features

- **Product catalog** — 6 products across 4 categories (Guide, Template, Toolkit, Service)
- **Search & filtering** — full-text search, category filter, min-rating filter, max-price range slider, and multi-field sort
- **Shopping cart** — quantity management, per-product discounts, free-delivery progress bar, localStorage persistence
- **Multi-currency** — live switching between USD, EUR, GBP with conversion rates
- **Promo codes** — SAVE10, WELCOME20, BUNDLE15 applied at cart level
- **Flash sale** — time-boxed deals with a live countdown timer
- **Bundle deals** — multi-product bundles with aggregate discounts (15–25%)
- **3-step checkout** — Address → Review → Confirmed, with HTML5 form validation via React 19 form actions
- **Product compare** — side-by-side comparison modal for up to 2 products
- **Wishlist** — persisted to localStorage, exportable to PowerPoint
- **PowerPoint export** — generates a branded `.pptx` catalog via pptxgenjs (cover, catalog overview, per-product slides, testimonials, wishlist)
- **Loyalty points** — earned per order dollar, displayed in header and footer
- **Recently viewed** — scroll strip showing the last 4 opened products
- **Dark mode** — full dark/light toggle, persisted to localStorage
- **Newsletter signup** — uses React 19 form actions (`<form action={handler}>`)
- **Toast notifications** — success / error / info, auto-dismiss after 3.5 s
- **Back-to-top** — appears after 500 px of scroll
- **Keyboard shortcuts** — Escape closes any open modal

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     app/page.tsx                                │ │
│  │              ── State Orchestrator ──                           │ │
│  │                                                                 │ │
│  │  All useState / useEffect / useMemo / handlers live here.      │ │
│  │  No global store — state flows down via props.                  │ │
│  │                                                                 │ │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │ │
│  │  │ cart     │  │ wishlist  │  │ checkout │  │ filters /    │  │ │
│  │  │ []       │  │ Set<id>   │  │ step     │  │ search / sort│  │ │
│  │  └──────────┘  └───────────┘  └──────────┘  └──────────────┘  │ │
│  │                                                                 │ │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │ │
│  │  │ currency │  │ darkMode  │  │ loyalty  │  │ toasts []    │  │ │
│  │  │ USD/EUR/ │  │ bool      │  │ Points   │  │              │  │ │
│  │  │ GBP      │  │           │  │ number   │  │              │  │ │
│  │  └──────────┘  └───────────┘  └──────────┘  └──────────────┘  │ │
│  │                          │                                      │ │
│  │          props & callbacks passed down                          │ │
│  │                          ▼                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │                  Component Layer                         │  │ │
│  │  │                                                          │  │ │
│  │  │  layout/         product/          cart/                 │  │ │
│  │  │  ├─ Header        ├─ ProductCard    └─ CartSidebar       │  │ │
│  │  │  └─ Footer        └─ ProductModal                        │  │ │
│  │  │                                                          │  │ │
│  │  │  marketing/       filters/          checkout/            │  │ │
│  │  │  ├─ Hero           └─ ProductFilters └─ CheckoutModal    │  │ │
│  │  │  ├─ FlashSale                                            │  │ │
│  │  │  ├─ Bundles        ui/                                   │  │ │
│  │  │  ├─ Testimonials   ├─ Toast                              │  │ │
│  │  │  ├─ FAQ            └─ CompareModal                       │  │ │
│  │  │  ├─ Blog                                                 │  │ │
│  │  │  └─ Newsletter                                           │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                       lib/  (pure modules)                      │ │
│  │                                                                 │ │
│  │  types.ts       All TypeScript types (Product, CartItem, …)    │ │
│  │  constants.ts   RATES, PROMO_CODES, MAX_PRICE, dates, …        │ │
│  │  data.ts        Static data arrays (products, bundles, …)      │ │
│  │  utils.ts       Pure helpers (effectivePrice, badgeColors, …)  │ │
│  │  pptx.ts        PowerPoint generation via pptxgenjs            │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  app/layout.tsx        │  │  localStorage                        │ │
│  │  Metadata, fonts,      │  │  mh_cart · mh_wishlist · mh_dark    │ │
│  │  HTML shell            │  │  mh_currency · mh_points             │ │
│  └───────────────────────┘  └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Architectural Decisions

| Decision | Rationale |
|---|---|
| Single state orchestrator (`app/page.tsx`) | Avoids premature abstraction of a global store for an app of this scope; all state is co-located and traceable |
| Props-down / callbacks-up | Keeps components pure and independently testable without context or external state libraries |
| `lib/` as pure modules | Types, constants, data, and utils are framework-agnostic — importable in tests, scripts, or a future API layer |
| React 19 form actions | Replaces `onSubmit + e.preventDefault()` with `<form action={fn}>` for newsletter and checkout, removing the deprecated `FormEvent` type |
| Tailwind CSS 4 + custom CSS | Tailwind handles utility classes; `styles.css` holds semantic component styles (`.topbar`, `.hero`, `.card`) that would be verbose as inline utilities |
| localStorage persistence | Cart, wishlist, preferences, and loyalty points survive page refresh without a backend |

---

## Directory Structure

```
Marketing App/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: metadata, Geist fonts, HTML shell
│   ├── page.tsx                  # State orchestrator — all useState/handlers here
│   ├── globals.css               # Tailwind base imports + CSS variables
│   └── favicon.ico
│
├── components/
│   ├── ui/
│   │   ├── Toast.tsx             # Fixed-position toast notification list
│   │   └── CompareModal.tsx      # Side-by-side product comparison overlay
│   │
│   ├── layout/
│   │   ├── Header.tsx            # Sticky header: logo, currency switcher, cart pill
│   │   └── Footer.tsx            # 4-column footer: links, legal, dark-mode toggle
│   │
│   ├── marketing/
│   │   ├── Hero.tsx              # Gradient hero: headline, countdown, CTA buttons
│   │   ├── FlashSale.tsx         # Time-boxed deals with flash countdown
│   │   ├── Bundles.tsx           # Bundle deal cards with aggregate pricing
│   │   ├── Testimonials.tsx      # 4-up customer quote cards
│   │   ├── FAQ.tsx               # Accordion FAQ with open/close state via props
│   │   ├── Blog.tsx              # 3-article preview grid
│   │   └── Newsletter.tsx        # Email capture form (React 19 form action)
│   │
│   ├── product/
│   │   ├── ProductCard.tsx       # Product article card: badge, price, add-to-cart, compare
│   │   └── ProductModal.tsx      # Full-detail overlay: features list, share, wishlist
│   │
│   ├── filters/
│   │   └── ProductFilters.tsx    # Search, category, rating, sort, price-range controls
│   │
│   ├── cart/
│   │   └── Cart.tsx              # Sticky sidebar: items, quantity, promo, totals, checkout CTA
│   │
│   └── checkout/
│       └── CheckoutModal.tsx     # 3-step modal: Address → Review → Confirmed
│
├── lib/
│   ├── types.ts                  # Shared TypeScript types
│   ├── constants.ts              # Currency rates, promo codes, thresholds, dates
│   ├── data.ts                   # Static content: products, bundles, testimonials, …
│   ├── utils.ts                  # effectivePrice, badgeColors, generateOrderId
│   └── pptx.ts                   # buildPptx() — generates branded PowerPoint catalog
│
├── public/                       # Static assets served at /
│   └── *.svg
│
├── styles.css                    # Semantic component styles (card, hero, cart, …)
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config (strict, @/* alias → ./)
├── postcss.config.mjs            # Tailwind PostCSS plugin
└── package.json
```

---

## Data Flow

```
Static Data (lib/data.ts)
        │
        │  imported at module load
        ▼
app/page.tsx  ─── reads localStorage on mount ──▶  hydrates state
        │
        │  filteredProducts (useMemo)
        ├──────────────────────────────────▶  ProductFilters (read-only)
        │                                          │ onSearchChange / onSortChange / …
        │                                          └──────────────────────────────▶ setState
        │
        │  filteredProducts
        ├──────────────────────────────────▶  ProductCard × N
        │                                          │ onAddToCart / onToggleWishlist
        │                                          └──────────────────────────────▶ setCart / setWishlist
        │
        │  cart, subtotal, total, coupon
        ├──────────────────────────────────▶  CartSidebar
        │                                          │ onCheckout
        │                                          └──────────────────────────────▶ setCheckoutStep("address")
        │
        │  checkoutStep, address, cart, total
        ├──────────────────────────────────▶  CheckoutModal
        │                                          │ onConfirmOrder
        │                                          └──────────────────────────────▶ setCart([]), setLoyaltyPoints(+pts)
        │
        │  wishlist (Set<id>)
        ├──────────────────────────────────▶  buildPptx(wishlist)  ──▶  MarketHub-Catalog.pptx
        │
        │  state changes
        └──────────────────────────────────▶  localStorage (5 keys persisted)

Currency conversion:
  fmt(usdAmount) = SYMBOLS[currency] + Math.round(usdAmount × RATES[currency])
  ── passed as a prop to every component that displays a price ──
```

### Checkout State Machine

```
   [idle] ──onCheckout──▶ [address] ──onNextStep──▶ [review] ──onConfirmOrder──▶ [confirmed]
     ▲                        │                         │
     │                        │ onClose / Escape        │ onPrevStep
     └────────────────────────┴─────────────────────────┘
```

---

## Module Reference

### `lib/types.ts`

| Type | Description |
|---|---|
| `Product` | Core product shape: id, name, price, category, rating, features, optional discount/badge/stock/soldToday |
| `CartItem` | `Product & { quantity: number }` |
| `SortOption` | `"default" \| "price-asc" \| "price-desc" \| "rating-desc" \| "reviews-desc"` |
| `Toast` | `{ id, message, type: "success" \| "error" \| "info" }` |
| `Currency` | `"USD" \| "EUR" \| "GBP"` |
| `CheckoutStep` | `"idle" \| "address" \| "review" \| "confirmed"` |
| `Address` | `{ name, email, company, country }` |
| `Bundle` | `{ id, name, tagline, productIds[], discount }` |
| `Testimonial` | `{ name, role, company, content, rating }` |
| `Article` | `{ category, title, excerpt, readTime, date }` |
| `FlashSaleItem` | `{ productId, flashPrice, label }` |

### `lib/constants.ts`

| Export | Value |
|---|---|
| `RATES` | `{ USD: 1, EUR: 0.92, GBP: 0.79 }` |
| `SYMBOLS` | `{ USD: "$", EUR: "€", GBP: "£" }` |
| `MAX_PRICE` | `299` |
| `FREE_DELIVERY_THRESHOLD` | `150` |
| `OFFER_END` | `2026-04-01` — drives hero countdown |
| `FLASH_END` | `2026-03-28` — drives flash-sale countdown |
| `COUNTRIES` | 11-item country list for checkout address form |
| `PROMO_CODES` | `{ SAVE10, WELCOME20, BUNDLE15 }` with discount % and label |

### `lib/utils.ts`

| Function | Signature | Purpose |
|---|---|---|
| `effectivePrice` | `(p: Product) => number` | Applies optional product discount to base price |
| `badgeColors` | `(badge) => string` | Returns Tailwind classes for Bestseller / New / Hot / Popular badges |
| `generateOrderId` | `() => string` | Returns a random `MH-XXXXXX` order reference |

### `lib/pptx.ts`

`buildPptx(wishlist: Set<number>): void` — Generates and downloads `MarketHub-Catalog.pptx` with:

1. **Cover slide** — branding, tagline, 3 social-proof stats
2. **Catalog overview** — all 6 products in a grid; wishlisted items highlighted amber
3. **Per-product slides** — full detail: category, badge, description, features checklist, price box, rating
4. **Testimonials slide** — 2×2 customer quote cards
5. **Wishlist slide** — only rendered when `wishlist.size > 0`; itemised list with total

---

## Getting Started

**Prerequisites:** Node.js 20+, npm 10+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Available promo codes to test:**

| Code | Discount |
|---|---|
| `SAVE10` | 10% off |
| `WELCOME20` | 20% off |
| `BUNDLE15` | 15% off |

---

## Development

```bash
npm run dev      # Next.js dev server with Turbopack
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint
```

### Adding a product

Edit [`lib/data.ts`](lib/data.ts) — add an entry to the `products` array following the `Product` type. No other files need changing; the product catalog, filters, PPT export, and bundle builder all read from this single source.

### Adding a promo code

Edit [`lib/constants.ts`](lib/constants.ts) — add a key to `PROMO_CODES`:

```ts
MY_CODE: { discount: 30, label: "30% special discount" },
```

### Changing currency rates

Edit [`lib/constants.ts`](lib/constants.ts) — update `RATES`. All `fmt()` calls throughout the app pick up the change automatically.

---

## Build & Deployment

```bash
npm run build
```

The build output is a standard Next.js App Router application. Deploy to any platform that supports Node.js or Next.js:

- **Vercel** — zero-config, push to `main` to deploy
- **Docker** — use the official `node:20-alpine` base image with `next start`
- **Static export** — not applicable; the app uses client-side state and `"use client"` throughout

### Environment variables

No environment variables are required for the current feature set. All data is static and all state is client-side.

When backend integrations are added (payments, database, email), create a `.env.local` file:

```bash
# Example future variables
STRIPE_SECRET_KEY=
DATABASE_URL=
RESEND_API_KEY=
```

---

## Roadmap

The current implementation is a frontend-complete prototype. Future production work would include:

- [ ] Payment processing (Stripe)
- [ ] Authentication (Next.js Auth / Clerk)
- [ ] Database for orders and inventory (PostgreSQL + Prisma)
- [ ] Transactional email on order confirmation (Resend)
- [ ] Admin dashboard for product and order management
- [ ] Server-side personalisation via React Server Components

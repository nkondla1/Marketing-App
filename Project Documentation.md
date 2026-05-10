# Project Documentation — MarketHub Marketing App

**Version:** 1.0  
**Last Updated:** 2026-05-10  
**Status:** Active Development (Frontend Complete)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Criteria](#2-goals--success-criteria)
3. [Target Users](#3-target-users)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 Product Catalog
   - 4.2 Search & Filtering
   - 4.3 Shopping Cart
   - 4.4 Promotional Pricing
   - 4.5 Multi-Currency Support
   - 4.6 Checkout Flow
   - 4.7 Wishlist
   - 4.8 Product Comparison
   - 4.9 PowerPoint Export
   - 4.10 Loyalty Points
   - 4.11 Newsletter Signup
   - 4.12 Blog Preview
   - 4.13 User Preferences
5. [Business Rules](#5-business-rules)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Requirements](#7-data-requirements)
8. [UI/UX Requirements](#8-uiux-requirements)
9. [Out of Scope](#9-out-of-scope)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Project Overview

**MarketHub** is a digital marketing e-commerce storefront that sells premium marketing resources — playbooks, templates, toolkits, and expert consulting services — to marketing professionals, startup founders, and growth teams.

The platform enables users to discover, evaluate, and purchase digital products without a physical inventory or shipping logistics. All products deliver instant access via download links sent by email after checkout.

**Core value proposition:** Professionals save 100+ hours per quarter by purchasing battle-tested marketing frameworks instead of building them from scratch.

---

## 2. Goals & Success Criteria

| Goal | Success Metric |
|---|---|
| Drive product discovery | Users view at least 3 products per session |
| Increase average order value | Bundle attach rate ≥ 25% of orders |
| Minimize cart abandonment | Checkout completion rate ≥ 60% |
| Build retention | Newsletter subscriber growth month-over-month |
| Demonstrate trust | Social proof (ratings, testimonials, press logos) visible above the fold |

---

## 3. Target Users

### Primary: Solo Marketing Professional
- **Role:** Freelancer, consultant, or in-house marketer at a startup
- **Goal:** Find ready-to-use frameworks and templates to run campaigns faster
- **Pain point:** Spends too much time building materials from scratch
- **Purchase behavior:** Price-sensitive; responds to discounts and money-back guarantees

### Secondary: Marketing Team Lead / VP
- **Role:** Head of Marketing or VP at a growth-stage company
- **Goal:** Equip the team with standardized processes and tools
- **Pain point:** Inconsistent quality across team-produced materials
- **Purchase behavior:** Values ROI and case studies; likely to purchase bundles or the Growth Audit service

### Tertiary: Marketing Agency
- **Role:** Agency owner or account manager running campaigns for multiple clients
- **Goal:** Scale output without proportionally scaling headcount
- **Pain point:** Recreating similar deliverables for every client
- **Purchase behavior:** Interested in licensing; high lifetime value if retained

---

## 4. Functional Requirements

### 4.1 Product Catalog

**Purpose:** Allow users to browse all available products in a structured, filterable grid.

| ID | Requirement |
|---|---|
| PC-01 | The catalog must display all products in a responsive grid (2 columns on desktop, 1 on mobile) |
| PC-02 | Each product card must show: name, description (truncated to 2 lines), star rating, review count, price, discount badge if applicable, category chip, and badge (Bestseller / New / Popular / Hot) |
| PC-03 | Products with low stock (≤ 5 units) must show a "Only N left!" warning badge |
| PC-04 | Products with a `soldToday` value must show a "🔥 N sold today" social-proof indicator |
| PC-05 | Clicking a product name or "View details" opens a full-detail modal without navigating away from the page |
| PC-06 | The product detail modal must list all included features, full description, price with discount, rating, and action buttons (Add to Cart, Wishlist, Share) |
| PC-07 | The share button copies a formatted product description + price to the clipboard and shows a confirmation state for 2 seconds |

**Product Categories:**

| Category | Description |
|---|---|
| Guide | Long-form educational content (playbooks, courses) |
| Template | Ready-to-use files (email sequences, calendars) |
| Toolkit | Collections of tools and assets bundled together |
| Service | 1-on-1 expert sessions (Growth Audit) |

**Current Product Catalog (6 products):**

| ID | Product | Category | Base Price | Discount |
|---|---|---|---|---|
| 1 | Growth Marketing Playbook | Guide | $49 | 20% |
| 2 | Content Funnel Blueprint | Template | $75 | — |
| 3 | Marketing Automation Toolkit | Toolkit | $99 | — |
| 4 | Quarterly Growth Audit | Service | $299 | — |
| 5 | Social Media Calendar Bundle | Template | $39 | — |
| 6 | Email Marketing Masterclass | Guide | $129 | 20% |

---

### 4.2 Search & Filtering

**Purpose:** Help users narrow down the catalog to products that match their specific needs.

| ID | Requirement |
|---|---|
| SF-01 | A text search input must filter products by name and description in real time (no submit required) |
| SF-02 | Category filter buttons must appear above the grid; selecting a category shows only matching products; selecting an active category deselects it (returns to "All") |
| SF-03 | A minimum rating filter must support options: Any, 4.5★+, 4.7★+, 4.9★+ |
| SF-04 | A price range slider must cap the displayed products at the selected maximum price (based on effective/discounted price, not base price) |
| SF-05 | A sort selector must support: Default, Price Low → High, Price High → Low, Highest Rated, Most Reviewed |
| SF-06 | All filters stack — a user can combine search text + category + rating + price range + sort simultaneously |
| SF-07 | A "Clear all filters" link must appear whenever any non-default filter is active |
| SF-08 | When no products match, a friendly empty state must appear with a "Clear all filters" action |
| SF-09 | The product count heading ("N Products") must update to reflect the current filtered result set |

---

### 4.3 Shopping Cart

**Purpose:** Allow users to accumulate products and manage quantities before checkout.

| ID | Requirement |
|---|---|
| CA-01 | The cart must be accessible as a sticky sidebar on desktop and inline on mobile |
| CA-02 | Adding a product already in the cart increments its quantity rather than adding a duplicate line item |
| CA-03 | Each cart line must show: product name, unit price (effective/discounted), quantity controls (− / +), line total, and a remove button |
| CA-04 | Reducing quantity to zero removes the item from the cart |
| CA-05 | The cart must show a free-delivery progress bar; threshold is **$150 USD** |
| CA-06 | When the cart total meets or exceeds $150, the progress bar is replaced with a "You qualify for free delivery!" confirmation |
| CA-07 | Cart state must persist to `localStorage` under key `mh_cart` so it survives page refresh |
| CA-08 | A "Clear Cart" button must appear when the cart contains at least one item |
| CA-09 | The cart count in the header must reflect the total number of units (not distinct products) |
| CA-10 | A toast notification must appear whenever an item is added to the cart |

---

### 4.4 Promotional Pricing

**Purpose:** Drive urgency and increase conversion through time-limited deals, bundles, and promo codes.

#### Product Discounts

| ID | Requirement |
|---|---|
| PD-01 | Products may carry a percentage discount field; the effective price is `base_price × (1 − discount / 100)` |
| PD-02 | Discounted products must show the effective price prominently and the original price struck through |
| PD-03 | A discount badge (e.g., "−20%") must be visible on both the product card and the detail modal |

#### Flash Sale

| ID | Requirement |
|---|---|
| FS-01 | A dedicated Flash Sale section must appear above the main product grid |
| FS-02 | Flash sale items are a curated subset of products with a specific flash price lower than the product's standard effective price |
| FS-03 | A live countdown timer (hrs / min / sec) must display time remaining until the flash sale ends |
| FS-04 | Adding a flash deal item to the cart must use the flash price, not the standard price |
| FS-05 | The savings percentage relative to the standard price must be displayed on each flash deal card |

#### Bundles

| ID | Requirement |
|---|---|
| BU-01 | Bundle deals must be displayed in a dedicated section below the main product grid |
| BU-02 | Each bundle must list its constituent products, show the bundle discount percentage, the bundle total price, and the savings amount compared to buying products individually |
| BU-03 | "Add Bundle to Cart" adds all constituent products as individual line items; if any product is already in the cart, its quantity increments |
| BU-04 | Bundle discount is applied as a percentage off the sum of effective prices of all constituent products |

**Current Bundles:**

| Bundle | Products Included | Discount |
|---|---|---|
| Starter | Growth Marketing Playbook + Social Media Calendar Bundle | 15% |
| Pro | Content Funnel Blueprint + Marketing Automation Toolkit + Email Marketing Masterclass | 20% |
| Agency | Growth Marketing Playbook + Content Funnel Blueprint + Marketing Automation Toolkit + Email Marketing Masterclass | 25% |

#### Promo Codes

| ID | Requirement |
|---|---|
| PR-01 | A promo code input must appear in the cart sidebar |
| PR-02 | Codes are case-insensitive; validation is performed on the trimmed, uppercased value |
| PR-03 | A valid code applies a percentage discount to the cart subtotal (after product-level discounts) |
| PR-04 | Only one promo code may be active at a time |
| PR-05 | An invalid code must show an inline error message with hints (e.g., "Try SAVE10, WELCOME20, or BUNDLE15") |
| PR-06 | The applied code and its label must be shown as a confirmation below the input |
| PR-07 | The code input must support submission by pressing Enter |
| PR-08 | Promo codes reset when an order is confirmed |

**Active Promo Codes:**

| Code | Discount | Description |
|---|---|---|
| `SAVE10` | 10% | Standard repeat-visitor discount |
| `WELCOME20` | 20% | New visitor welcome discount |
| `BUNDLE15` | 15% | Bundle purchase discount |

#### Offer Countdown

| ID | Requirement |
|---|---|
| OC-01 | The hero section must display a live countdown (days / hrs / min / sec) to the campaign end date |
| OC-02 | The campaign end date is **2026-04-01 00:00:00** |
| OC-03 | The timer must update every second |

---

### 4.5 Multi-Currency Support

**Purpose:** Serve international customers by displaying prices in their local currency.

| ID | Requirement |
|---|---|
| MC-01 | The application must support three currencies: USD ($), EUR (€), GBP (£) |
| MC-02 | A currency switcher in the header allows instant switching; all prices update immediately without page reload |
| MC-03 | Conversion is calculated as `Math.round(usdAmount × rate)` — rounding to the nearest whole unit |
| MC-04 | Exchange rates are static (not fetched from a live API): USD 1.00, EUR 0.92, GBP 0.79 |
| MC-05 | The selected currency must persist to `localStorage` under key `mh_currency` |
| MC-06 | All price display throughout the app (product cards, cart, checkout review, flash sale) must use the active currency |

---

### 4.6 Checkout Flow

**Purpose:** Guide the user from cart to order confirmation in the minimum number of steps.

| ID | Requirement |
|---|---|
| CO-01 | Checkout is a 3-step modal flow: **Address → Review → Confirmed** |
| CO-02 | The modal must display a progress indicator showing which step is active and which are completed |
| CO-03 | The checkout button in the cart must be disabled and labeled "Cart Empty" when the cart contains no items |
| CO-04 | **Step 1 — Address:** Collect Full Name (required), Email Address (required), Company (optional), Country (required, dropdown with 11 options) |
| CO-05 | All required fields must use HTML5 native validation (the form's `action` is invoked only when all required fields pass) |
| CO-06 | **Step 2 — Review:** Display all cart items with quantities and line totals, any applied coupon discount, the grand total, and the delivery address entered in Step 1 |
| CO-07 | Step 2 must show a preview of loyalty points the user will earn on this order: `Math.floor(total_in_USD)` points |
| CO-08 | **Step 3 — Confirmed:** Display a success message, the generated order reference (format: `MH-XXXXXX`), and a loyalty points earned summary |
| CO-09 | Confirming an order must: generate an order ID, award loyalty points, clear the cart, reset the applied promo code |
| CO-10 | The Escape key must close the checkout modal on Steps 1 and 2; Step 3 (Confirmed) cannot be dismissed by Escape — only the "Continue Shopping" button closes it |
| CO-11 | Clicking the backdrop on Steps 1 or 2 closes the modal |
| CO-12 | Download link delivery and payment processing are outside the scope of the current implementation (see Section 9) |

---

### 4.7 Wishlist

**Purpose:** Allow users to save products for later consideration without adding them to the cart.

| ID | Requirement |
|---|---|
| WL-01 | Any product can be toggled in/out of the wishlist via a heart (♥) icon on the product card and in the product detail modal |
| WL-02 | Wishlisted products are highlighted with an amber background on their product card |
| WL-03 | A wishlist panel appears in the sidebar when at least one item is saved; it lists product names, effective prices, and a quick "+Cart" button per item |
| WL-04 | The wishlist count is shown in the header (♥ N) when non-empty |
| WL-05 | The wishlisted product IDs must persist to `localStorage` under key `mh_wishlist` |
| WL-06 | Adding/removing a wishlist item must show a toast notification |
| WL-07 | Wishlisted products are highlighted in the PowerPoint export (amber border on the catalog overview slide and a dedicated Wishlist slide) |

---

### 4.8 Product Comparison

**Purpose:** Help undecided users choose between two products by viewing them side by side.

| ID | Requirement |
|---|---|
| CP-01 | Each product card must include a "⇄" compare toggle button |
| CP-02 | A maximum of 2 products may be selected for comparison at once; attempting to add a third shows an error toast |
| CP-03 | When 1 product is selected, the header compare button shows "⇄ 1/2"; when 2 are selected, it shows "⇄ 2/2 →" and becomes clickable |
| CP-04 | The compare bar below the filters shows the names of currently selected products and a "View comparison" link (visible when 2 are selected) |
| CP-05 | The comparison modal opens side-by-side cards showing: badge, name, description, price (with discount), rating, feature list, and an "Add to Cart" button |
| CP-06 | Adding a product from the compare modal closes the modal and clears the compare list |
| CP-07 | The Escape key dismisses the compare modal |

---

### 4.9 PowerPoint Export

**Purpose:** Allow users (especially B2B/agency customers) to share the product catalog with stakeholders or clients in a standard presentation format.

| ID | Requirement |
|---|---|
| EX-01 | An "Export PPT" button must be available in the header (desktop only) and in both the hero section and footer |
| EX-02 | The export generates a file named `MarketHub-Catalog.pptx` using the `pptxgenjs` library |
| EX-03 | The presentation must contain: Cover slide, Catalog overview slide, one slide per product, Testimonials slide, and a Wishlist slide (only if wishlist is non-empty) |
| EX-04 | The Cover slide must include: brand name, tagline, and 3 social-proof stats (Customers Served, Average Rating, Revenue Generated) |
| EX-05 | The Catalog overview slide shows all products in a 3-column grid; wishlisted items appear with an amber background and border |
| EX-06 | Per-product slides must include: category label, badge, wishlist indicator (if applicable), product name, description, features checklist, price box, and ratings box |
| EX-07 | The Wishlist slide lists saved items with their categories and effective prices, plus a wishlist total |
| EX-08 | A toast notification confirms when the export has been triggered |

---

### 4.10 Loyalty Points

**Purpose:** Reward repeat customers and increase purchase frequency.

| ID | Requirement |
|---|---|
| LP-01 | Loyalty points are earned at a rate of 1 point per $1 USD of order total: `Math.floor(total_in_USD)` |
| LP-02 | Points are awarded immediately upon order confirmation |
| LP-03 | The current point balance must persist to `localStorage` under key `mh_points` |
| LP-04 | The header must display the balance (⭐ N pts) when the user has accumulated any points |
| LP-05 | Product cards must show "+N pts" (estimated earnings) when the user's current balance is 0 — this acts as an onboarding incentive |
| LP-06 | The checkout review step must preview points to be earned on the current order |
| LP-07 | The order confirmation step must show points earned and the updated total balance |
| LP-08 | Point redemption against future orders is a future enhancement (see Section 10) |

---

### 4.11 Newsletter Signup

**Purpose:** Build an owned marketing channel for product announcements and free content.

| ID | Requirement |
|---|---|
| NS-01 | A newsletter signup section must appear below the blog preview, before the footer |
| NS-02 | The form must collect a valid email address (HTML5 `type="email"` with `required` attribute) |
| NS-03 | The form uses a React 19 form action (`<form action={handler}>`) — no `e.preventDefault()` required |
| NS-04 | Successful submission replaces the form with a "🎉 You're subscribed!" confirmation state |
| NS-05 | A toast notification confirms subscription |
| NS-06 | The confirmed state persists for the session (in-memory React state; refreshing the page resets it) |
| NS-07 | Actual email delivery to a mailing list provider is a future integration (see Section 10) |

---

### 4.12 Blog Preview

**Purpose:** Demonstrate content authority, drive organic search traffic, and provide a soft conversion path for visitors not yet ready to purchase.

| ID | Requirement |
|---|---|
| BP-01 | The blog preview section must display the 3 most recent articles |
| BP-02 | Each article card must show: category label, title, excerpt (truncated to 3 lines), publish date, and read time |
| BP-03 | A "View all →" link must appear in the section header (links to a full blog, which is a future page) |
| BP-04 | Article content and routing are outside the current scope; cards are non-navigable placeholders |

**Current Articles:**

| Title | Category | Date | Read Time |
|---|---|---|---|
| The $0–$1M Marketing Playbook: What Works in 2026 | Growth Strategy | Mar 20 | 8 min |
| Why Your Email Open Rates Are Declining (And How to Fix It) | Email Marketing | Mar 14 | 6 min |
| 5 Automations Every Marketing Team Should Set Up This Week | Automation | Mar 8 | 5 min |

---

### 4.13 User Preferences

**Purpose:** Personalize the experience and respect user choices across sessions.

| ID | Requirement |
|---|---|
| UP-01 | **Dark Mode:** A toggle in the header and footer switches between light and dark themes; preference persists to `localStorage` under key `mh_dark` |
| UP-02 | **Currency:** Persists to `localStorage` under key `mh_currency` (see Section 4.5) |
| UP-03 | **Recently Viewed:** The last 4 products opened in the detail modal are shown in a horizontal scroll strip above the filters section |
| UP-04 | **Back-to-Top:** A floating button appears in the bottom-left corner after the user scrolls more than 500 px; clicking it smoothly scrolls back to the top |
| UP-05 | **Keyboard:** The Escape key closes any open modal (Product Detail, Compare, Checkout Steps 1 and 2) |
| UP-06 | All `localStorage` reads must be wrapped in try/catch to handle restricted browser environments (incognito with storage blocked, etc.) |

---

## 5. Business Rules

| Rule | Description |
|---|---|
| BR-01 | Effective price always takes product-level discount into account: `price × (1 − discount / 100)` |
| BR-02 | Promo code discount is applied on top of product discounts (i.e., on the subtotal after product discounts) |
| BR-03 | Bundle discount is applied to the sum of effective prices (after product discounts) of constituent products |
| BR-04 | Flash sale prices override all other pricing for those specific products when added via the flash sale section |
| BR-05 | Free delivery threshold ($150) is compared against the pre-coupon subtotal |
| BR-06 | Loyalty points are calculated from the final order total (after coupon discount), in USD |
| BR-07 | A maximum of 2 products may be in the compare list at any time |
| BR-08 | Order ID format: `"MH-" + 6 random alphanumeric characters (uppercase)` |
| BR-09 | All prices are stored and calculated in USD internally; display conversion is applied at render time only |
| BR-10 | The "Only N left!" badge appears when `stock ≤ 5`; stock values are static (no real inventory system) |

---

## 6. Non-Functional Requirements

### Performance
| ID | Requirement |
|---|---|
| NF-01 | The initial page load must be usable within 3 seconds on a standard broadband connection |
| NF-02 | Product filtering and sorting must respond in under 100 ms (all operations are in-memory; no network calls) |
| NF-03 | Countdown timers must update at 1-second intervals without causing layout shifts |

### Accessibility
| ID | Requirement |
|---|---|
| NF-04 | All interactive elements (buttons, inputs) must have accessible labels (`aria-label` where icon-only) |
| NF-05 | Modal dialogs must trap focus and support Escape-to-close |
| NF-06 | Color contrast must meet WCAG AA for all text in both light and dark modes |
| NF-07 | The cart quantity controls (− / +) must be keyboard-navigable |

### Browser & Device Support
| ID | Requirement |
|---|---|
| NF-08 | The app must be fully functional on the latest two stable versions of Chrome, Firefox, Safari, and Edge |
| NF-09 | The layout must be responsive from 320 px (mobile) to 1440 px+ (desktop); single-column below 900 px |
| NF-10 | The PowerPoint export button is hidden on mobile (`hidden sm:flex`) to avoid accidental file downloads on phones |

### Data Persistence
| ID | Requirement |
|---|---|
| NF-11 | All `localStorage` operations must be guarded with try/catch |
| NF-12 | The app must render `null` until client-side mount completes (`mounted` state gate) to prevent SSR/hydration mismatches |

### Security
| ID | Requirement |
|---|---|
| NF-13 | No sensitive data is stored in `localStorage` (no payment info, no real order data) |
| NF-14 | The promo code validation is client-side only; this is acceptable for the current prototype but must move server-side before production launch |

---

## 7. Data Requirements

### Static Data (current implementation)
All data lives in `lib/data.ts` and is bundled at build time. No database or API calls are made.

| Dataset | Record Count | Source |
|---|---|---|
| Products | 6 | `lib/data.ts` |
| Bundles | 3 | `lib/data.ts` |
| Testimonials | 4 | `lib/data.ts` |
| FAQs | 6 | `lib/data.ts` |
| Flash Sale Items | 2 | `lib/data.ts` |
| Blog Articles | 3 | `lib/data.ts` |
| Press Logos | 6 | `lib/data.ts` |

### Client-Side Persistent State (localStorage)

| Key | Contents | Type |
|---|---|---|
| `mh_cart` | Serialised array of `CartItem` | JSON |
| `mh_wishlist` | Serialised array of wishlisted product IDs | JSON |
| `mh_dark` | Dark mode preference (`"1"` or `"0"`) | String |
| `mh_currency` | Active currency (`"USD"`, `"EUR"`, `"GBP"`) | String |
| `mh_points` | Accumulated loyalty points | String (number) |

### Future Data Requirements (see Section 10)
When backend services are added, the following will require persistent storage:
- User accounts (email, hashed password, profile)
- Orders (line items, totals, discount applied, delivery address, status)
- Inventory (per-product stock levels with real-time decrement)
- Newsletter subscribers (email, opt-in timestamp, source)
- Loyalty points ledger (per-user transaction history)

---

## 8. UI/UX Requirements

### Layout
| ID | Requirement |
|---|---|
| UX-01 | The header is sticky (fixed to the top during scroll) |
| UX-02 | The cart sidebar is sticky on desktop (`lg:sticky lg:top-20`) so it remains visible while scrolling the product grid |
| UX-03 | The main content area uses a `max-w-7xl` container centered on the page |
| UX-04 | The hero, flash sale, and newsletter sections span the full viewport width (breaking out of the container) |

### Feedback & Notifications
| ID | Requirement |
|---|---|
| UX-05 | Toast notifications appear in the bottom-right corner, stacked vertically, and auto-dismiss after 3.5 seconds |
| UX-06 | Toast types: success (green), error (red), info (blue) |
| UX-07 | The promo code input shows inline validation feedback (error text below the input) |
| UX-08 | The share button shows a ✓ checkmark for 2 seconds after copying to clipboard |

### Social Proof
| ID | Requirement |
|---|---|
| UX-09 | The hero section must display 3 key stats: "1,200+ Customers served", "4.8★ Average rating", "$10M+ Revenue generated" |
| UX-10 | Press logo strip ("Featured In") must display between the testimonials and FAQ sections |
| UX-11 | The promo banner below the hero must show all three active promo codes formatted as `code · code · code` |

### Theming
| ID | Requirement |
|---|---|
| UX-12 | **Light mode:** white cards on a blue-tinted gradient background, blue primary actions |
| UX-13 | **Dark mode:** slate-900 background, slate-800 cards, muted slate-400 text, amber loyalty accents |
| UX-14 | The dark/light state must apply immediately (no CSS transition delay on toggle) |

---

## 9. Out of Scope

The following are explicitly **not** requirements for the current implementation:

| Item | Notes |
|---|---|
| Payment processing | No Stripe, PayPal, or other payment gateway integration |
| Real checkout / order fulfillment | The "Confirm & Pay" button simulates an order; no money changes hands |
| User authentication | No sign-up, login, or session management |
| Backend API | All data is static; no database reads or writes |
| Email delivery | Newsletter subscriptions and order confirmations are client-side only |
| Real inventory management | Stock values are static constants, not decremented on purchase |
| Multi-page routing | The app is a single page; there are no separate product detail pages, checkout pages, or account pages |
| Admin dashboard | Product, order, and customer management is out of scope |
| Internationalisation (i18n) | The app is English-only; multi-currency display is included but full i18n (dates, text translation) is not |
| SEO beyond metadata | Static metadata is set in `app/layout.tsx`; dynamic per-product metadata requires server rendering |

---

## 10. Future Enhancements

Listed in approximate priority order:

| Priority | Enhancement | Rationale |
|---|---|---|
| P0 | Payment integration (Stripe) | Required before any revenue can be generated |
| P0 | Order fulfillment (send download links by email) | Required for product delivery |
| P1 | User authentication (Clerk or NextAuth) | Enables order history, saved preferences, and loyalty account |
| P1 | Database (PostgreSQL + Prisma) | Persistent orders, inventory, subscribers |
| P1 | Email (Resend or Postmark) | Order confirmations, newsletter delivery |
| P2 | Point redemption | Allow loyalty points to be redeemed as a discount on future orders |
| P2 | Admin dashboard | Manage products, view orders, see analytics |
| P2 | Dynamic product pages with SEO metadata | Improve search visibility per product |
| P3 | Internationalisation (next-intl) | Serve non-English-speaking markets |
| P3 | A/B testing (pricing, bundle composition) | Optimise conversion rates |
| P3 | Live inventory via API | Accurate stock counts; auto-hide sold-out products |
| P3 | Affiliate / referral system | Enable word-of-mouth growth |

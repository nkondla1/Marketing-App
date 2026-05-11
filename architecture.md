# MarketHub — Architecture

> Living reference document. Update this file whenever a new layer, module, or integration is added.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Layer Architecture](#3-layer-architecture)
4. [Directory Map](#4-directory-map)
5. [Frontend Storefront Architecture](#5-frontend-storefront-architecture)
   - 5.1 [State Orchestrator Pattern](#51-state-orchestrator-pattern)
   - 5.2 [Component Hierarchy](#52-component-hierarchy)
   - 5.3 [Data Flow](#53-data-flow)
   - 5.4 [Checkout State Machine](#54-checkout-state-machine)
   - 5.5 [Persistence (localStorage)](#55-persistence-localstorage)
6. [AI Scheduling Agent Architecture](#6-ai-scheduling-agent-architecture)
   - 6.1 [Agent Overview](#61-agent-overview)
   - 6.2 [Agentic Loop](#62-agentic-loop)
   - 6.3 [Tool Definitions](#63-tool-definitions)
   - 6.4 [In-Memory Task Store](#64-in-memory-task-store)
   - 6.5 [Agent Request Lifecycle](#65-agent-request-lifecycle)
7. [API Layer](#7-api-layer)
8. [Security Architecture](#8-security-architecture)
   - 8.1 [Request Security Pipeline](#81-request-security-pipeline)
   - 8.2 [Rate Limiting](#82-rate-limiting)
   - 8.3 [Security Headers](#83-security-headers)
9. [Module Dependency Graph](#9-module-dependency-graph)
10. [CI/CD Pipeline Architecture](#10-cicd-pipeline-architecture)
11. [Key Architectural Decisions](#11-key-architectural-decisions)
12. [Scaling Roadmap](#12-scaling-roadmap)

---

## 1. System Overview

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                            MarketHub System                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   Browser                            Next.js 16 Server                      ║
║  ┌──────────────────────┐           ┌───────────────────────────────────┐   ║
║  │                      │  HTTP(S)  │                                   │   ║
║  │  React 19 SPA        │◄─────────►│  proxy.ts (rate limit + headers)  │   ║
║  │  ─────────────────   │           │           │                       │   ║
║  │  Storefront UI       │           │   ┌───────┴──────────────────┐   │   ║
║  │  AgentPanel (chat)   │           │   │   App Router             │   │   ║
║  │  TaskList (schedule) │           │   │   app/page.tsx           │   │   ║
║  │                      │           │   │   app/api/agent/*        │   │   ║
║  │  localStorage        │           │   └───────────────────┬──────┘   │   ║
║  │  (5 persisted keys)  │           │                       │           │   ║
║  └──────────────────────┘           └───────────────────────┼───────────┘   ║
║                                                             │               ║
║                                                             │ HTTPS         ║
║                                                             ▼               ║
║                                                   ┌──────────────────┐      ║
║                                                   │  Anthropic API   │      ║
║                                                   │  claude-sonnet-  │      ║
║                                                   │  4-6             │      ║
║                                                   └──────────────────┘      ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

MarketHub is a **hybrid application**: a fully client-rendered storefront layered on top of Next.js App Router server infrastructure. The server provides API routes for the AI agent (which must keep the Anthropic API key server-side) and a security proxy; all storefront UI runs in the browser using React 19 client components.

---

## 2. Technology Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.0 | Routing, API routes, server proxy |
| UI | React | 19.2.4 | Component model, form actions |
| Language | TypeScript | 5.x | End-to-end type safety |
| Styling | Tailwind CSS 4 | 4.x | Utility-first UI |
| Custom CSS | styles.css | — | Semantic component classes |
| AI SDK | @anthropic-ai/sdk | latest | Claude API client (server-side only) |
| Validation | Zod | 4.x | API request schema validation |
| Export | pptxgenjs | 4.0.1 | Client-side PowerPoint generation |
| Linting | ESLint + eslint-config-next | 9.x | Code quality |
| CI | GitHub Actions | — | Lint, type-check, build, audit |
| Security Scan | Gitleaks, CodeQL | — | Secret detection, static analysis |

---

## 3. Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 5 — CI/CD & Security Scanning                                    │
│  .github/workflows/ci.yml         .github/workflows/security.yml        │
│  Lint → TypeCheck → Build → Audit  Gitleaks · Dependency Review · CodeQL│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 4 — Security Proxy   (proxy.ts)                                  │
│  Runs on every /api/* request before it reaches any route handler       │
│  ▪ IP-based rate limiting (30 req/min general · 10 req/min /api/agent)  │
│  ▪ Optional x-api-key guard for server-to-server agent calls            │
│  ▪ Hardened response headers on all API responses                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 3 — API Routes   (app/api/)                                      │
│  POST /api/agent          → runAgent() → Anthropic API (agentic loop)   │
│  GET  /api/agent/tasks    → taskStore.getAll()                          │
│  POST /api/agent/tasks    → taskStore.create()                          │
│  GET|PATCH|DELETE /api/agent/tasks/[id]  → taskStore operations         │
│  GET  /api/agent/health   → status + config check                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 2 — Business Logic   (lib/)                                      │
│                                                                         │
│  lib/types.ts       Shared TypeScript types (Product, CartItem, …)      │
│  lib/constants.ts   RATES, PROMO_CODES, thresholds, dates               │
│  lib/data.ts        Static data arrays (products, bundles, articles, …) │
│  lib/utils.ts       Pure helpers (effectivePrice, badgeColors, …)       │
│  lib/pptx.ts        PowerPoint generation (pptxgenjs, client-only)      │
│                                                                         │
│  lib/agent/types.ts    AgentTask, AgentMessage, TaskType, TaskStatus    │
│  lib/agent/store.ts    In-memory Map-based task store                   │
│  lib/agent/tools.ts    Claude tool definitions + executeTool()          │
│  lib/agent/client.ts   runAgent() — agentic loop + Anthropic SDK        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 1 — Presentation   (app/ + components/)                          │
│                                                                         │
│  app/layout.tsx     HTML shell, fonts, global metadata                  │
│  app/page.tsx       State orchestrator — all useState/handlers here     │
│                                                                         │
│  components/layout/      Header, Footer                                 │
│  components/marketing/   Hero, FlashSale, Bundles, Testimonials,        │
│                          FAQ, Blog, Newsletter                           │
│  components/product/     ProductCard, ProductModal                      │
│  components/filters/     ProductFilters                                 │
│  components/cart/        CartSidebar                                    │
│  components/checkout/    CheckoutModal                                  │
│  components/ui/          ToastList, CompareModal                        │
│  components/agent/       AgentPanel, TaskList                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Directory Map

```
Marketing App/
│
├── app/                              # Next.js App Router root
│   ├── layout.tsx                    # HTML shell, Geist fonts, global metadata
│   ├── page.tsx                      # State orchestrator (all useState lives here)
│   ├── globals.css                   # Tailwind base + CSS custom properties
│   ├── favicon.ico
│   └── api/
│       └── agent/
│           ├── route.ts              # POST /api/agent  — chat endpoint
│           ├── health/
│           │   └── route.ts          # GET /api/agent/health
│           └── tasks/
│               ├── route.ts          # GET, POST /api/agent/tasks
│               └── [id]/
│                   └── route.ts      # GET, PATCH, DELETE /api/agent/tasks/:id
│
├── components/
│   ├── agent/
│   │   ├── AgentPanel.tsx            # Floating chat panel (FAB + slide-in)
│   │   └── TaskList.tsx              # Scheduled task cards with cancel action
│   ├── cart/
│   │   └── Cart.tsx                  # Sticky sidebar: items, promo, totals, checkout CTA
│   ├── checkout/
│   │   └── CheckoutModal.tsx         # 3-step modal: Address → Review → Confirmed
│   ├── filters/
│   │   └── ProductFilters.tsx        # Search, category, rating, sort, price-range
│   ├── layout/
│   │   ├── Header.tsx                # Sticky header: logo, currency switcher, badges
│   │   └── Footer.tsx                # 4-column footer with dark-mode and PPT export
│   ├── marketing/
│   │   ├── Hero.tsx                  # Gradient hero with live countdown
│   │   ├── FlashSale.tsx             # Time-boxed deals, flash countdown
│   │   ├── Bundles.tsx               # Bundle deal cards
│   │   ├── Testimonials.tsx          # 4-up customer quotes
│   │   ├── FAQ.tsx                   # Accordion FAQ
│   │   ├── Blog.tsx                  # 3-article preview grid
│   │   └── Newsletter.tsx            # Email capture (React 19 form action)
│   ├── product/
│   │   ├── ProductCard.tsx           # Grid card: badge, price, add-to-cart, compare
│   │   └── ProductModal.tsx          # Detail overlay: features, share, wishlist
│   └── ui/
│       ├── Toast.tsx                 # Fixed-position toast notification stack
│       └── CompareModal.tsx          # Side-by-side product comparison overlay
│
├── lib/
│   ├── agent/
│   │   ├── types.ts                  # AgentTask, AgentMessage, TaskType, TaskStatus
│   │   ├── store.ts                  # In-memory task store (Map<id, AgentTask>)
│   │   ├── tools.ts                  # AGENT_TOOLS array + executeTool()
│   │   └── client.ts                 # runAgent() — agentic loop, Anthropic SDK
│   ├── types.ts                      # Storefront types (Product, CartItem, …)
│   ├── constants.ts                  # RATES, PROMO_CODES, MAX_PRICE, dates, COUNTRIES
│   ├── data.ts                       # Static arrays: products, bundles, articles, …
│   ├── utils.ts                      # effectivePrice(), badgeColors(), generateOrderId()
│   └── pptx.ts                       # buildPptx(wishlist) — PowerPoint export
│
├── public/                           # Static assets (SVGs)
├── styles.css                        # Semantic component CSS classes
├── proxy.ts                          # Next.js 16 proxy: rate limiting + security headers
├── next.config.ts                    # Security headers, Next.js config
├── tsconfig.json                     # strict mode, @/* → ./
├── .env.example                      # Environment variable template
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint → TypeCheck → Build → Audit
│       └── security.yml              # Gitleaks · Dependency Review · CodeQL
└── package.json
```

---

## 5. Frontend Storefront Architecture

### 5.1 State Orchestrator Pattern

All application state lives in a single component — `app/page.tsx`. There is no global store (no Context, no Zustand, no Redux). State flows **down** via props; user events flow **up** via callback props.

```
app/page.tsx  ─── owns all useState ───────────────────────────────────┐
│                                                                       │
│  State groups:                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Commerce    │  │  UI / Modals │  │  Preferences │               │
│  │  cart[]      │  │  activeProduct│  │  darkMode    │               │
│  │  wishlist    │  │  checkoutStep │  │  currency    │               │
│  │  coupon      │  │  compareList  │  │  loyaltyPts  │               │
│  │  couponErr   │  │  showCompare  │  │              │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Filters     │  │  Timers      │  │  Misc        │               │
│  │  searchQuery │  │  timeLeft    │  │  toasts[]    │               │
│  │  category    │  │  flashTime   │  │  recentlyView│               │
│  │  sortOption  │  │              │  │  openFAQ     │               │
│  │  maxPrice    │  │              │  │  subscribed  │               │
│  │  minRating   │  │              │  │              │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                          │                                            │
│           props & callbacks passed down to every component            │
└───────────────────────────────────────────────────────────────────────┘
```

**Why no global store?** For an app of this scope, the overhead of a context provider or external store adds indirection without benefit. Every state update is traceable in a single file, and components remain pure functions of their props — easy to test or lift out later.

### 5.2 Component Hierarchy

```
app/page.tsx  (state orchestrator, "use client")
│
├── <ToastList />               — fixed overlay, auto-dismiss
├── <CompareModal />            — overlay, renders when compareList.length === 2
├── <ProductModal />            — overlay, renders when activeProduct !== null
├── <CheckoutModal />           — overlay, renders when checkoutStep !== "idle"
│
├── <SiteHeader />              — sticky top bar
│
├── <HeroSection />             — full-width gradient hero
│
├── <FlashSaleSection />        — promo banner with countdown
│
├── <main>
│   ├── Recently Viewed strip   — inline JSX (not extracted: too small)
│   ├── <ProductFilters />      — filter bar
│   ├── <div id="products">
│   │   ├── <ProductCard /> × N — product grid (filtered)
│   │   └── empty-state div
│   └── <aside>
│       └── <CartSidebar />     — sticky cart
│   │
│   ├── <BundlesSection />
│   ├── <TestimonialsSection />
│   ├── Press logos strip       — inline JSX
│   ├── <FAQSection />
│   ├── <BlogSection />
│   └── <NewsletterSection />
│
├── <SiteFooter />
│
└── <AgentPanel />              — fixed overlay (floating action button)
    ├── Chat tab
    │   └── <MessageBubble /> × N
    └── Schedule tab
        └── <TaskList />
            └── <TaskCard /> × N
```

### 5.3 Data Flow

```
lib/data.ts  (static module, loaded once)
     │
     │  imported at module scope — no fetch, no async
     ▼
app/page.tsx
     │
     ├── on mount: reads 5 localStorage keys → hydrates state
     │
     ├── filteredProducts (useMemo)
     │       deps: [products, searchQuery, selectedCategory,
     │              sortOption, maxPriceFilter, minRating]
     │       ────────────────────────────────────────────────► ProductFilters (display only)
     │                                                              │ onChange callbacks
     │                                                              └──────────────► setState
     │
     │       ────────────────────────────────────────────────► ProductCard × N
     │                                                              │ onAddToCart
     │                                                              └──────────────► setCart
     │                                                              │ onToggleWishlist
     │                                                              └──────────────► setWishlist
     │
     ├── cart, subtotal, total, coupon
     │       ────────────────────────────────────────────────► CartSidebar
     │                                                              │ onCheckout
     │                                                              └──────────────► setCheckoutStep
     │
     ├── checkoutStep, address, cart, total
     │       ────────────────────────────────────────────────► CheckoutModal
     │                                                              │ onConfirmOrder
     │                                                              └──────────────► setCart([])
     │                                                                               setLoyaltyPoints
     │
     ├── darkMode (bool)
     │       ────────────────────────────────────────────────► every component (styling)
     │
     ├── currency, loyaltyPoints
     │       ────────────────────────────────────────────────► SiteHeader, SiteFooter
     │
     │  fmt(usdAmount)  =  SYMBOLS[currency] + Math.round(usdAmount × RATES[currency])
     │       ────────────────────────────────────────────────► every price-displaying component
     │
     └── on state change: writes 5 localStorage keys
```

### 5.4 Checkout State Machine

```
          ┌──────────┐
    ──────►   idle   ◄──────────────────────────────────┐
          └────┬─────┘                                  │
               │ onCheckout()                            │
               ▼                                         │
          ┌──────────┐  onClose()                       │
          │ address  ├──────────────────────────────────►│
          └────┬─────┘                                  │
               │ onNextStep()          onClose()         │
               │  (HTML5 form valid)  ─────────────────►│
               ▼                                         │
          ┌──────────┐  onPrevStep()                     │
          │  review  ├──────────────────────────────────►│ (back to address)
          └────┬─────┘                                  │
               │ onConfirmOrder()                        │
               ▼                                         │
          ┌───────────┐  onClose()                      │
          │ confirmed ├─────────────────────────────────►│
          └───────────┘  (Continue Shopping)
```

Side effects of `onConfirmOrder`:
- `setCart([])` — clears cart
- `setAppliedCode(null)` — resets promo
- `setLoyaltyPoints(pts => pts + Math.floor(total))` — awards points
- `setOrderNumber(generateOrderId())` — `MH-XXXXXX` reference
- `setCheckoutStep("confirmed")`

### 5.5 Persistence (localStorage)

| Key | Value | Written when |
|---|---|---|
| `mh_cart` | `CartItem[]` JSON | Cart changes |
| `mh_wishlist` | `number[]` JSON (Set serialised) | Wishlist toggle |
| `mh_dark` | `"true"` / `"false"` | Dark mode toggle |
| `mh_currency` | `"USD"` / `"EUR"` / `"GBP"` | Currency change |
| `mh_points` | number string | Order confirmed |

All five keys are hydrated in a single `useEffect` on mount (guarded by `mounted` state to avoid SSR hydration mismatch).

---

## 6. AI Scheduling Agent Architecture

### 6.1 Agent Overview

```
Browser                        Next.js Server              Anthropic
─────────                      ──────────────              ─────────
AgentPanel
   │
   │  POST /api/agent
   │  { message, history[] }
   │ ─────────────────────────► app/api/agent/route.ts
   │                                   │
   │                                   │  Zod validation
   │                                   │
   │                                   │  runAgent(message, history)
   │                                   │ ──────────────────────────► lib/agent/client.ts
   │                                   │                                    │
   │                                   │                     Agentic loop (up to 10 turns)
   │                                   │                                    │
   │                                   │                    messages.create(model, tools, messages)
   │                                   │                                    │ ────────────────────► claude-sonnet-4-6
   │                                   │                                    │ ◄────────────────────
   │                                   │                                    │
   │                                   │                    if stop_reason === "tool_use":
   │                                   │                      executeTool(name, input)
   │                                   │                        → taskStore.create/list/update
   │                                   │                      append tool_result, loop again
   │                                   │                                    │
   │                                   │                    if stop_reason === "end_turn":
   │                                   │                      return { reply, toolsUsed }
   │                                   │ ◄──────────────────────────────────┘
   │                                   │
   │  { message, toolsUsed[] }
   │ ◄─────────────────────────────────┘
   │
   │  renders MessageBubble
   │  if toolsUsed includes schedule_campaign/cancel_task:
   │    re-fetches GET /api/agent/tasks → refreshes TaskList
```

### 6.2 Agentic Loop

`lib/agent/client.ts` implements the standard tool-use loop required by the Anthropic API:

```
runAgent(message, history)
│
├── Build messages array: [...history, { role: "user", content: message }]
│
└── Loop (max 10 turns to prevent runaway):
    │
    ├── anthropic.messages.create({ model, system, tools, messages })
    │
    ├── stop_reason === "end_turn"
    │     └── extract text block → return { reply, toolsUsed }  ← exits loop
    │
    └── stop_reason === "tool_use"
          │
          ├── for each tool_use block:
          │     executeTool(name, input) → result
          │     push ToolResultBlockParam to toolResults[]
          │
          ├── append { role: "assistant", content: response.content }
          ├── append { role: "user",      content: toolResults }
          │
          └── continue loop
```

The system prompt gives MarketBot its identity, the current date, the product catalogue, and best-practice guidance (e.g. optimal email send times: Tue–Thu 10am–2pm).

### 6.3 Tool Definitions

Five tools are registered with Claude. Each is a plain `Anthropic.Tool` object in `lib/agent/tools.ts`:

| Tool | Trigger phrase examples | Side effects |
|---|---|---|
| `schedule_campaign` | "Schedule a flash sale for Monday" | `taskStore.create()` |
| `list_tasks` | "Show all upcoming tasks" | Read-only |
| `cancel_task` | "Cancel task task-123-abc" | `taskStore.update(id, { status: "cancelled" })` |
| `generate_campaign_copy` | "Write email copy for Template Pack Pro" | Signals Claude to generate text inline |
| `analyze_schedule` | "Check my schedule for conflicts" | Read-only; returns conflict report |

`generate_campaign_copy` has no server-side side effect — it returns a structured signal that Claude uses as context to compose the actual copy text in its reply.

### 6.4 In-Memory Task Store

`lib/agent/store.ts` is a module-scoped `Map<string, AgentTask>`. It persists across requests within a single Node.js process.

```
taskStore interface:
  getAll()          → AgentTask[]  sorted by scheduledAt ASC
  get(id)           → AgentTask | undefined
  create(task)      → AgentTask
  update(id, patch) → AgentTask | null
  delete(id)        → boolean
  getByStatus(s)    → AgentTask[]
  count()           → number
```

**Production note:** A single-process in-memory store does not survive server restarts and does not work across multiple instances. Replace with:
- **Redis** (Upstash) for ephemeral, low-latency access across instances
- **PostgreSQL / Prisma** for durable, queryable task history

### 6.5 Agent Request Lifecycle

```
Browser → proxy.ts → /api/agent/route.ts → lib/agent/client.ts → Anthropic API

1.  Browser POST /api/agent { message, history }
2.  proxy.ts: check IP rate limit (10 req/min for agent endpoint)
              check x-api-key if AGENT_API_KEY env is set
              attach security headers
3.  route.ts: Zod validates { message: string(1-2000), history: Message[](max 20) }
              checks ANTHROPIC_API_KEY is set (returns 503 if not)
4.  client.ts: builds messages array from history + new message
               enters agentic loop (max 10 turns)
               each turn: calls Anthropic, handles tool_use or end_turn
5.  executeTool: mutates taskStore or reads it
6.  returns { reply: string, toolsUsed: string[] }
7.  route.ts: responds 200 { message, toolsUsed }
8.  AgentPanel: appends MessageBubble, shows tool badges
                conditionally refreshes TaskList
```

---

## 7. API Layer

All routes live under `app/api/` and are standard Next.js 16 route handlers.

### Route Reference

| Method | Path | Auth | Body / Response |
|---|---|---|---|
| `POST` | `/api/agent` | Rate limited | `{ message, history[] }` → `{ message, toolsUsed[] }` |
| `GET` | `/api/agent/tasks` | Rate limited | → `{ tasks: AgentTask[], total: number }` |
| `POST` | `/api/agent/tasks` | Rate limited | `CreateTaskBody` → `{ task: AgentTask }` 201 |
| `GET` | `/api/agent/tasks/:id` | Rate limited | → `{ task: AgentTask }` |
| `PATCH` | `/api/agent/tasks/:id` | Rate limited | `Partial<AgentTask>` → `{ task: AgentTask }` |
| `DELETE` | `/api/agent/tasks/:id` | Rate limited | → `{ success: true }` (soft-delete: sets status = cancelled) |
| `GET` | `/api/agent/health` | Open | → `{ status, model, timestamp, agentConfigured, scheduledTasks }` |

### Input Validation

All mutating endpoints validate their body with Zod v4 before touching business logic. Validation errors return `400` with `{ error, details: string[] }`.

```ts
// Example: POST /api/agent/tasks schema
z.object({
  type:        z.enum(["email_campaign", "social_post", ...]),
  title:       z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  scheduledAt: z.iso.datetime(),          // Zod v4 — replaces deprecated z.string().datetime()
  metadata:    z.record(z.string(), z.unknown()).default({}),
})
```

### Dynamic Route Parameters

Next.js 16 requires `params` to be awaited (breaking change from v15):

```ts
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;   // must await — not synchronous
  ...
}
```

---

## 8. Security Architecture

### 8.1 Request Security Pipeline

Every request to `/api/*` passes through this pipeline before reaching a route handler:

```
Incoming request to /api/*
        │
        ▼
proxy.ts
 ├── 1. Extract client IP (x-forwarded-for → first segment)
 │
 ├── 2. Rate limit check (in-memory Map, per IP)
 │       /api/agent → 10 req/min  (Anthropic cost control)
 │       /api/*     → 30 req/min  (general)
 │       Exceeded → 429 + Retry-After header
 │
 ├── 3. API key guard (only when AGENT_API_KEY is set)
 │       Browser requests (have Origin header) → always pass
 │       Server-to-server requests → must supply x-api-key
 │       Missing / wrong key → 401
 │
 ├── 4. Attach rate-limit headers (X-RateLimit-Limit, Remaining, Reset)
 │
 └── 5. Attach security headers (X-Content-Type-Options, X-Frame-Options,
                                  X-XSS-Protection, Referrer-Policy,
                                  Permissions-Policy)
        │
        ▼
Route handler (app/api/agent/route.ts, etc.)
```

### 8.2 Rate Limiting

The rate limit store is a `Map<string, { count: number; resetAt: number }>` keyed by `{ip}:{endpoint-class}`. It is intentionally simple — no Redis, no database — suitable for a single-process deployment.

```
Key format:   "203.0.113.1:agent"   (agent chat endpoint)
              "203.0.113.1:api"     (all other API routes)

Window:       60 seconds (sliding reset)
Limits:       10 req/min for /api/agent (Claude API cost guard)
              30 req/min for all other /api/* routes

429 response headers:
  X-RateLimit-Limit:     10
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset:     <unix timestamp>
  Retry-After:           <seconds until reset>
```

**Production note:** Replace the in-memory store with Redis (e.g. `@upstash/ratelimit`) to share limits across instances and survive restarts.

### 8.3 Security Headers

Two sources apply headers:

**`proxy.ts`** — on every API response:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

**`next.config.ts`** — on every page and route response:

| Header | Value |
|---|---|
| `X-DNS-Prefetch-Control` | `on` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' https://api.anthropic.com; …` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

The CSP explicitly allowlists `https://api.anthropic.com` in `connect-src` — all other external origins are blocked.

---

## 9. Module Dependency Graph

```
app/page.tsx
  ├── lib/types.ts
  ├── lib/constants.ts  (MAX_PRICE, RATES, SYMBOLS, OFFER_END, FLASH_END, PROMO_CODES)
  ├── lib/data.ts       (products, bundles, testimonials, faqs, flashSaleItems, articles, pressLogos)
  ├── lib/utils.ts      (effectivePrice, generateOrderId)
  ├── lib/pptx.ts       (buildPptx)
  └── components/*      (all 14 components)

components/agent/AgentPanel.tsx
  ├── lib/agent/types.ts
  └── components/agent/TaskList.tsx

components/agent/TaskList.tsx
  └── lib/agent/types.ts

app/api/agent/route.ts
  ├── zod
  └── lib/agent/client.ts
        ├── @anthropic-ai/sdk
        └── lib/agent/tools.ts
              ├── @anthropic-ai/sdk  (Tool type)
              ├── lib/agent/store.ts
              └── lib/agent/types.ts

app/api/agent/tasks/route.ts
  ├── zod
  ├── lib/agent/store.ts
  └── lib/agent/types.ts

app/api/agent/tasks/[id]/route.ts
  └── lib/agent/store.ts

app/api/agent/health/route.ts
  └── lib/agent/store.ts

proxy.ts
  └── next/server  (NextRequest, NextResponse)

components/cart/Cart.tsx
  └── lib/constants.ts  (FREE_DELIVERY_THRESHOLD, PROMO_CODES)

components/filters/ProductFilters.tsx
  └── lib/constants.ts  (MAX_PRICE)

components/marketing/FlashSale.tsx
  ├── lib/data.ts    (products)
  └── lib/utils.ts   (effectivePrice)

components/marketing/Bundles.tsx
  ├── lib/data.ts    (products)
  └── lib/utils.ts   (effectivePrice)

components/checkout/CheckoutModal.tsx
  ├── lib/types.ts
  ├── lib/utils.ts   (effectivePrice)
  └── lib/constants.ts  (COUNTRIES)

lib/pptx.ts
  ├── pptxgenjs
  ├── lib/data.ts    (products, testimonials)
  └── lib/utils.ts   (effectivePrice)
```

**Key invariants:**
- `lib/` modules never import from `components/` or `app/`
- `lib/agent/` never imports from `lib/pptx.ts` or front-end libs
- `components/` never import from `app/`
- `proxy.ts` only imports from `next/server`

---

## 10. CI/CD Pipeline Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│  .github/workflows/ci.yml  — triggers on push/PR to main or develop       │
│                                                                            │
│  ┌──────────────────┐     ┌───────────────────────────────────────────┐   │
│  │ lint-typecheck   │     │ build  (needs: lint-typecheck)            │   │
│  │                  │     │                                           │   │
│  │ npm ci           │────►│ npm ci                                    │   │
│  │ npm run lint     │     │ npm run build                             │   │
│  │ tsc --noEmit     │     │ upload-artifact (.next/ 3-day retention)  │   │
│  └──────────────────┘     └───────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────┐                                        │
│  │ dependency-audit               │  (parallel with lint-typecheck)        │
│  │                                │                                        │
│  │ npm ci                         │                                        │
│  │ npm audit --audit-level=high   │  fails CI on high/critical CVEs        │
│  └────────────────────────────────┘                                        │
│                                                                            │
│  concurrency: cancel-in-progress on same branch                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  .github/workflows/security.yml  — push to main + PRs + weekly Monday    │
│                                                                            │
│  ┌────────────────────┐  ┌────────────────────┐  ┌─────────────────────┐  │
│  │ secret-scan        │  │ dependency-review  │  │ codeql              │  │
│  │                    │  │ (PRs only)         │  │                     │  │
│  │ gitleaks-action@v2 │  │                    │  │ languages:          │  │
│  │ full git history   │  │ dependency-review  │  │   javascript-       │  │
│  │ (fetch-depth: 0)   │  │ -action@v4         │  │   typescript        │  │
│  │                    │  │ fail-on-severity:  │  │ queries:            │  │
│  │ blocks on any      │  │   high             │  │   security-extended │  │
│  │ detected secret    │  │                    │  │                     │  │
│  └────────────────────┘  └────────────────────┘  └─────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Required GitHub Secrets

| Secret | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Recommended | Real agent functionality in staging/prod builds |
| `AGENT_API_KEY` | Optional | External API key guard |
| `GITHUB_TOKEN` | Auto-provisioned | Gitleaks, Dependency Review, CodeQL |

### Deployment

The build output is a standard Next.js server. Recommended targets:

| Platform | Notes |
|---|---|
| **Vercel** | Zero-config. Set `ANTHROPIC_API_KEY` in project environment variables. |
| **Docker** | Use `node:20-alpine`. Run `npm run build && npm start`. Mount `.env.local` as a secret. |
| **AWS App Runner / Fly.io** | Any Node.js 20+ host works. |

---

## 11. Key Architectural Decisions

| Decision | Rationale | Trade-off |
|---|---|---|
| **Single state orchestrator** (`app/page.tsx`) | All state co-located; fully traceable without a devtools plugin | File grows as features are added; split to sub-orchestrators if it exceeds ~600 lines |
| **Props-down / callbacks-up** | Components are pure functions of props — independently testable, no hidden dependencies | Prop drilling across deep trees; Context or Zustand appropriate if nesting exceeds 3–4 levels |
| **`lib/` as pure, framework-agnostic modules** | Importable in tests, scripts, or a future API/server layer without Next.js context | Static data baked into the bundle; replace `lib/data.ts` with an API call when a CMS or database is added |
| **React 19 form actions** | Replaces deprecated `onSubmit + FormEvent`; pairs with HTML5 native validation | Requires React 19 — incompatible with older React; no controlled input for email field |
| **`"use client"` throughout storefront** | Cart, dark mode, timers, modals all need client state | No RSC benefits for the storefront; individual static sections (Blog, FAQ) could be RSCs with minor refactor |
| **In-memory agent task store** | Zero dependencies; works immediately in dev | Data lost on server restart; does not scale across instances — replace with Redis/DB for production |
| **Agentic loop in route handler** | Keeps Claude context entirely server-side; API key never reaches browser | Long-running requests; add streaming (`ReadableStream`) if response latency > 10 s |
| **proxy.ts for rate limiting** | Enforces limits before any route handler runs | In-memory per-process; use Upstash Redis for distributed rate limiting |
| **CSP allowlist for `api.anthropic.com`** | Prevents the browser from initiating direct Anthropic calls (all calls go server-side) | Must update CSP if new external APIs are added |

---

## 12. Scaling Roadmap

The current implementation is a **single-process prototype** with all data in-memory or localStorage. The following changes are required before horizontal scaling or production hardening:

```
Priority  Component              Current              Production target
────────  ─────────────────────  ───────────────────  ──────────────────────────────────
P0        Task store             In-memory Map        Redis (Upstash) or PostgreSQL
P0        Rate limiting          In-memory Map        Upstash Redis (@upstash/ratelimit)
P0        Authentication         None                 NextAuth.js or Clerk
P0        Anthropic key          Server env var       Secret manager (AWS Secrets / Vault)
P1        Order persistence      localStorage         PostgreSQL + Prisma
P1        Email delivery         None                 Resend (order confirmation)
P1        Agent streaming        Polling (sync req)   ReadableStream (SSE)
P2        Product data           lib/data.ts (static) Headless CMS (Contentful / Sanity)
P2        Payments               None                 Stripe Checkout
P2        Agent context          Per-request history  Persisted thread (DB-backed)
P3        Analytics              None                 PostHog or Plausible
P3        Admin dashboard        None                 Internal Next.js route (/admin)
```

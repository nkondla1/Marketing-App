# CareConnect — Architecture

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [State Management](#5-state-management)
6. [Data Models](#6-data-models)
7. [Routing](#7-routing)
8. [AI Scheduling Agent](#8-ai-scheduling-agent)
9. [Security](#9-security)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Key Design Decisions](#11-key-design-decisions)

---

## 1. System Overview

CareConnect is a single-page React application (SPA) that runs entirely in the browser. There is no dedicated backend — all state is managed client-side and persisted to `localStorage` via Zustand's `persist` middleware.

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (SPA)                          │
│                                                                 │
│  ┌───────────────┐    ┌──────────────────┐    ┌─────────────┐  │
│  │   React UI    │◄──►│  Zustand Store   │◄──►│ localStorage│  │
│  │  (Components) │    │  (Single Source  │    │ (Persist)   │  │
│  └───────┬───────┘    │   of Truth)      │    └─────────────┘  │
│          │            └──────────────────┘                      │
│          │                                                       │
│  ┌───────▼────────────────────────────────┐                     │
│  │          AI Scheduling Agent            │                     │
│  │  (AsyncGenerator + Claude tool loop)   │                     │
│  └───────┬────────────────────────────────┘                     │
│          │                                                       │
└──────────┼──────────────────────────────────────────────────────┘
           │ HTTPS (Anthropic SDK, dangerouslyAllowBrowser: true)
           ▼
┌─────────────────────────┐
│   Anthropic API          │
│   claude-opus-4-7        │
│   Tool use + Streaming   │
└─────────────────────────┘
```

> **Production note:** The Anthropic API key is currently embedded in the browser bundle (`VITE_ANTHROPIC_API_KEY`). For production, this call should be proxied through a backend service so the key is never exposed to the client.

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| UI Framework | React | 18.3 | Component model, hooks, concurrent rendering |
| Language | TypeScript | 5.2 | Static typing, strict mode enabled |
| Build Tool | Vite | 5.1 | Dev server with HMR, optimized production builds |
| Routing | React Router DOM | 6.22 | Declarative client-side routing, nested routes |
| State Management | Zustand | 4.5 | Minimal global store with `persist` middleware |
| AI Integration | Anthropic SDK | 0.95 | Claude API with tool use and streaming |
| Charts | Recharts | 3.8 | SVG-based data visualisation |
| Date Utilities | date-fns | 3.6 | Formatting, parsing, interval arithmetic |
| Icons | Lucide React | 0.344 | Consistent icon set |
| Icons (alt) | Heroicons React | 2.2 | Additional icon set |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS, JIT compiler |
| CSS Processing | PostCSS + Autoprefixer | — | Vendor prefix generation |

---

## 3. Project Structure

```
healthcare-app/
├── .github/
│   └── workflows/
│       ├── ci.yml           # Typecheck + build on every push/PR
│       ├── deploy.yml       # GitHub Pages deployment on main
│       └── security.yml     # Audit, TruffleHog, CodeQL scans
│
├── src/
│   ├── main.tsx             # React root — mounts <App> in <BrowserRouter>
│   ├── App.tsx              # Route declarations (React Router v6)
│   ├── index.css            # Tailwind base + custom CSS utilities
│   ├── vite-env.d.ts        # Vite environment variable types
│   │
│   ├── types/
│   │   └── index.ts         # All TypeScript interfaces and type aliases
│   │
│   ├── store/
│   │   └── useStore.ts      # Zustand store — state, actions, seed data
│   │
│   ├── services/
│   │   └── schedulingAgent.ts  # Claude AI agent (AsyncGenerator, tool loop)
│   │
│   ├── utils/
│   │   ├── sanitize.ts      # Input sanitization helpers
│   │   └── rateLimit.ts     # Token-bucket rate limiter (localStorage)
│   │
│   └── components/
│       ├── Layout.tsx        # App shell — nav bar, <Outlet>
│       ├── Dashboard.tsx     # KPI cards + charts
│       ├── Notifications.tsx # Bell icon + notification dropdown
│       │
│       ├── ai/
│       │   ├── index.ts
│       │   └── SchedulingAgent.tsx  # AI chat UI
│       │
│       ├── appointments/
│       │   ├── index.ts
│       │   ├── AppointmentList.tsx
│       │   ├── AppointmentDetail.tsx
│       │   ├── AppointmentForm.tsx
│       │   ├── AppointmentCalendar.tsx
│       │   ├── AppointmentScheduler.tsx
│       │   └── AppointmentReminders.tsx
│       │
│       ├── billing/
│       │   └── Billing.tsx
│       │
│       ├── inventory/
│       │   ├── index.ts
│       │   └── Inventory.tsx
│       │
│       ├── medical/
│       │   ├── index.ts
│       │   ├── MedicalRecords.tsx
│       │   ├── Prescriptions.tsx
│       │   └── LabResults.tsx
│       │
│       ├── patients/
│       │   ├── index.ts
│       │   ├── PatientList.tsx
│       │   ├── PatientDetail.tsx
│       │   └── PatientReport.tsx
│       │
│       └── staff/
│           └── StaffList.tsx
│
├── .env.example             # Required environment variables
├── package.json
├── tsconfig.json            # Strict TS — noUnusedLocals, noUnusedParameters
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── README.md
├── architecture.md          # This file
└── Project Documentation.md
```

---

## 4. Frontend Architecture

### Component Hierarchy

```
<BrowserRouter>                   (main.tsx)
└── <Routes>                      (App.tsx)
    └── <Route path="/">
        └── <Layout>              ← nav bar, persistent shell
            ├── <Dashboard>
            ├── <PatientList>
            │   └── <PatientDetail>
            │       └── <PatientReport>
            ├── <AppointmentList>
            ├── <AppointmentCalendar>
            ├── <AppointmentScheduler>
            ├── <AppointmentReminders>
            ├── <AppointmentForm>   (new / edit)
            ├── <AppointmentDetail>
            ├── <MedicalRecords>
            ├── <Prescriptions>
            ├── <LabResults>
            ├── <StaffList>
            ├── <Billing>
            ├── <Inventory>
            └── <SchedulingAgent>  ← AI chat interface
```

### Data Flow

```
User Interaction
      │
      ▼
 Component (local state via useState/useCallback)
      │
      │  reads slice          writes via action
      ├──────────────────────────────────────────►  Zustand Store
      │   useStore((s) => s.patients)               updatePatient(id, patch)
      │
      │  (AI agent only)
      └──────────────────────────────────────────►  Anthropic API
           streamSchedulingAgent(history, snapshot)
```

Components never mutate store state directly. They call named action functions from the store (`addAppointment`, `updatePatient`, etc.), keeping mutations centralized and auditable.

### Module Boundaries

Each feature domain lives in its own directory and exposes a barrel `index.ts`. Cross-feature imports always go through these barrels, not directly to internal files.

```
src/components/appointments/index.ts
  └── exports AppointmentList, AppointmentDetail, AppointmentForm,
               AppointmentCalendar, AppointmentScheduler, AppointmentReminders
```

---

## 5. State Management

### Zustand Store Design

The entire application state is a single Zustand store at `src/store/useStore.ts`, typed against the `HealthcareStore` interface.

```
HealthcareStore
├── patients:              Patient[]
├── appointments:          Appointment[]
├── medicalRecords:        MedicalRecord[]
├── prescriptions:         Prescription[]
├── staff:                 Staff[]
├── invoices:              Invoice[]
├── notifications:         Notification[]
├── inventory:             InventoryItem[]
├── inventoryTransactions: InventoryTransaction[]
│
└── Actions (one per entity × CRUD operation)
    ├── addPatient / updatePatient / deletePatient
    ├── addAppointment / updateAppointment / deleteAppointment
    ├── addMedicalRecord / updateMedicalRecord
    ├── addPrescription / updatePrescription / deletePrescription
    ├── addStaff / updateStaff / deleteStaff
    ├── addInvoice / updateInvoice
    ├── addNotification / markNotificationRead / clearAllNotifications
    └── addInventoryItem / updateInventoryItem / deleteInventoryItem
         addInventoryTransaction
```

### Persistence

```typescript
export const useStore = create<HealthcareStore>()(
  persist(
    (set, get) => ({ /* state + actions */ }),
    { name: 'healthcare-store' }   // localStorage key
  )
);
```

All store state serializes automatically to `localStorage['healthcare-store']` on every mutation and rehydrates on page load. No manual save/restore logic is needed in components.

### Selector Pattern

Components subscribe to the minimum slice they need, preventing unnecessary re-renders:

```typescript
// Only re-renders when patients array changes
const patients = useStore((s: StoreState) => s.patients);

// Only re-renders when addAppointment reference changes (never)
const addAppointment = useStore((s: StoreState) => s.addAppointment);
```

---

## 6. Data Models

### Core Entities

```
Patient
├── id, firstName, lastName
├── dateOfBirth, gender, bloodType
├── email, phone, address
├── insurance: { provider, policyNumber, groupNumber, expiryDate }
├── allergies: string[]
├── chronicConditions: string[]
├── emergencyContact: { name, relationship, phone }
└── createdAt, updatedAt

Appointment
├── id, patientId (→ Patient), doctorId (→ Staff)
├── date (YYYY-MM-DD), time (HH:MM), duration (minutes)
├── type: AppointmentType, status: AppointmentStatus
├── reason, notes, room
└── createdAt, updatedAt

MedicalRecord
├── id, patientId, doctorId, appointmentId
├── date, diagnosis, symptoms[], treatment
├── vitalSigns: VitalSigns
├── labResults: LabResult[]
├── followUpDate, followUpNotes
└── createdAt, updatedAt

Staff
├── id, firstName, lastName, role: StaffRole
├── specialty, department, licenseNumber
├── email, phone, isActive
├── schedule: { [day]: { start, end } }
├── qualifications: string[], bio
└── createdAt, updatedAt

Invoice
├── id, patientId, appointmentId
├── items: InvoiceItem[]   ← description, qty, unitPrice, total
├── subtotal, tax, discount, total
├── status: BillingStatus
├── insuranceClaim: { claimNumber, submitted, approved, amount }
└── dueDate, paidDate, createdAt, updatedAt

InventoryItem
├── id, name, category, sku
├── quantity, minQuantity (reorder threshold)
├── unitCost, sellingPrice
├── manufacturer, batchNumber, expiryDate, location
└── createdAt, updatedAt
```

### Type Aliases

```typescript
AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'In Progress'
AppointmentType   = 'Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup'
                  | 'Lab Test' | 'Surgery' | 'Vaccination'
StaffRole         = 'Doctor' | 'Nurse' | 'Receptionist' | 'Lab Technician'
                  | 'Pharmacist' | 'Admin'
BillingStatus     = 'Pending' | 'Paid' | 'Overdue' | 'Insurance Claim'
                  | 'Partially Paid' | 'Waived'
BloodType         = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'
Severity          = 'Low' | 'Medium' | 'High' | 'Critical'
```

---

## 7. Routing

All routes nest under the persistent `<Layout>` shell (nav bar + `<Outlet>`).

| Path | Component | Description |
|---|---|---|
| `/` | → redirect | Redirects to `/dashboard` |
| `/dashboard` | `Dashboard` | KPI metrics and charts |
| `/patients` | `PatientList` | Searchable patient directory |
| `/patients/:id` | `PatientDetail` | Patient profile and medical history |
| `/patients/:id/report` | `PatientReport` | Printable patient summary |
| `/appointments` | `AppointmentList` | All appointments with filters |
| `/appointments/calendar` | `AppointmentCalendar` | Monthly/weekly calendar view |
| `/appointments/schedule` | `AppointmentScheduler` | Slot picker with conflict detection |
| `/appointments/reminders` | `AppointmentReminders` | Reminder notification panel |
| `/appointments/new` | `AppointmentForm` | Create appointment |
| `/appointments/:id/edit` | `AppointmentForm` | Edit appointment |
| `/appointments/:id` | `AppointmentDetail` | Appointment detail view |
| `/medical-records` | `MedicalRecords` | Medical records list |
| `/prescriptions` | `Prescriptions` | Prescription management |
| `/lab-results` | `LabResults` | Lab results with abnormal flags |
| `/staff` | `StaffList` | Staff directory |
| `/billing` | `Billing` | Invoice management |
| `/inventory` | `Inventory` | Stock levels and transactions |
| `/ai-scheduler` | `SchedulingAgent` | AI-powered appointment chat |
| `/*` | inline | 404 Not Found page |

---

## 8. AI Scheduling Agent

The scheduling agent is the most architecturally complex part of the system. It implements a **streaming agentic loop** using Claude's tool use API.

### Architecture

```
SchedulingAgent.tsx (React UI)
        │
        │  for await (event of streamSchedulingAgent(...))
        ▼
schedulingAgent.ts (AsyncGenerator)
        │
        │  client.messages.stream(...)
        ▼
  Anthropic API ──── tool_use ────► executeTool()
        ▲                                │
        │   tool_result                  │  callbacks.addAppointment()
        └────────────────────────────────┘  callbacks.addNotification()
```

### Tool Loop (up to 8 iterations)

```
1. Build messages array from conversationHistory
2. Stream Claude response
   ├── Yield text_delta events → UI appends to chat bubble
   └── When stop_reason === 'tool_use':
       ├── Extract all ToolUseBlock items
       ├── Append assistant turn (with tool blocks) to messages
       ├── For each tool:
       │   ├── Yield tool_start event → UI shows "Searching…"
       │   ├── executeTool() → runs against Zustand snapshot
       │   ├── Yield tool_result event → UI shows summary
       │   └── If schedule_appointment → yield appointment_created
       ├── Append tool_results as user turn
       └── Loop back to step 2
3. When stop_reason === 'end_turn': yield done, return
4. After 8 iterations: yield error (circuit breaker)
```

### Tools Available to Claude

| Tool | Input | Side Effect |
|---|---|---|
| `list_doctors` | `specialty?` | None — read only |
| `list_patients` | `search?` | None — read only |
| `get_available_slots` | `doctorId, date` | None — read only |
| `get_appointments` | `date?, doctorId?, patientId?, status?` | None — read only |
| `schedule_appointment` | `patientId, doctorId, date, time, type, reason, duration?, room?, notes?` | Writes to store via callback |

### Conflict Detection

```typescript
function overlaps(
  aDate, aTime, aDuration,  // proposed appointment
  bDate, bTime, bDuration   // existing appointment
): boolean {
  if (aDate !== bDate) return false;
  const aStart = toMinutes(aTime);
  const bStart = toMinutes(bTime);
  return aStart < bStart + bDuration && bStart < aStart + aDuration;
}
```

`get_available_slots` filters the 09:00–17:00 slot grid against all non-cancelled appointments for that doctor. `schedule_appointment` performs a second check against both the doctor's and patient's existing appointments before writing to the store.

### Prompt Caching

The system prompt is marked with `cache_control: { type: 'ephemeral' }` so Anthropic caches it across requests in the same session, reducing input token cost on multi-turn conversations.

### Security Boundaries

| Concern | Mitigation |
|---|---|
| API key in browser | `dangerouslyAllowBrowser: true`; use a backend proxy in production |
| Prompt injection | `sanitizeUserInput()` strips HTML, null bytes, limits to 2,000 chars |
| Runaway tool loops | Hard cap of 8 iterations |
| API abuse | Token-bucket rate limiter: 10 requests / 60-second window, persisted to `localStorage` |

### Event Stream (UI ↔ Service Contract)

```typescript
type AgentStreamEvent =
  | { type: 'text_delta';         text: string }
  | { type: 'tool_start';         toolName: string; description: string }
  | { type: 'tool_result';        toolName: string; summary: string }
  | { type: 'appointment_created'; patientName: string; doctorName: string;
                                   date: string; time: string }
  | { type: 'error';              message: string }
  | { type: 'done' };
```

---

## 9. Security

### Input Sanitization (`src/utils/sanitize.ts`)

| Function | Behavior |
|---|---|
| `sanitizeUserInput(input, maxLength?)` | Trims whitespace, strips HTML tags, removes null bytes, collapses repeated spaces, enforces 2,000-char limit |
| `escapeHtml(input)` | Replaces `& < > " '` with HTML entities |
| `isSafeDate(value)` | Validates `YYYY-MM-DD` format |
| `isSafeTime(value)` | Validates `HH:MM` 24-hour format |
| `isSafeId(value)` | Alphanumeric + hyphens/underscores only |

### Rate Limiting (`src/utils/rateLimit.ts`)

Token-bucket algorithm: allows 10 requests per 60-second rolling window. State is persisted to `localStorage` so the limit survives page refreshes. Returns `{ allowed: boolean; retryAfterMs?: number }`.

### TypeScript Strict Mode

`tsconfig.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`. The build fails on any TypeScript error — there is no implicit `any` in the codebase.

---

## 10. CI/CD Pipeline

### Workflow Overview

```
Push to any branch ──► ci.yml
  ├── typecheck (npx tsc --noEmit)
  └── build     (npm run build, VITE_ANTHROPIC_API_KEY=placeholder)

Push to main ──► deploy.yml
  ├── build     (with VITE_ANTHROPIC_API_KEY from GitHub secret)
  └── deploy    (GitHub Pages via actions/upload-pages-artifact)

Push / PR / weekly ──► security.yml
  ├── dependency-audit  (npm audit --audit-level=high)
  ├── secrets-scan      (TruffleHog OSS)
  └── static-analysis   (CodeQL — JavaScript/TypeScript)
```

### Job Details

**ci.yml** — Runs on Node 20, triggered on push to any branch and on pull requests:
- `typecheck`: fails the build on any TypeScript error
- `build`: confirms Vite can produce a production bundle

**deploy.yml** — Triggered on push to `main` or manual `workflow_dispatch`:
- Injects `VITE_ANTHROPIC_API_KEY` from the `VITE_ANTHROPIC_API_KEY` repository secret
- Deploys the `dist/` artifact to GitHub Pages

**security.yml** — Triggered on push, PR, and weekly (Monday 08:00 UTC):
- `dependency-audit`: fails only on `high` or `critical` severity CVEs
- `secrets-scan`: TruffleHog scans git history for accidentally committed secrets
- `static-analysis`: CodeQL SAST with `security-and-quality` query suite

---

## 11. Key Design Decisions

### No Backend

All data lives in the browser's `localStorage`. This eliminates server-side complexity and infrastructure cost at the expense of: no multi-device sync, no server-enforced auth, and ~5–10 MB localStorage limit. Acceptable for a demo / single-user management tool; a real deployment would add a REST or GraphQL backend.

### Single Zustand Store

Rather than per-feature stores or React Context, a single store holds all state. This simplifies debugging (one devtools pane), guarantees consistency across features (appointments reference the same patient objects as the patient list), and makes the AI agent easy to implement — it receives a complete snapshot of the world in one object.

### AsyncGenerator for AI Streaming

The scheduling service uses `async function*` (AsyncGenerator) to yield events one at a time as they arrive from the Anthropic stream. This decouples the service from the UI — the component iterates with `for await` and handles each event type independently, making it easy to add new event types without changing the streaming infrastructure.

### Snapshot + Callback Pattern for the AI Agent

The agent service receives the current store state as an immutable `StoreSnapshot` (plain data) and store mutations as an `AgentCallbacks` object (functions). This means the service has no dependency on React or Zustand — it is a pure TypeScript module that could be reused in a Node.js backend or tested in isolation without mounting any components.

### Barrel Exports Per Feature Domain

Each feature directory has an `index.ts` barrel. Imports in `App.tsx` and cross-feature components reference the barrel, not internal files. This creates a stable public API per domain and makes refactoring internals safe without updating import paths elsewhere.

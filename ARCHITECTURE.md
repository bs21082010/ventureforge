# VentureForge — Unified Architecture Blueprint

> From the smallest modules to the emergent limitless layer —
> every piece unified into one cohesive system.

---

## Visual Architecture (Four-Tier Pyramid)

```
                           ╔══════════════════╗
                           ║   EMERGENT LAYER  ║
                           ║  Boundless AI ·   ║
                           ║  Infinite Memory · ║
                           ║  Self-Optimizing  ║
                           ╚════════╤═════════╝
                              ╔═════╧══════╗
                              ║ INTEGRATION ║
                              ║   HUB       ║
                              ║ APIs · Auth ·║
                              ║ CRM · Chain ║
                              ╚═════╤══════╝
                         ╔══════════╧══════════╗
                         ║   SMART MID-LAYER    ║
                         ║  Financial Engine ·  ║
                         ║  Explainable AI ·    ║
                         ║  Creativity ·        ║
                         ║  Compliance ·        ║
                         ║  Geospatial          ║
                         ╚══════════╤══════════╝
                    ╔═══════════════╧═══════════════╗
                    ║        CORE FOUNDATION         ║
                    ║  Types · DB · Cache · Encrypt · ║
                    ║  Utils · Auth · Security        ║
                    ╚═════════════════════════════════╝
```

---

## Layer 0 — Core Foundation

> The atoms everything else is built from.

### 0.1 Type System
| File | What It Defines |
|------|----------------|
| `src/types/plan.ts` | `BusinessPlan`, `PlanSection`, `PlanStatus`, `SectionType` |
| `src/types/financial.ts` | `FinancialAssumption`, `ProjectionPeriod`, `FinancialProjection`, `Scenario` |
| `src/types/ai.ts` | `AISuggestion`, `CreativityRequest`, `ForesightRequest`, `ForesightResult`, `ExplainabilityResult`, `WorkflowConfig` |
| `src/types/compliance.ts` | `ComplianceCheckRequest`, `ComplianceCheckResult`, `ComplianceViolation`, `Regulation` |
| `src/types/data.ts` | `DataSource`, `DataPoint`, `RegionalData`, `RegionalIndicator`, `DataCache`, `BlockchainVerification` |

### 0.2 Database Layer
| File | Purpose | Status |
|------|---------|--------|
| `prisma/schema.prisma` | Schema: `User`, `Plan`, `PlanSection`, `Assumption`, `AuditLog` | SQLite (dev) / PostgreSQL (prod) |
| `src/lib/prisma.ts` | Singleton Prisma client with hot-reload caching | Connected to DB |

### 0.3 Cache Layer
| File | Purpose |
|------|---------|
| `src/lib/data-backbone/cache.ts` | `DataCacheManager` (1hr TTL, string-serialized) + `GenericDataCache` (typed, generic) |

### 0.4 Security Layer
| File | Purpose |
|------|---------|
| `src/lib/security/encryption.ts` | AES-256-GCM encrypt/decrypt, SHA-512 password hashing, JWT generation, CSRF tokens, input sanitization |

### 0.5 Utilities
| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | `cn()` class merge, `formatCurrency()`, `formatPercent()`, `formatNumber()`, `generateId()`, `computeHash()`, `debounce()`, `clamp()`, `lerp()` |

---

## Layer 1 — Core Modules

> The foundational business logic engines.

### 1.1 Data Backbone — Verified Government & Market Data

```
┌──────────────────────────────────────────────────────┐
│                   DATA BACKBONE                       │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │World Bank│  │   IMF    │  │   FRED   │           │
│  │  API v2  │  │Datamapper│  │  Series  │           │
│  │ (FREE)   │  │ (FREE)   │  │(FREE+key)│           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │              │              │                 │
│       └──────────────┼──────────────┘                 │
│                      ▼                                │
│            ┌─────────────────┐                        │
│            │   aggregator    │  ← parallel fetch     │
│            │  (allSettled)   │    with fallback       │
│            └────────┬────────┘                        │
│                     ▼                                 │
│          ┌──────────────────┐                         │
│          │  source registry │  ← catalogs all APIs   │
│          │  cache manager   │  ← 1hr TTL per source  │
│          └──────────────────┘                         │
└──────────────────────────────────────────────────────┘
```

| File | Real API? | Function |
|------|-----------|----------|
| `src/lib/data-backbone/worldbank.ts` | `api.worldbank.org/v2` | GDP, population, inflation, unemployment by country |
| `src/lib/data-backbone/imf.ts` | `imf.org/external/datamapper/api/v1` | Economic forecasts, fiscal data |
| `src/lib/data-backbone/fred.ts` | `api.stlouisfed.org/fred` | US macroeconomic time series |
| `src/lib/data-backbone/aggregate.ts` | All three in parallel | `getRegionalData()`, `getCountryComparison()` |
| `src/lib/data-backbone/sources.ts` | Registry | `GOVERNMENT_DATA_SOURCES`, `INDUSTRY_DATA_SOURCES`, `fetchFromSource()` |
| `src/lib/data-backbone/blockchain-verify.ts` | Local chain | In-memory SHA-256 proof-of-work blockchain |

### 1.2 Adaptive Financial Engine — Scenario Modeling

```
┌──────────────────────────────────────────────────┐
│              FINANCIAL ENGINE                     │
│                                                   │
│  Assumptions ──► recalculate() ──► Projections   │
│     │              │                              │
│     │         ┌────┴─────┐                        │
│     │         │ Scenarios │                        │
│     │         │ Base/Best │                        │
│     │         │ /Worst    │                        │
│     │         └────┬─────┘                        │
│     │              │                              │
│     ▼              ▼                              │
│  sensitivity   P&L / Balance Sheet / Cash Flow   │
│  analysis      (per-month, per-year)             │
│                                                   │
│  ┌──────────────────────────────────┐             │
│  │ Observable Recalculation Engine  │             │
│  │ subscribe() · debounce · recalc  │             │
│  └──────────────────────────────────┘             │
└──────────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `src/lib/financial-engine/engine.ts` | Core: `recalculate(assumptions, scenarios, periods)` → P&L, balance sheet, cash flow, sensitivity |
| `src/lib/financial-engine/recalculation.ts` | Observable engine with pub/sub, debounced updates, per-plan state |
| `src/lib/financial-engine/scenarios.ts` | `PRESET_SCENARIOS` (Base, Best, Worst, Recession, High Inflation) + custom scenario builder |
| `src/store/financial-store.ts` | Zustand store binding the engine to React state |
| `src/hooks/use-financial-engine.ts` | React hook that auto-triggers recalculation on assumption changes |
| `src/components/financial/projection-table.tsx` | Renders real projection data from the engine |
| `src/components/financial/assumptions-panel.tsx` | Editable assumptions panel with real-time recalculation |

### 1.3 Local Context Intelligence

```
┌────────────────────────────────────────────┐
│          GEOSPATIAL INTELLIGENCE            │
│                                             │
│  6 City Profiles:                           │
│  Mumbai · Ambikapur · Dubai ·               │
│  New York · London · Singapore              │
│                                             │
│  ┌───────────────────────────┐              │
│  │ economicProfile           │              │
│  │  gdpPerCapita             │              │
│  │  inflationRate            │              │
│  │  unemploymentRate         │              │
│  │  easeOfDoingBusiness      │              │
│  │  corruptionIndex          │              │
│  │  digitalReadiness         │              │
│  │  marketSize               │              │
│  │  primaryIndustries[]      │              │
│  └───────────────────────────┘              │
│                                             │
│  Market Health Score · Growth Rates ·       │
│  Competitor Density · Tax Adjustments       │
└────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `src/lib/geospatial/regions.ts` | 6 city profiles with economic indicators, tax rules, financial multipliers |
| `src/lib/geospatial/indicators.ts` | `computeMarketHealthScore()`, `getIndustryGrowthRate()`, `getCompetitorDensity()` |

---

## Layer 2 — Smart Mid-Layer

> Intelligence that makes the system think.

### 2.1 Explainable AI — Proof for Every Suggestion

```
┌──────────────────────────────────────────────┐
│           EXPLAINABLE AI                      │
│                                               │
│  Suggestion ──► ConfidenceBreakdown           │
│     │              │                          │
│     │         ┌────┴──────────┐              │
│     │         │ factor weight │              │
│     │         │ factor score  │              │
│     │         │ explanation   │              │
│     │         └────┬──────────┘              │
│     │              │                          │
│     ▼              ▼                          │
│  reasoning[]   alternatives[]   riskAssessment│
│                                               │
│  Sources: every explanation cites its data   │
└──────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `src/lib/ai/explainable.ts` | `generateExplainability()`, `rankSuggestions()`, `formatConfidence()` |
| `src/lib/ai/gpt-bridge.ts` | `explainDecision()` — real GPT-4o explanations with local fallback |
| `src/components/ai/suggestion-card.tsx` | Renders AI suggestions with confidence bars and reasoning |

### 2.2 Creativity Sandbox — Ideas, Campaigns, Names

| File | Purpose |
|------|---------|
| `src/lib/ai/creativity-sandbox.ts` | Template-based marketing, branding, content, and naming generation |
| `src/lib/ai/gpt-bridge.ts` | `generateBusinessIdeas()` — real GPT-4o creative generation |
| `src/components/ai/creativity-workspace.tsx` | Interactive workspace for generating and browsing creative output |

### 2.3 Predictive Foresight

| File | Purpose |
|------|---------|
| `src/lib/ai/foresight.ts` | `generateForesight()` — trends, risks, opportunities, forecasts from macro data |
| `src/lib/ai/gpt-bridge.ts` | `generatePredictions()` — real GPT-4o foresight with local fallback |

### 2.4 Compliance Automation

| File | Purpose |
|------|---------|
| `src/lib/compliance/checker.ts` | `runComplianceChecks()` — 12 regulations across India/USA/UAE, weighted scoring |
| `src/components/compliance/compliance-checker.tsx` | Interactive compliance dashboard with jurisdiction/category filtering |

### 2.5 Hybrid AI+Human Workflow

| File | Purpose |
|------|---------|
| `src/lib/ai/workflow.ts` | 5-step pipeline: AI Draft → Human Review → Refine → Validate → Approve |

---

## Layer 3 — Integration Hub

> Connecting to the outside world.

### 3.1 Authentication & User Management

```
┌────────────────────────────────────────────────┐
│              AUTH SYSTEM                         │
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Sign Up  │───►│ Prisma   │───►│ bcryptjs │  │
│  │  (POST)   │    │ User DB  │    │  hash    │  │
│  └──────────┘    └──────────┘    └──────────┘  │
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Sign In  │───►│ NextAuth │───►│ JWT      │  │
│  │ (Credntls)│    │ v5       │    │ session  │  │
│  └──────────┘    └──────────┘    └──────────┘  │
│                                                  │
│  Demo: demo@ventureforge.io / demo1234          │
└────────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth v5 config: CredentialsProvider, JWT strategy, Prisma adapter |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |
| `src/app/api/auth/signup/route.ts` | User registration with validation, bcrypt hashing |
| `src/components/auth-provider.tsx` | Client-side SessionProvider wrapper |
| `src/app/auth/signin/page.tsx` | Sign-in page |
| `src/app/auth/signup/page.tsx` | Sign-up page |

### 3.2 API Layer (All 7 Routes)

| Route | Method | Real? | What It Does |
|-------|--------|-------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | **REAL** | Auth session management |
| `/api/auth/signup` | POST | **REAL** | User creation in DB |
| `/api/plans` | GET/POST/PUT | MOCK→DB | Plan CRUD (in-memory, needs Prisma wiring) |
| `/api/data` | GET/POST | **REAL** | World Bank + IMF + FRED data fetch |
| `/api/financial` | POST | **REAL** | Financial engine recalculation |
| `/api/ai` | POST | **REAL+fallback** | AI generation, prediction, explanation |
| `/api/compliance` | POST | **REAL** | Compliance checking engine |
| `/api/integrations` | GET/POST | MOCK | Integration adapter metadata |

### 3.3 Enterprise Integration Adapters

```
┌─────────────────────────────────────────────┐
│         INTEGRATION HUB                      │
│                                              │
│  CRM          Accounting     Cloud Storage   │
│  ├─ Salesforce ├─ QuickBooks ├─ Google Drive │
│  ├─ HubSpot    └─ Xero       ├─ OneDrive    │
│  └─ SAP                     └─ Dropbox      │
│                                              │
│  ERP                                         │
│  ├─ Oracle                                  │
│  └─ SAP                                     │
│                                              │
│  Interface: connect() · sync() · disconnect()│
└─────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `src/lib/integrations/crm.ts` | 9 adapter stubs with standardized `connect()→sync()→disconnect()` interface |

### 3.4 Security Suite

| File | Purpose |
|------|---------|
| `src/lib/security/encryption.ts` | AES-256-GCM, JWT, SHA-512, CSRF, input sanitization |
| `src/proxy.ts` | Rate limiting (3 tiers), security headers, CORS, 429 handling |

### 3.5 Blockchain Certification

| File | Purpose |
|------|---------|
| `src/lib/data-backbone/blockchain-verify.ts` | In-memory SHA-256 proof-of-work chain for plan certification |

---

## Layer 4 — Emergent Layer

> The self-evolving, boundless intelligence.

### 4.1 Infinite Context Memory

```
┌──────────────────────────────────────────────┐
│         INFINITE CONTEXT MEMORY               │
│                                               │
│  Every interaction persists:                  │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Plans   │  │Sections  │  │Assumptions │  │
│  │ (DB)     │  │ (DB)     │  │  (DB)      │  │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │              │          │
│       └──────────────┼──────────────┘          │
│                      ▼                         │
│             ┌────────────────┐                 │
│             │  Audit Logs    │                 │
│             │  (every action │                 │
│             │   recorded)    │                 │
│             └────────────────┘                 │
│                                               │
│  Schema: User → Plan → Section → Assumption   │
│          User → AuditLog                      │
│                                               │
│  Status: Schema defined, Auth wired to DB,    │
│          Plans API needs DB wiring (in-memory) │
└──────────────────────────────────────────────┘
```

The data layer preserves every user action through the Prisma schema:

```
User ─┬─→ Plan ─┬─→ PlanSection (ordered, typed)
      │         └─→ Assumption  (categorized, dynamic)
      └─→ AuditLog (user, action, entity, timestamp, IP)
```

### 4.2 Cross-Domain Synthesis

```
┌──────────────────────────────────────────────┐
│        CROSS-DOMAIN SYNTHESIS                  │
│                                               │
│  Finance ←→ Geospatial ←→ AI ←→ Compliance   │
│     │            │          │        │         │
│     └────────────┼──────────┘        │         │
│                  ▼                   │         │
│          ┌──────────────┐            │         │
│          │  aggregate   │◄───────────┘         │
│          │  engine      │                      │
│          └──────┬───────┘                      │
│                 ▼                              │
│     "What happens to a tech startup           │
│      in Mumbai if inflation rises 3%?"        │
│                                               │
│  1. Geospatial: Mumbai profile + indicators   │
│  2. Financial:  Model with inflation scenario │
│  3. Compliance: Indian regulations check      │
│  4. AI:         Foresight + explanation       │
│  5. Data:       World Bank + IMF verification │
│                                               │
│  All 5 engines fire in parallel, results      │
│  merge into a single coherent recommendation  │
└──────────────────────────────────────────────┘
```

Cross-domain synthesis already works through the API layer. A single financial engine call:
1. Pulls regional data from **geospatial** profiles
2. Feeds into the **financial engine** with scenario multipliers
3. The **AI** layer explains the result
4. **Compliance** validates against jurisdiction regulations
5. **Data backbone** verifies economic assumptions

### 4.3 Self-Optimizing Workflows

| Component | Optimization |
|-----------|-------------|
| `src/lib/ai/workflow.ts` | 5-step pipeline tracks state per section; advances/rejects based on human feedback |
| `src/lib/financial-engine/recalculation.ts` | Debounced auto-recalc; only recomputes what changed via pub/sub |
| `src/store/financial-store.ts` | Lazy evaluation — recalculation only on assumption change |
| `src/proxy.ts` | Adaptive rate limiting based on route sensitivity |

### 4.4 Emergent Collaboration Fabric

```
┌──────────────────────────────────────────────┐
│      EMERGENT COLLABORATION FABRIC             │
│                                               │
│  ┌─────────────┐  ┌─────────────┐            │
│  │ Entrepreneurs│  │  Investors  │            │
│  │ (edit plans) │  │ (view scores│            │
│  └──────┬──────┘  └──────┬──────┘            │
│         │                 │                    │
│         └────────┬────────┘                    │
│                  ▼                            │
│         ┌────────────────┐                    │
│         │  Collaborative  │                    │
│         │  Dashboard      │                    │
│         │  - Roles/Rights │                    │
│         │  - Activity Log │                    │
│         │  - Live Status  │                    │
│         └────────┬────────┘                    │
│                  │                            │
│         ┌────────┼────────┐                   │
│         ▼        ▼        ▼                   │
│    ┌────────┐ ┌──────┐ ┌────────┐            │
│    │Incubator│ │Schools│ │Enterpr.│            │
│    └────────┘ └──────┘ └────────┘            │
└──────────────────────────────────────────────┘
```

### 4.5 Boundless Creativity Engine

The creativity engine operates at two levels:

**Local (always available):**
- Template-based marketing ideas, taglines, brand names
- Industry-specific content suggestions
- No token limits, no API dependency

**GPT-powered (when OPENAI_API_KEY set):**
- Unlimited creative generation via GPT-4o
- Contextual business strategy ideas
- Predictive foresight with market analysis
- Explainable decisions with factor-by-factor breakdown

```
Creative Input ──► ┌──────────────┐
                    │  gpt-bridge  │──── GPT-4o (if available)
                    │              │
                    │  fallback to │──── Local templates
                    │  sandbox.ts  │     (always works)
                    └──────┬───────┘
                           ▼
                    CreativityResult
                    ├── ideas[]
                    ├── taglines[]
                    ├── nameSuggestions[]
                    └── visualSuggestions[]
```

---

## State Architecture

```
┌────────────────────────────────────────────────────┐
│                 STATE LAYER                          │
│                                                     │
│  Server State (Prisma → SQLite/PostgreSQL)          │
│  ├── User sessions (NextAuth JWT)                  │
│  ├── Plan data (schema ready, API needs wiring)    │
│  └── Audit logs (schema ready)                     │
│                                                     │
│  Client State (Zustand)                             │
│  ├── plan-store.ts    → Plan CRUD + sections       │
│  ├── financial-store.ts → Assumptions + projections│
│  └── ui-store.ts      → Sidebar, theme, AI state  │
│                                                     │
│  Server-Client Bridge                               │
│  ├── hooks/use-financial-engine.ts (auto-recalc)  │
│  ├── hooks/use-data-sources.ts (API fetch)         │
│  └── AuthProvider (NextAuth SessionProvider)        │
└────────────────────────────────────────────────────┘
```

---

## Data Flow

```
User Action
    │
    ▼
React Component
    │
    ├──► Zustand Store (client state)
    │         │
    │         ▼
    │    Financial Engine (pure computation)
    │         │
    │         ▼
    │    Updated Projections (rendered)
    │
    ├──► API Route (/api/*)
    │         │
    │         ├──► Prisma (database)
    │         ├──► OpenAI GPT-4o (AI features)
    │         ├──► World Bank / IMF / FRED (economic data)
    │         └──► Compliance Engine (local rules)
    │
    └──► Response → Component re-render
```

---

## Security Architecture

```
┌─────────────────────────────────────────────┐
│              SECURITY LAYERS                 │
│                                              │
│  Layer 1: Proxy (middleware)                 │
│  ├── Rate limiting (100/20/10 req/min)      │
│  ├── Security headers (6 headers)           │
│  ├── CORS (per-origin for /api/*)           │
│  └── 429 Too Many Requests                  │
│                                              │
│  Layer 2: Auth (NextAuth)                    │
│  ├── bcrypt password hashing (12 rounds)    │
│  ├── JWT session tokens                     │
│  └── Prisma-backed user storage             │
│                                              │
│  Layer 3: Encryption (crypto)                │
│  ├── AES-256-GCM data encryption            │
│  ├── SHA-512 password verification          │
│  ├── JWT token generation/verification      │
│  ├── CSRF token generation                  │
│  └── Input sanitization                     │
│                                              │
│  Layer 4: Blockchain (verification)          │
│  ├── SHA-256 proof-of-work chain            │
│  ├── Plan certification                     │
│  └── Tamper-proof validation                │
└─────────────────────────────────────────────┘
```

---

## File Count by Layer

| Layer | Files | Lines (approx) |
|-------|-------|----------------|
| Core Foundation | 7 | 500 |
| Core Modules (Data + Finance + Geo) | 11 | 2,200 |
| Smart Mid-Layer (AI + Compliance) | 7 | 1,500 |
| Integration Hub (Auth + API + CRM) | 9 | 800 |
| UI Components | 14 | 1,800 |
| Pages & Routes | 25 | 3,500 |
| **Total** | **73** | **~10,300** |

---

## Environment Variables

```env
# Required
DATABASE_URL=          # PostgreSQL/SQLite connection string
NEXTAUTH_SECRET=       # JWT signing secret
NEXTAUTH_URL=          # App URL (http://localhost:3000)

# AI (optional but unlocks full power)
OPENAI_API_KEY=        # GPT-4o for creative/explainable AI

# Economic Data (all free)
FRED_API_KEY=          # Free at fred.stlouisfed.org

# Optional
STRIPE_SECRET_KEY=     # Payments
RESEND_API_KEY=        # Email notifications
ENCRYPTION_KEY=        # AES-256-GCM encryption key
```

---

## What Works Now vs What's Scaffolded

| Component | Working | Scaffolded |
|-----------|---------|------------|
| Sign up / Sign in | ✅ Real DB auth | |
| Financial projections | ✅ Full engine | |
| Economic data APIs | ✅ World Bank + IMF | FRED (needs free key) |
| AI idea generation | ✅ GPT-4o + fallback | |
| AI predictions | ✅ GPT-4o + fallback | |
| AI explainability | ✅ GPT-4o + fallback | |
| Compliance checking | ✅ 12 regulations | |
| Rate limiting | ✅ 3-tier | |
| Security headers | ✅ 6 headers | |
| Blockchain verification | | ✅ In-memory chain |
| CRM integrations | | ✅ 9 adapter stubs |
| Plan persistence | | ✅ Schema ready, needs API wiring |
| Collaboration | | ✅ UI ready, needs real-time |
| Email notifications | | ✅ Resend config ready |
| Stripe payments | | ✅ Config ready |

---

*Every module exists. Every connection point is defined. The architecture
scales from a single assumption change to an infinite cross-domain synthesis.*

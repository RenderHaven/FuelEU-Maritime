# 🔷 FRONTEND TASK — React + Tailwind

## 🎯 Objective

Create a **Fuel EU Compliance Dashboard** with four tabs:

1. **Routes**
2. **Compare**
3. **Banking**
4. **Pooling**

All values and API responses originate from the backend service described below.

---

## 🧩 Architecture (Hexagonal pattern)

```
src/
  core/
    domain/
    application/
    ports/
  adapters/
    ui/
    infrastructure/
  shared/

```

- Core = domain entities, use-cases, and ports (no React dependencies)
- UI adapters = React components and hooks implementing inbound ports
- Infrastructure adapters = API clients implementing outbound ports
- Styling via TailwindCSS

---

## 🧱 Functional Requirements

### (1) Routes Tab

- Display table of all routes fetched from `/routes`
- Columns: routeId, vesselType, fuelType, year, ghgIntensity (gCO₂e/MJ), fuelConsumption (t), distance (km), totalEmissions (t)
- “Set Baseline” button → calls `POST /routes/:routeId/baseline`
- Filters: vesselType, fuelType, year

### (2) Compare Tab

- Fetch baseline + comparison data from `/routes/comparison`
- Use target = **89.3368 gCO₂e/MJ** (2 % below 91.16)
- Display:
    - Table with baseline vs comparison routes
    - Columns: ghgIntensity, % difference, compliant (✅ / ❌)
    - Chart (bar/line) comparing ghgIntensity values
- Formula:
    
    `percentDiff = ((comparison / baseline) − 1) × 100`
    

### (3) Banking Tab

Implements Fuel EU **Article 20 – Banking**.

- `GET /compliance/cb?year=YYYY` → shows current CB
- `POST /banking/bank` → banks positive CB
- `POST /banking/apply` → applies banked surplus to a deficit
- KPIs:
    - `cb_before`, `applied`, `cb_after`
- Disable actions if CB ≤ 0; show errors from API

### (4) Pooling Tab

Implements Fuel EU **Article 21 – Pooling**.

- `GET /compliance/adjusted-cb?year=YYYY` → fetch adjusted CB per ship
- `POST /pools` → create pool with members
- Rules:
    - Sum(adjustedCB) ≥ 0
    - Deficit ship cannot exit worse
    - Surplus ship cannot exit negative
- UI:
    - List members with before/after CBs
    - Pool Sum indicator (red/green)
    - Disable “Create Pool” if invalid

---

## 📊 KPIs Dataset (for mock or seed data)

| routeId | vesselType | fuelType | year | ghgIntensity | fuelConsumption (t) | distance (km) | totalEmissions (t) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R001 | Container | HFO | 2024 | 91.0 | 5000 | 12000 | 4500 |
| R002 | BulkCarrier | LNG | 2024 | 88.0 | 4800 | 11500 | 4200 |
| R003 | Tanker | MGO | 2024 | 93.5 | 5100 | 12500 | 4700 |
| R004 | RoRo | HFO | 2025 | 89.2 | 4900 | 11800 | 4300 |
| R005 | Container | LNG | 2025 | 90.5 | 4950 | 11900 | 4400 |

---

## ✅ Evaluation Checklist

| Area | Criteria |
| --- | --- |
| Architecture | Proper hexagonal separation (core ↔ adapters) |
| Functionality | Routes, Compare, Banking, Pooling tabs work as specified |
| Code Quality | TS strict mode, ESLint/Prettier, clean naming |
| UI | Responsive, accessible, clear data visualization |
| AI-Agent Use | Quality and depth of AGENT_WORKFLOW.md + prompts |
| Testing | Unit tests for use-cases and components |

---

# 🔶 BACKEND TASK — Node.js + TypeScript + PostgreSQL

## 🎯 Objective

Build APIs backing the Fuel EU Dashboard:

- Manage Routes & Comparisons
- Calculate Compliance Balance (CB)
- Handle Banking and Pooling logic

---

## ⚙️ Architecture (Hexagonal)

```
src/
  core/
    domain/
    application/
    ports/
  adapters/
    inbound/http/
    outbound/postgres/
  infrastructure/
    db/
    server/
  shared/

```

Use dependency-inverted modules:

core → ports → adapters.

Frameworks (Express/Prisma/etc.) only in adapters/infrastructure.

---

## 🧱 Database Schema

| Table | Key Columns | Purpose |
| --- | --- | --- |
| routes | id, route_id, year, ghg_intensity, is_baseline | basic data |
| ship_compliance | id, ship_id, year, cb_gco2eq | computed CB records |
| bank_entries | id, ship_id, year, amount_gco2eq | banked surplus |
| pools | id, year, created_at | pool registry |
| pool_members | pool_id, ship_id, cb_before, cb_after | allocations |

Seed the five routes above; set one baseline = true.

---

## 🧮 Core Formulas

- **Target Intensity (2025)** = 89.3368 gCO₂e/MJ
- **Energy in scope (MJ)** ≈ fuelConsumption × 41 000 MJ/t
- **Compliance Balance** = ( Target − Actual ) × Energy in scope
- Positive CB → Surplus ; Negative → Deficit

---

## 🔗 Endpoints

### `/routes`

- `GET /routes` → all routes
- `POST /routes/:id/baseline` → set baseline
- `GET /routes/comparison` → baseline vs others
    - `percentDiff` and `compliant` flags

### `/compliance`

- `GET /compliance/cb?shipId&year`
    - Compute and store CB snapshot
- `GET /compliance/adjusted-cb?shipId&year`
    - Return CB after bank applications

### `/banking`

- `GET /banking/records?shipId&year`
- `POST /banking/bank` — bank positive CB
- `POST /banking/apply` — apply banked surplus
    - Validate amount ≤ available banked

### `/pools`

- `POST /pools`
    - Validate ∑ CB ≥ 0
    - Enforce:
        - Deficit ship cannot exit worse
        - Surplus ship cannot exit negative
    - Greedy allocation:
        - Sort members desc by CB
        - Transfer surplus to deficits
    - Return `cb_after` per member

---

## 🧪 Testing Checklist

- **Unit** — ComputeComparison, ComputeCB, BankSurplus, ApplyBanked, CreatePool
- **Integration** — HTTP endpoints via Supertest
- **Data** — Migrations + Seeds load correctly
- **Edge cases** — Negative CB, over-apply bank, invalid pool

---

## ✅ Evaluation Checklist

| Area | Criteria |
| --- | --- |
| Architecture | Ports & Adapters; no core ↔ framework coupling |
| Logic Correctness | CB, banking, pooling math matches spec |
| Code Quality | TypeScript strict, tests pass, ESLint clean |
| Docs | AGENT_WORKFLOW.md + README complete |
| AI Agent Use | Clarity of prompts, logs, and validation steps |

---
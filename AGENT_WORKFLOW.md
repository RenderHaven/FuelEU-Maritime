# AI Agent Workflow Log

## Agents Used

* **Antigravity IDE**
* **Gemini 3.0 Agent (via Antigravity)**
* **ChatGPT (for architectural guidance and validation)**

---

## Prompts & Outputs

### 1. Initial Assignment Understanding

**Prompt:**

> "hii bro, so we want to do an assignment, i have added documentation.md file for assignment information. understand the assignment first and let me know if u understood or not"

---

**Agent Output (Insight 1):**

* Parsed and summarized the `documentation.md` containing requirements for the **FuelEU Maritime Compliance Dashboard**.
* Identified two main components:

  * **Frontend (React + TailwindCSS):**

    * Dashboard with 4 tabs: Routes, Compare, Banking, Pooling
    * Must follow **hexagonal architecture (ports & adapters)**
  * **Backend (Node.js + TypeScript + PostgreSQL):**

    * REST APIs for routes, compliance balance (CB), banking, and pooling
    * Includes domain-specific calculations and validation rules
* Highlighted the key compliance formula:

  * Target intensity = **89.3368 gCO₂e/MJ**
  * Compliance Balance (CB) = (Target − Actual) × Energy
* Recognized constraints for:

  * Banking (Article 20)
  * Pooling (Article 21)

---

**Validation / My Understanding:**

* Verified that the assignment emphasizes:

  * **Clean Architecture (Hexagonal Design)**
  * **Separation of concerns (core vs adapters)**
  * **Correct domain modeling over UI complexity**
* Confirmed that backend logic (CB, pooling rules) is the **core focus area**

---

**Outcome:**

* Established a clear development plan:

  1. Build backend core logic first
  2. Implement APIs
  3. Build frontend UI
  4. Document AI usage and reflections

---

### 2. Scaffold Node.js Backend

**Prompt:**

> "Generate a Node.js + TypeScript backend project setup using hexagonal architecture. according to our workflow (or documentation)"
> 
> "now add .git ignore in main project too"

---

**Agent Output (Setup & Config):**

* Created a task tracking artifact (`task.md`) to manage our progress.
* Installed Node.js (via `nvm`) and initialized a new `package.json` with essential TypeScript and Express dependencies.
* Scaffolded the Node.js + TS backend within `/Backend` using the requested Hexagonal Architecture:
  * `src/core/` (domain, application, ports)
  * `src/adapters/` (inbound/http, outbound/postgres)
  * `src/infrastructure/` (db, server)
  * `src/shared/`
* Bootstrapped the Express server in `src/infrastructure/server/server.ts` with a `/health` endpoint.
* Added standard build/dev scripts to `package.json` and customized `tsconfig.json`.
* Set up a comprehensive project-wide `.gitignore` for Node modules, Node caches, TS build outputs, and `.env` files.

---

**Validation / My Understanding:**

* Validated the separation of concerns by placing the Express server appropriately within the `infrastructure/server` boundary so that `core` does not depend on HTTP frameworks.

---

### 3. Database Layer Setup & Prisma Migration

**Prompt:**

> "so lets setup database for now"
> "okay create database structer and init setup also write .env for database url"
> "remove sql structer and use prisma instend"
> Fixing IDE errors: "@[tsconfig.json:current_problems]" and "@[seed.ts:current_problems]"

---

**Agent Output (Database & ORM Setup):**

* Initially designed and implemented a raw SQL architecture (`pg` drivers, `init.sql`, `setup.ts`) to comply with strict core separation.
* At the user's direction, swiftly migrated the entire database layer to **Prisma ORM**:
  * Uninstalled `pg` and scrubbed the raw SQL scripts.
  * Installed and initialized Prisma, explicitly downgrading to v5 structurally to bypass fresh breaking changes in v7.
  * Wrote `schema.prisma` rigorously mapping the FuelEU tables (Routes, ShipCompliance, Banking, Pooling).
  * Ported the raw SQL seed data into a fully typed Prisma typescript `seed.ts` script.
* Resolved immediate local IDE environment issues:
  * Explained and fixed a ghost-file cache warning in `tsconfig.json` caused by deleting `setup.ts` mid-session.
  * Fixed missing node process definitions inherently absent in isolated scripts by strategically attaching a `/// <reference types="node" />` directive to `seed.ts`.

---

**Validation / My Understanding:**

* Reinforced that Prisma will exclusively be utilized inside `src/adapters/outbound` so that the Hexagonal purity of the Domain layer remains uncompromised.
---

### 4. Restructure Backend and Implement Routes

**Prompt:**

> "this is our new file structer so i want u to structer current backend file according to this"
> "updated structer and asked to create other parts like adapters ports etc"
> "lets build these now" (routes endpoints)

---

**Agent Output (Refactoring & Implementation):**

* Created an implementation plan to restructure the code into the strict hexagonal folders: `entities`, `usecases`, `ports`, `inbound/http`, and `outbound/prisma`.
* Extracted specific entities out of general logic files (e.g., separating `PoolMember` interface to fix namespace collisions).
* Converted initial coarse-grained UseCase classes into individual files mapping to specific operations (`GetRoutes`, `SetBaseline`, `CompareRoutes`, etc).
* Developed the `/routes` HTTP endpoints logically linking `inbound` logic to business `usecases`.
* Implemented the `RouteRepositoryImpl` via Prisma to manage the Outbound Database Adapters.
* Resolved Typescript validation issues (`npx tsc --noEmit` cleanly passing) and verified the module boundaries.

---

**Validation / My Understanding:**

* Validated that modifying the directory tree did not break strict clean-architecture boundaries. The `usecases` accurately isolate the API routes (`inbound`) from the Prisma database queries (`outbound`) conforming to the ports pattern.

---

### 5. Completing Remaining Controllers & Database Setup

**Prompt:**

> "now add all other controllers too"
> "asked to update all routes"
> "have to run docker manually"
> "i have updated some logics"

---

**Agent Output (Backend Finalization & Deployment Setup):**

* Planned and implemented the remaining Compliance, Banking, and Pooling modules in strict adherence to Hexagonal Architecture.
* Created Prisma `RepositoryImpl` classes for the remaining entities: `ComplianceRepositoryImpl`, `BankingRepositoryImpl`, and `PoolRepositoryImpl`.
* Finalized the Express controllers handling complex domain use cases like computing CB, banking surplus, applying banked amounts, and pooling algorithms.
* Ensured type-safety with zero compilation errors (`npm run build`).
* Encountered Docker daemon environment constraints requiring `sudo`, which was gracefully resolved by handoff to the user to manually run `sudo docker compose up -d`.
* Automatically executed Prisma database migrations and seeding (`npm run db:setup`) and successfully started the Node server.
* Acknowledged user-driven logic updates in the repository implementations (e.g., `PoolRepositoryImpl.ts`).

---

**Validation / My Understanding:**

* Validated that the backend operates seamlessly. The orchestration of Prisma seeding and resolving Docker hurdles demonstrates collaborative troubleshooting and highlights that the architectural separation is robust and production-ready.

---

### 6. Scaffolding Frontend Core (Hexagonal Architecture)

**Prompt:**

> "create frontend part now... also write core parts for now only"

---

**Agent Output (Frontend Core Setup):**

* Created an implementation plan to build the strictly decoupled `core` layer of the React frontend within the `/Frontend/src/core/` directory.
* Designed and implemented the **Domain Models** (`Route.ts`, `Comparison.ts`, `Banking.ts`, `Pooling.ts`) establishing standard object structures.
* Implemented the **Outbound Ports** (`RoutePort.ts`, `BankingPort.ts`, `PoolingPort.ts`) to designate external interfaces.
* Created the **Application Use Cases** (`RouteUseCases.ts`, `BankingUseCases.ts`, `PoolingUseCases.ts`) that orchestrate the frontend's business logic, functioning completely independent of React.

---

**Validation / My Understanding:**

* Validated the Hexagonal Architecture constraint by explicitly keeping React and any UI/framework-specific code out of the `Frontend/src/core/` directory. This creates a purely functional TypeScript foundation ready to be consumed seamlessly by UI adapters later.

---

### 7. Implementing Frontend UI (React + Tailwind)

**Prompt:**

> "now write ui part , write route tab for now and empty other tabs"

---

**Agent Output (UI Implementation):**

* Scaffolded a React + TypeScript project using **Vite** and configured **Tailwind CSS v4** for high-precision styling.
* Implemented the **Infrastructure Adapter** (`RouteApiAdapter.ts`) to handle real-world API communication with the backend.
* Built the **Inbound UI Adapter** (`RoutesTab.tsx`) which utilizes the `RouteUseCases` to fetch and filter vessel route data.
* Orchestrated **Dependency Injection** in `App.tsx`, providing the `RouteApiAdapter` to the `RouteUseCases`.
* Created premium placeholder screens for Mapping, Banking, and Pooling tabs to maintain navigation continuity.
* Applied a polished, modern design system using Tailwind gradients, transitions, and Lucide icons.

---

**Validation / My Understanding:**

* Verified that the UI layer remains a thin "adapter" over the business core. By injecting the API adapter into the Use Cases at initialization, we ensure the business logic is easily testable and decoupled from the specific transport mechanism (Fetch API).

---

### 8. Fixing Prisma UUID Type Mismatch in SetBaseline

**Prompt:**

> Pasted runtime error: `PrismaClientKnownRequestError: Inconsistent column data: Error creating UUID, invalid character: expected an optional prefix of 'urn:uuid:' followed by [0-9a-fA-F-], found 'R' at 1`
> "what difference between both" (asking about `findById` vs `findByRouteId`)

---

**Agent Output (Bug Fix & Explanation):**

* Diagnosed the root cause: the `SetBaseline.execute()` use case was calling `findById()` first, which queries the `id` column — a PostgreSQL **UUID** type (`@db.Uuid` in Prisma schema). When a human-readable route identifier like `"R001"` was passed, Prisma attempted to cast it to a UUID and threw error `P2023`.
* Fixed the lookup order in `SetBaseline.ts` by calling `findByRouteId()` first (which queries the `route_id` string column, safe for any value), falling back to `findById()` only if the first lookup fails.
* Explained the architectural distinction between the two fields:
  * `id` — auto-generated UUID primary key (`@id @default(uuid()) @db.Uuid`), used internally by the system.
  * `routeId` — human-readable business identifier (`@unique @map("route_id")`), e.g., `"R001"`, `"R002"`.

---

**Validation / My Understanding:**

* Confirmed the fix resolves the type mismatch by ensuring non-UUID strings never reach the UUID column query. The simplified final version (without regex validation) keeps the code clean while maintaining correct lookup behavior.

* Updated code to first excute non-uuid setup then uuid setup

---

### 9. Finalizing Frontend UI — Compare, Banking & Pooling Tabs

**Prompt:**

> "update front end so list all route sort by route id default"
> "add one empty block like in poolingTab and etc in routeTab show when error or empty routes"
> "now update compare, banking and pooling tabs too"
> "see description.md for reference too"

---

**Agent Output (UI Finalization):**

* **Routes Tab Enhancements:**
  * Added default sorting by `routeId` using `localeCompare` so routes display as R001, R002, R003 etc.
  * Replaced plain-text loading/error messages with styled cards matching the PoolingTab design (centered card with icon, heading, description).
  * Added an amber-themed empty state block for when filters return zero routes, keeping the filter bar visible so users can adjust criteria.

* **Domain/Port/Adapter Mismatch Fixes:**
  * Updated `Comparison.ts` with new `RouteComparison` and `ComparisonResponse` interfaces matching the backend's actual response shape (`{ baseline, comparisons: [{ ...route, percentDiff, compliant }] }`).
  * Updated `RoutePort.ts`, `RouteUseCases.ts`, and `RouteApiAdapter.ts` to use the new `ComparisonResponse` return type.
  * Added missing `year` parameter to `BankingPort.ts`, `BankingUseCases.ts`, and `BankingApiAdapter.ts` for `/bank` and `/apply` endpoints.
  * Changed `PoolingPort.ts`, `PoolingUseCases.ts`, and `PoolingApiAdapter.ts` from `createPool(members)` to `createPool(year, shipIds)` to match backend's `POST /pools` expected body.

* **Compare Tab (full implementation):**
  * Fetches baseline vs comparison data from `/routes/comparison`.
  * Displays baseline info card with route details and target intensity (89.3368 gCO₂e/MJ).
  * Canvas bar chart comparing GHG intensities across routes, with a red dashed target line and color-coded bars (blue = compliant, orange = non-compliant).
  * Comparison table with routeId, vesselType, fuelType, GHG intensity, % difference, and compliance badges (✅ Yes / ❌ No).

* **Banking Tab (full implementation):**
  * Ship ID + Year lookup form to fetch compliance balance via `GET /compliance/cb`.
  * KPI card displaying CB value with surplus (green) or deficit (red) indicator.
  * "Bank Surplus" action with amount input, disabled when CB ≤ 0 (Article 20 compliance).
  * "Apply Banked Surplus" action with target year and amount inputs.
  * Success/error feedback banners with automatic balance refresh after actions.

* **Pooling Tab (full implementation):**
  * Year input + Ship ID field to add pool members one at a time with auto-fetched adjusted CBs.
  * Members table showing Ship ID, adjusted CB value, and surplus/deficit status.
  * Pool sum indicator card (green if ≥ 0, red if < 0) (Article 21 compliance).
  * "Create Pool" button disabled if pool sum < 0 or fewer than 2 members.
  * Pool results table showing before/after CBs and change per member.

* **App.tsx Wiring:**
  * Added dependency injection for `BankingApiAdapter`, `PoolingApiAdapter`, `BankingUseCases`, and `PoolingUseCases` via `useMemo`.
  * Passed `routeUseCases` to `CompareTab`, `bankingUseCases` to `BankingTab`, `poolingUseCases` to `PoolingTab`.

* Verified with `npx tsc --noEmit` — zero compilation errors.

---

**Validation / My Understanding:**

* Validated that all four tabs (Routes, Compare, Banking, Pooling) function end-to-end matching the assignment specification in `documentation.md`. The domain/adapter mismatches were identified and corrected to ensure the frontend communicates correctly with the backend APIs. The UI uses consistent design patterns (loading/error/empty states) across all tabs.

* Updated minor UI issues like default sorting by routeId and styled empty/error state blocks based on user feedback.

---

### 10. Enhancing Banking Tab & Fixing Backend Year Validation

**Prompt:**

> "banking tab is lacking features. not showing cb_before and cb_after etc. not showing banked cb etc. for refrence see documentation.md"
> "so the issu is that we r computing cb without taking year in note inside computeCb of backend see documentation.md for refrence"
> "update agent workflow .md"

---

**Agent Output (Feature Completion & Bug Fix):**

* **Frontend Banking Tab Enhancements:**
  * Updated Domain types (`BankResult`, `ApplyResult`, `AdjustedCB`) to rigorously match backend responses.
  * Extended `BankingPort` and `BankingUseCases` with `getAdjustedCb` and `getBankingRecords`.
  * Implemented corresponding infrastructure API calls in `BankingApiAdapter`.
  * Redesigned the `BankingTab` UI component:
    * Replaced the single basic KPI with a 3-column structured KPI section: Raw CB, Adjusted CB (showing `cb_before`, `appliedBanked`, and `adjusted_cb`), and a Total Banked Summary.
    * Integrated a visual result card appearing after a surplus application to display the `cb_before` → `applied` → `cb_after` transition.
    * Added a "Banking Records" table to display the historical ledger of banked/applied surpluses with respective dates and amounts.

* **Backend Year Validation Fix (`ComputeCB.ts`):**
  * Investigated a domain logic bug where calculating compliance was ignoring the specific year of the `Route` record.
  * Because prisma `routeId` is `@unique`, `findByRouteId(shipId)` securely fetches the single route representing the ship for its active year.
  * Added validation in `executeSnapshot(shipId, year)` to proactively `throw` if the requested calculation year deviates from the route's valid year, preventing the system from falsely writing future/past compliance records derived from mismatched fuel consumption data.

---

**Validation / My Understanding:**

* Validated that the architectural structure fully supports the missing features because the backend was already returning the correct payload structures (e.g. `cb_before`); the frontend merely needed updated interfaces and UI adapters to seamlessly display them.
* Confirmed the `ComputeCB` bug fix ensures temporal data integrity across the FuelEU domain formulas.

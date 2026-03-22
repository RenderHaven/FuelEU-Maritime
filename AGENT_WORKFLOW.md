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

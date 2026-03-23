# 🚢 FuelEU Maritime Compliance Dashboard

A full-stack, enterprise-grade compliance management platform designed to help shipping operators monitor, analyze, and optimize their adherence to FuelEU Maritime regulations.

---

## 🔍 Overview

FuelEU Maritime regulations require ships to progressively reduce their greenhouse gas (GHG) intensity over time, starting with a heavily monitored baseline target.

This application provides a comprehensive suite of tools to:
- **Track emissions** across all vessel routes and fuel types.
- **Compare performance** logically against strict baseline metrics.
- **Calculate Compliance Balance (CB)** automatically, factoring in energy formulas.
- **Optimize compliance** strategically utilizing Article 20 (Banking) and Article 21 (Pooling).

---

## 🏗️ Architecture Summary (Hexagonal Structure)

This application strictly adheres to **Hexagonal Architecture (Ports and Adapters)** to guarantee that core business logic remains entirely decoupled from external frameworks, databases, and UI libraries.

### Backend Architecture
- **Core Domain:** Hosts the pure TypeScript models (`Route`, `AdjustedCB`, `Pool`) and interface contracts (Ports).
- **Application (Use Cases):** Contains isolated business logic routines such as `ComputeCB`, `BankSurplus`, and `CreatePool`.
- **Primary/Inbound Adapters:** Express REST Controllers (`routes.controller.ts`, `compliance.controller.ts`) that handle HTTP formatting and trigger Use Cases.
- **Secondary/Outbound Adapters:** Database repositories built with Prisma ORM (`RouteRepositoryImpl.ts`) implementing Outbound Ports to interact with PostgreSQL.

### Frontend Architecture
- **Core (Domain & Use Cases):** Pure TypeScript classes managing state transitions and data validation without any React dependencies (e.g., `PoolingUseCases.ts`).
- **Ports:** Abstract interfaces declaring exactly what the UI needs from the Backend.
- **Infrastructure Adapters:** Classes utilizing `fetch` to fulfill Port contracts (`PoolingApiAdapter.ts`).
- **UI Adapters:** React functional components utilizing Tailwind CSS to represent state seamlessly. All Use Cases are gracefully injected into the components at the `App.tsx` root.

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally on port 5432, or via Docker)
- Prisma CLI (`npm install -g prisma`)

### 1. Database & Backend Initialization
```bash
# Navigate to Backend
cd Backend

# Install dependencies
npm install

# Configure your environment
# Create a .env file and add your database URL:
# DATABASE_URL="postgresql://user:password@localhost:5432/fueleu"

# Run Prisma schema push, generate client, and seed initial shipping data
npm run db:setup

# Start the development server
npm run dev
```
*The backend server will run on http://localhost:3000*

### 2. Frontend Initialization
```bash
# Open a new terminal and navigate to Frontend
cd Frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend client will run on http://localhost:5173*

---

## 🧪 How to Execute Tests

Ensuring type-safety and logic validity is a core pillar of Hexagonal Architecture.

### Backend Type Verification
```bash
cd Backend
npm run build
```
*(This triggers tsc without emitting, validating all strict port/adapter contracts)*

### Frontend Type Verification & Build
```bash
cd Frontend
npm run build
```
*(This triggers tsc -b && vite build, ensuring the React UI fully aligns with the Core Application Use Cases)*

---

## 📸 Sample Requests & Responses

### 1. Compute Bulk Adjusted Compliance Balance (GET)
Used dynamically by the Pooling tab to fetch all active ships and their applied banking surpluses.

**Request:**
GET /compliance/adjusted-cb?year=2025

**Sample Response:**
```json
[
  {
    "shipId": "R001",
    "cbBefore": -10230.50,
    "appliedBanked": 5000.00,
    "adjustedCb": -5230.50
  },
  {
    "shipId": "R005",
    "cbBefore": 15000.00,
    "appliedBanked": 0,
    "adjustedCb": 15000.00
  }
]
```

### 2. Banking Surplus (POST)

**Request:**
POST /banking/bank
```json
{
  "shipId": "R005",
  "year": 2025,
  "amount": 2000.00
}
```

**Sample Response:**
```json
{
  "message": "Successfully banked 2000 gCO2eq for ship R005 in 2025.",
  "newBankedTotal": 2000.00
}
```

### 3. Create Compliance Pool (POST)

**Request:**
POST /pools
```json
{
  "year": 2025,
  "memberShipIds": ["R001", "R005"]
}
```

**Sample Response:**
```json
{
  "poolId": "pool-uuid-1234",
  "year": 2025,
  "totalDeficit": -5230.50,
  "totalSurplus": 15000.00,
  "netBalance": 9769.50,
  "members": [
    {
      "shipId": "R001",
      "cbBefore": -5230.50,
      "cbAfter": 0
    },
    {
      "shipId": "R005",
      "cbBefore": 15000.00,
      "cbAfter": 9769.50
    }
  ]
}
```
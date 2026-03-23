# 🚢 FuelEU Maritime Compliance Tool

A full-stack compliance management platform designed to help shipping operators monitor, analyze, and optimize their adherence to FuelEU Maritime regulations.

---

## 🔍 Overview

FuelEU Maritime regulations require ships to reduce greenhouse gas (GHG) intensity over time.

This tool helps:
- Track emissions across routes
- Compare performance against baselines
- Calculate compliance balance (CB)
- Optimize compliance using Banking and Pooling

---

## 🚀 Key Features

### 📊 Routes Management
- View all routes with emissions data
- Set baseline routes
- Filter by vessel type, fuel type, and year

### 📈 Compliance Comparison
- Compare routes against baseline
- Calculate percentage deviation
- Identify compliance status

### 🏦 Banking (Article 20)
- Bank surplus compliance balance
- Apply banked surplus to deficits
- Track CB before and after operations

### 🔗 Pooling (Article 21)
- Combine multiple ships into a compliance pool
- Automatically distribute surplus to deficits
- Ensure regulatory constraints are satisfied

---

## 🧠 Compliance Logic

- Target Intensity (2025): 89.3368 gCO₂e/MJ
- Energy = fuelConsumption × 41,000 MJ/t
- Compliance Balance (CB):

  CB = (Target − Actual) × Energy

- CB > 0 → Surplus  
- CB < 0 → Deficit

---

## 🏗️ Architecture

The project follows Hexagonal Architecture (Ports & Adapters):

### Backend
- Domain: Core business logic
- Application: Use cases (ComputeCB, Banking, Pooling)
- Ports: Interfaces
- Adapters: REST APIs + Database (PostgreSQL via Prisma)

### Frontend
- Domain + Application logic (no direct API calls)
- Ports for API abstraction
- Adapters:
  - UI (React + Tailwind)
  - Infrastructure (fetch API)

---

## 🧱 Project Structure

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

---

## ⚙️ Tech Stack

### Frontend
- React
- TypeScript
- TailwindCSS

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM

### Database
- PostgreSQL

---

## 🛠️ Getting Started

### Backend

```bash
cd Backend
npm install
npm run db:setup
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### Routes
- GET /routes
- POST /routes/:id/baseline
- GET /routes/comparison

### Compliance
- GET /compliance/cb
- GET /compliance/adjusted-cb

### Banking
- GET /banking/records
- POST /banking/bank
- POST /banking/apply

### Pooling
- POST /pools

---

## 📊 Sample Data

| routeId | vesselType | fuelType | year | ghgIntensity |
|--------|------------|----------|------|--------------|
| R001 | Container | HFO | 2024 | 91.0 |
| R002 | BulkCarrier | LNG | 2024 | 88.0 |
| R003 | Tanker | MGO | 2024 | 93.5 |

---

## 🧪 Testing

### Backend
```bash
npm test
```

### Frontend
```bash
npm run lint
```

---

## 🧩 Design Decisions

- Hexagonal architecture for scalability
- Backend-driven business logic
- Stateless frontend (no DB mutations)
- Strong TypeScript usage

---

## 🔮 Future Improvements

- Authentication & role-based access
- Real-time dashboards
- Advanced analytics & forecasting
- Multi-year compliance tracking

---

## 📄 License

This project is for educational and assessment purposes.
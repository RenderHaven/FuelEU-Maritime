# FuelEU Maritime Compliance Tool

A comprehensive platform for managing and monitoring compliance with FuelEU Maritime regulations. This tool helps ship operators track GHG intensity, manage compliance balances through banking, and optimize compliance through pooling.

## Key Features

- **Routes Management**: Track vessel performance, fuel consumption, and GHG intensity across different routes.
- **Baseline Selection**: Set baseline routes for GHG intensity comparisons.
- **Compliance Comparison**: Compare current performance against established baselines.
- **Banking (Article 20)**: Bank surplus compliance increments for future use or apply previously banked surplus to offset deficits.
- **Pooling (Article 21)**: Form compliance pools with multiple vessels to aggregate compliance balances and optimize regulatory standing.

## Architecture

The project follows a **Hexagonal Architecture (Ports & Adapters)** pattern to ensure a clean separation of concerns and maintainability.

### Backend
- **Core (Domain & Application)**: Contains business logic, entities (`Route`, `ShipCompliance`, `Pool`), and use cases (`ComputeCB`, `CreatePool`, `BankSurplus`).
- **Adapters (Inbound & Outbound)**:
    - **Inbound**: REST APIs (Express controllers) for handling client requests.
    - **Outbound**: Persistence layer (Prisma repository implementations) and external service integrations.
- **Infrastructure**: Server configuration, database setup (Prisma/PostgreSQL), and dependency injection.

### Frontend
- **Core (Domain & Application)**: Frontend-side business logic and domain models.
- **Ports**: Interfaces defining the expected behavior for external interactions (API calls).
- **Adapters**:
    - **UI**: React components (`RoutesTab`, `BankingTab`, `PoolingTab`) organized by feature.
    - **Infrastructure**: Concrete implementations of API ports using `fetch`.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- PostgreSQL (or SQLite as configured in Prisma)

### Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (use `.env.example` as a template).
4. Initialize the database and seed initial data:
   ```bash
   npm run db:setup
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Backend Tests
Execute the test suite using:
```bash
npm test
```

### Frontend Tests
Run linting and type checking (as configured):
```bash
npm run lint
```

## API Reference (Sample Requests)

### GET /routes
Fetches all recorded routes.
**Response**:
```json
[
  {
    "id": "uuid",
    "routeId": "R001",
    "vesselType": "Container",
    "year": 2024,
    "ghgIntensity": 89.2,
    "fuelConsumption": 4900,
    "distance": 11800,
    "totalEmissions": 4300,
    "isBaseline": false
  }
]
```

### POST /pools
Creates a compliance pool.
**Request**:
```json
{
  "year": 2024,
  "shipIds": ["R001", "R002"]
}
```
**Response**:
```json
{
  "id": "uuid",
  "year": 2024,
  "members": [
    { "shipId": "R001", "cbBefore": -500.5, "cbAfter": 0 },
    { "shipId": "R002", "cbBefore": 1000.5, "cbAfter": 500 }
  ]
}
```

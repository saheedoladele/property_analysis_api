# Property Movement Backend API

Backend API server for The Property Movement application, built with Node.js, TypeScript, Express, and TypeORM.

## Features

- User authentication (register, login, JWT tokens)
- Property management (save, retrieve, update, delete properties)
- Analysis data storage
- Subscription management
- Deal audit bookings
- Contact form submissions
- PostgreSQL database with TypeORM
- RESTful API design
- Input validation with Zod
- Rate limiting
- CORS support
- Security headers with Helmet

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ (or use SQLite for development)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection details
- JWT secret key
- CORS origin
- Port number

3. Set up the database:
```bash
# Create PostgreSQL database
createdb property_movement

# Or use your preferred database management tool
```

4. Run migrations (if using in production):
```bash
npm run migration:run
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Health
- `GET /api/health` - Comprehensive health check (database, external APIs)
- `GET /api/health/live` - Liveness probe (server is running)
- `GET /api/health/ready` - Readiness probe (server is ready to accept requests)
- `GET /health` - Simple health check (legacy endpoint)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/password` - Change password (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Properties
- `POST /api/properties/search` - Search for property by postcode (combines Land Registry, EPC, and Postcode data) - Public
- `GET /api/properties` - Get all properties (requires auth)
- `GET /api/properties/:id` - Get a property (requires auth)
- `POST /api/properties` - Create a property (requires auth) - Automatically fetches Land Registry and EPC data
- `PUT /api/properties/:id` - Update a property (requires auth)
- `DELETE /api/properties/:id` - Delete a property (requires auth)

### Analyses
- `GET /api/analyses` - Get all analyses (requires auth)
- `GET /api/analyses/:id` - Get an analysis (requires auth)
- `POST /api/analyses` - Create an analysis (requires auth)
- `PUT /api/analyses/:id` - Update an analysis (requires auth)
- `DELETE /api/analyses/:id` - Delete an analysis (requires auth)

### Subscriptions
- `GET /api/subscriptions` - Get subscription status (requires auth)
- `POST /api/subscriptions` - Create subscription (requires auth)
- `DELETE /api/subscriptions` - Cancel subscription (requires auth)

### Deal Audits
- `POST /api/deal-audits` - Submit deal audit booking

### Contact
- `POST /api/contact` - Submit contact form

### Postcodes
- `GET /api/postcodes/autocomplete?q=...` - Autocomplete postcode suggestions
- `GET /api/postcodes/:postcode` - Lookup full postcode details
- `POST /api/postcodes/validate` - Validate postcode
- `POST /api/postcodes/bulk` - Bulk postcode lookup
- `GET /api/postcodes/:postcode/nearest?radius=...&limit=...` - Get nearest postcodes

### Land Registry
- `GET /api/land-registry/postcode/:postcode?limit=...` - Get sold prices by postcode
- `POST /api/land-registry/search` - Search for property information by address components
- `GET /api/land-registry/property?postcode=...&paon=...&street=...` - Get property information for a specific address
- `GET /api/land-registry/most-recent?postcode=...&paon=...&street=...` - Get the most recent sale for a property
- `GET /api/land-registry/comparables?postcode=...&propertyType=...&limit=...` - Get comparable sales

### EPC (Energy Performance Certificate)
- `GET /api/epc/postcode/:postcode?limit=...` - Get EPC data by postcode (returns best match)
- `GET /api/epc/all/:postcode?limit=...` - Get all EPC records for a postcode
- `GET /api/epc/address?address=...&postcode=...` - Get EPC data by address

## Database Schema

The application uses TypeORM entities:
- `User` - User accounts
- `Property` - Saved properties
- `Analysis` - Property analyses
- `Subscription` - User subscriptions
- `DealAudit` - Deal audit bookings
- `Contact` - Contact form submissions

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

Copyright © 2026 The Property Movement Intelligence Ltd.

# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the `backend` directory with the following content:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=property_movement

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=30d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # EPC API (Optional - for enhanced EPC data access)
   # Get credentials from https://epc.opendatacommunities.org/
   EPC_API_KEY=your-epc-api-key
   EPC_API_SECRET=your-epc-api-secret
   ```

3. **Set Up PostgreSQL Database**
   
   Create a PostgreSQL database:
   ```bash
   createdb property_movement
   ```
   
   Or using psql:
   ```sql
   CREATE DATABASE property_movement;
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## Database Setup

The backend uses TypeORM with PostgreSQL. In development mode, TypeORM will automatically synchronize the database schema. For production, use migrations.

### Development (Auto-sync)
- Set `NODE_ENV=development` in `.env`
- TypeORM will automatically create/update tables

### Production (Migrations)
- Set `NODE_ENV=production` in `.env`
- Generate migrations: `npm run migration:generate -- -n MigrationName`
- Run migrations: `npm run migration:run`

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User (with token)
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.ts  # Database connection
│   ├── entities/        # TypeORM entities
│   │   ├── User.ts
│   │   ├── Property.ts
│   │   ├── Analysis.ts
│   │   ├── Subscription.ts
│   │   ├── DealAudit.ts
│   │   └── Contact.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── properties.ts
│   │   ├── analyses.ts
│   │   ├── subscriptions.ts
│   │   ├── dealAudits.ts
│   │   └── contact.ts
│   ├── utils/           # Utility functions
│   │   └── auth.ts      # JWT and password hashing
│   ├── app.ts           # Express app setup
│   ├── index.ts         # Entry point
│   └── data-source.ts   # TypeORM data source
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

See `README.md` for full API endpoint documentation.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l | grep property_movement`

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 3001

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` configuration

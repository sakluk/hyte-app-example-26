# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run in development mode (auto-restarts on file changes)
npm run dev

# Run in production mode
npm start

# Lint
npx eslint .

# Format with Prettier
npx prettier --write .
```

No automated test suite is configured (`npm test` exits with an error). Manual API testing is done via the REST Client extension in VS Code using [test/test-requests.http](test/test-requests.http).

## Environment Setup

Copy `.env.sample` to `.env` and fill in values:

```
DB_HOST=localhost
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
```

Initialize the MySQL database using [db/health-diary-db.sql](db/health-diary-db.sql) (requires root). A dump with existing data is in [db/health-diary-dump.sql](db/health-diary-dump.sql).

## Architecture

This is an Express.js REST API (ES modules, Node.js) backed by MySQL. The layered structure is:

**Route → Controller → Model**

- **Routes** ([src/routes/](src/routes/)): Define endpoints, apply `express-validator` validation chains, and call `validationErrorHandler` before the controller.
- **Controllers** ([src/controllers/](src/controllers/)): Handle request/response logic, call model functions, do password hashing (bcryptjs) and JWT signing/verification.
- **Models** ([src/models/](src/models/)): Execute SQL queries via the shared `promisePool` from [src/utils/database.js](src/utils/database.js).

**Key middleware** ([src/middlewares/](src/middlewares/)):
- `authenticateToken` — verifies JWT from `Authorization: Bearer <token>` header; attaches decoded payload to `req.user`.
- `validationErrorHandler` — must be placed after `express-validator` chains in the route definition; formats errors and passes them to the error handler.
- `errorHandler` / `notFoundHandler` — registered last in [src/index.js](src/index.js); `errorHandler` reads `err.status`, `err.message`, and `err.errors`.

**Database**: MySQL connection pool is a singleton exported from `src/utils/database.js`. All model functions use `promisePool.query()` or `promisePool.execute()` (use `execute` for parameterized queries to prevent SQL injection).

**Auth flow**: `POST /api/users/login` returns a JWT; protected routes require the token. `GET /api/users/me` returns the payload decoded from the token (no DB hit).

**Static frontend**: served from [public/](public/) at `/`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | required | List all users |
| POST | `/api/users` | — | Register new user |
| POST | `/api/users/login` | — | Login, returns JWT |
| GET | `/api/users/me` | required | Current user info from token |
| GET | `/api/entries` | required | List entries for token user |
| POST | `/api/entries` | required | Add diary entry |
| GET | `/api/entries/:id` | — | Get entry by id |
| DELETE | `/api/entries/:id` | required | Delete entry |
| GET/POST/PUT/DELETE | `/api/items` | — | Dummy in-memory items resource |

## Database Schema

Main tables in the `HealthDiary` database: `Users`, `DiaryEntries`, `Medications`, `Exercises`. `DiaryEntries` has a `user_id` FK to `Users`. User levels: `regular`, `admin`.

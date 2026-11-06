# Salla

Salla is a web-based business management and SaaS workspace built as a single repository with a Next.js frontend and a NestJS API. The application brings ERP workflows, company and user management, subscription-related screens, and website administration pages into one workspace.

> **Project note:** This README describes the code included in this repository. A menu or screen does not necessarily mean that every related business workflow, payment provider, integration, or production control is complete. Review and test each module before using it in production.

## Overview

Salla is intended to provide a central workspace for businesses to manage day-to-day operations and for platform operators to manage SaaS-related functions.

### Main capabilities in the project

- **Authentication and workspace access:** login, user profiles, company records, and company-related access.
- **Products and inventory:** product and category management, brands, units, warehouses, stock counts, stock adjustments, transfers, and inventory reports.
- **Sales and POS:** sales, quotations, returns, gift cards, coupons, delivery-related screens, cash register, and POS pages.
- **Purchasing:** purchase records, purchase returns, landed-cost and import screens, and supplier records.
- **Customers and suppliers:** customer, supplier, biller, and sales-agent management.
- **Accounting and finance:** chart of accounts, general ledger, payment accounts, money transfers, trial balance, balance sheet, cash-flow and profit-and-loss pages, expenses, and income pages.
- **People and operations:** HRM pages for employees, attendance, leave, payroll, departments, designations, shifts, holidays, and overtime.
- **Business modules:** CRM, projects and tasks, manufacturing, restaurant, gym, repair/service jobs, booking, e-commerce administration, AdTech, and social-commerce pages.
- **Reports:** sales, purchases, stock, payments, customers, suppliers, tax, profitability, and related operational reports.
- **SaaS and add-ons:** subscription-plan data models and an Addons page under `/saas/addons`.
- **Website administration:** a Website area at `/website` with section pages for managing the public-site content structure.
- **Integrations and compliance screens:** WhatsApp settings/messaging and e-invoicing configuration screens.

The backend currently exposes API modules for authentication, companies, users, products, projects, warehouses, customers, suppliers, billers, sales agents, WhatsApp settings, and e-invoicing. See the controllers under `backend/src/` for the exact API surface.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router) |
| Frontend language | TypeScript |
| UI library | React 19 |
| Icons | lucide-react |
| Backend framework | NestJS 10 |
| Backend runtime | Node.js |
| Backend language | TypeScript |
| Database | PostgreSQL |
| ORM / database client | Prisma 6 |
| API documentation | Swagger / OpenAPI (`/docs`) |
| Validation | NestJS `ValidationPipe` and `class-validator` |
| Security middleware | Helmet |
| Development process runner | concurrently |

## Server and development requirements

### Recommended local environment

- Windows 10/11, macOS, or Linux.
- Node.js **20.11 or newer**; Node.js 22 LTS is recommended.
- npm **10 or newer**.
- PostgreSQL server installed and running. The default local configuration uses database name `salepro`, user `postgres`, host `localhost`, and port `5432`.
- At least 4 GB RAM; 8 GB recommended for comfortable local development.
- Approximately 2 GB or more of free disk space for dependencies, build output, and local database files.
- VS Code or another editor is optional.

The API and frontend run as separate development processes:

| Service | Default local address |
|---|---|
| Next.js frontend | `http://localhost:3001` |
| NestJS API base | `http://localhost:4001/api/v1` |
| Swagger API documentation | `http://localhost:4001/docs` |
| PostgreSQL | `localhost:5432` |

## Installation and running the project

### 1. Install prerequisites

Install Node.js and PostgreSQL, then make sure the PostgreSQL service is running. Verify Node.js and npm in PowerShell or a terminal:

```powershell
node -v
npm -v
```

### 2. Extract the project and open its root folder

Extract the ZIP archive. Open a terminal in the folder that contains the root `package.json` file (the `owp` directory in the supplied archive).

Example PowerShell command (adjust the path to your own extraction location):

```powershell
cd F:\projects\owp
```

### 3. Configure the environment

The first setup command creates missing environment files from the examples:

- `.env.example` → `.env`
- `.env` → `backend/.env` (only if `backend/.env` does not already exist)
- `frontend/.env.local` is created with the frontend API URL if it does not already exist.

The default root `.env.example` values are:

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salepro?schema=public"
API_PORT=4001
FRONTEND_URL=http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
JWT_ACCESS_SECRET="REPLACE_WITH_RANDOM_SECRET_32_CHARS_MIN"
JWT_REFRESH_SECRET="REPLACE_WITH_DIFFERENT_RANDOM_SECRET_32_CHARS_MIN"
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
REDIS_URL=redis://localhost:6379
```

Edit `.env` to match your PostgreSQL username, password, host, port, and database. Use long, unique random JWT secrets. Keep `.env` files private and never commit production credentials. If you change `.env` after the first setup, also update `backend/.env` so Prisma and the API use the same database connection and secrets. Update `frontend/.env.local` if the API URL changes.

### 4. Install dependencies and run initial setup

From the project root:

```powershell
npm run install:all
```

This command installs the npm workspaces and runs `scripts/setup.mjs`. The setup script:

1. Creates missing environment files without overwriting existing ones.
2. Checks the PostgreSQL server and creates the configured database if it does not exist (the database user must have permission to create databases).
3. Generates Prisma Client.
4. If the target database has no application tables, creates the schema with `prisma db push` and runs the demo seed.
5. If application tables already exist, skips automatic schema synchronization and demo seeding to reduce the risk of changing existing data.

### 5. Start the application

```powershell
npm run dev
```

Open the frontend at:

- **Salla workspace:** `http://localhost:3001`
- **Login:** `http://localhost:3001/login`
- **Website management:** `http://localhost:3001/website`
- **SaaS Addons page:** `http://localhost:3001/saas/addons`

The public homepage is served by the Next.js app at `/`. The repository's Next.js configuration is currently a standard app configuration; custom production host-based routing for separate domains must be configured at deployment time if required.

## Useful npm commands

Run these from the repository root:

| Command | Purpose |
|---|---|
| `npm run install:all` | Install workspaces and run safe initial database setup |
| `npm run dev` | Start API and frontend together |
| `npm run dev:api` | Start the NestJS API only |
| `npm run dev:web` | Start the Next.js frontend only |
| `npm run db:setup` | Run the database setup script |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Apply the Prisma schema to the configured database |
| `npm run db:seed` | Run the demo seed script |
| `npm run build` | Build backend and frontend |

### Database safety

**Back up your database before applying schema changes.** `npm run db:push` can change database structure. The setup script deliberately skips automatic `db push` and demo seeding when it detects existing application tables. Do not drop, reset, or overwrite a database containing business data. For production, establish and review Prisma migrations and use a controlled migration deployment process rather than relying on `db push`.

## Demo login accounts

The seed data is intended for local development only. When the setup script seeds a brand-new empty database, the demo accounts documented in the seed configuration can be used. The repository's original demo credentials are:

| Email | Role / purpose |
|---|---|
| `owner@myexample.com` | Owner of the demo companies |
| `company@example.com` | Company One administrator |
| `company@example1.com` | Company Two administrator |
| `companyuser@example.com` | Company One staff user |
| `companyuser@example1.com` | Company Two staff user |

Demo password: `password` (local development only). These accounts may not be present when setup skips seeding for an existing database. Change or remove demo credentials before any shared or production deployment.

## Project structure

```text
owp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── projects/
│   │   ├── suppliers/
│   │   ├── billers/
│   │   ├── sale-agents/
│   │   ├── warehouses/
│   │   ├── whatsapp/
│   │   └── e-invoicing/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/       # Next.js routes and pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── scripts/
│   └── setup.mjs
├── .env.example
├── package.json
└── README.md
```

## Troubleshooting

### PostgreSQL connection or authentication error

- Confirm the PostgreSQL service is running.
- Confirm the host and port in `DATABASE_URL` are correct.
- Confirm the database username and password are valid.
- Confirm the PostgreSQL role can connect to the server and create the database if it does not already exist.
- Ensure root `.env` and `backend/.env` contain the intended `DATABASE_URL`.

### Prisma Client or generation error

Run from the project root:

```powershell
npm run db:generate
```

If a Windows Prisma engine file is locked, stop other running Node.js processes, close any running development server, and retry.

### Frontend cannot reach the API

Check that the API is running on port `4001`, and that `frontend/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
```

Restart the frontend after changing environment variables.

### Port already in use

Stop the process already using port `3001` or `4001`, or update the relevant port configuration and frontend API URL consistently.

## Production deployment and security

This repository should be treated as a development foundation until the required workflows have been reviewed, implemented, and tested for your business. Before production deployment:

- Replace all sample secrets and credentials; store secrets in the hosting provider's secret manager.
- Configure HTTPS, production CORS origins, secure cookies/tokens, rate limiting, logging, monitoring, and backups.
- Review authentication and authorization on every API route. Enforce company/tenant ownership on every company-scoped operation.
- Review payment, accounting, inventory, POS, subscription, and country-specific tax/e-invoicing workflows end to end.
- Configure and test email, payment providers, WhatsApp, storage, and any other external integrations you intend to use.
- Create and test database migrations; take verified backups before releases.
- Run the production build and automated tests in the target deployment environment.

## License

No license terms are specified in this repository. Add a `LICENSE` file before distributing the project if you intend to grant reuse rights.

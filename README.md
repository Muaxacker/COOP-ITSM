# BankCare — Banking Service Request & Complaint Management System

> Academic internship project — banking environment prototype.  
> **Not connected to real banking infrastructure or real customer data.**

---

## Problem Statement

Customer complaints and service requests in a banking environment can get lost, delayed, or forgotten when handled through fragmented manual channels (phone, paper, email). There is no single place where customers can track their request, officers can see their workload, or managers can monitor resolution rates and overdue cases.

## Solution

BankCare is a centralized service request and complaint management platform that creates a transparent, accountable workflow from the moment a customer submits a request to the moment it is resolved and confirmed.

**The core value:** *This system prevents customer requests from getting lost, forgotten, or delayed.*

---

## Core Features

| Feature | Description |
|---|---|
| **Centralized Request Center** | Customers submit requests in a structured multi-step form with category selection |
| **Smart Rule-Based Assignment** | Requests are automatically routed to the responsible department and assigned to the least-loaded officer |
| **Case Tracking & Activity Timeline** | Every action is logged with who did what and when — full audit trail |
| **Service Deadline Monitoring** | Each category has a configured deadline; overdue cases surface automatically to managers |
| **Resolution & Customer Feedback** | Officers resolve cases; customers confirm or reopen; 5-star feedback collected |

---

## User Roles

| Role | Access |
|---|---|
| **Customer** | Submit requests, track status, confirm resolution, submit feedback |
| **Officer** | Review, assign, investigate, resolve, add notes, escalate cases |
| **Manager** | Monitor all requests, view overdue/escalated cases, reassign, view KPIs |
| **Admin** | Manage users, configure service categories and deadlines |

---

## Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS (design system)
- React Router v6 (routing)
- TanStack Query (server state)
- Axios (HTTP client)
- react-hot-toast (notifications)

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL 16
- JWT + bcryptjs (authentication)
- Zod (validation)
- Helmet + CORS (security)
- node-cron (deadline monitoring)

---

## Request Workflow

```
Customer submits request
        ↓
Category → Department → Officer Auto-Assignment
        ↓
NEW → REVIEWED → ASSIGNED → INVESTIGATING → RESOLVED → CLOSED
        ↓                        ↓
     (OVERDUE if deadline      ESCALATED → Manager
      passes at any stage)         ↓
                               RESOLVED
        ↑
  REOPENED (if customer rejects resolution)
```

---

## Database Schema

- **User** — id, name, email, passwordHash, role, departmentId, isActive
- **Department** — id, name, description
- **ServiceCategory** — id, name, departmentId, defaultDeadlineHours, defaultPriority
- **ServiceRequest** — id, requestNumber (SR-YYYY-XXXXX), customerId, categoryId, assignedOfficerId, title, description, priority, status, deadline
- **RequestActivity** — id, requestId, userId, action, description, isCustomerVisible
- **Notification** — id, userId, requestId, title, message, type, isRead
- **Feedback** — id, requestId, customerId, rating (1–5), comment

---

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (or Docker)

### Local Development

```bash
# 1. Clone / navigate to project
cd bankcare

# 2. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Create the database (PostgreSQL must be running)
bash setup-db.sh

# 4. Install dependencies
cd server && npm install
cd ../client && npm install

# 5. Run database migrations
cd server
DATABASE_URL="..." npx prisma migrate dev

# 6. Seed demo data
DATABASE_URL="..." npm run db:seed

# 7. Start the backend (port 5000)
cd server && npm run dev

# 8. Start the frontend (port 3000) — in a new terminal
cd client && npm run dev
```

Open http://localhost:3000

### With Docker

```bash
cp .env.example .env
# Edit .env — set a strong JWT_SECRET

docker compose up --build
```

Open http://localhost

The database will be migrated automatically on first start.  
To seed demo data after Docker startup:
```bash
docker exec bankcare-server npx prisma db seed
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret (keep strong!) | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Backend port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## Demo Accounts

> Password for all demo accounts: **`Password123!`**

| Role | Email |
|---|---|
| Customer | ahmed@bankcare.demo |
| Officer | sara@bankcare.demo |
| Officer | khalid@bankcare.demo |
| Manager | fatima@bankcare.demo |
| Admin | admin@bankcare.demo |

The seed script creates **15 realistic requests** across all statuses including overdue, escalated, resolved, and closed cases — so dashboards show realistic data on first login.

---

## API Overview

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/dashboard/customer
GET    /api/dashboard/officer
GET    /api/dashboard/manager

GET    /api/requests
POST   /api/requests
GET    /api/requests/:id
POST   /api/requests/:id/review
POST   /api/requests/:id/assign
POST   /api/requests/:id/start
POST   /api/requests/:id/note
POST   /api/requests/:id/escalate
POST   /api/requests/:id/resolve
POST   /api/requests/:id/reopen
POST   /api/requests/:id/close
POST   /api/requests/:id/feedback

GET    /api/notifications
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read

GET    /api/users
POST   /api/users
PATCH  /api/users/:id
PATCH  /api/users/:id/status

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id

GET    /api/departments
```

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with HTTP Authorization header
- Role-Based Access Control enforced on every API endpoint (not just frontend)
- Resource ownership checks (customers cannot access other customers' requests)
- Input validation on all endpoints via Zod
- Parameterized queries via Prisma (no SQL injection)
- Helmet for HTTP security headers
- CORS configured to frontend origin only
- Login rate limiting (20 requests per 15 minutes)
- No secrets committed to repository

---

## Deadline Monitoring

Each service category has a `defaultDeadlineHours` value. When a request is created:

```
deadline = createdAt + category.defaultDeadlineHours
```

Deadline status is calculated dynamically:
- 🟢 **On Track** — more than 25% time remaining
- 🟡 **Approaching** — 25% or less remaining
- 🔴 **Overdue** — deadline passed

A background job (node-cron) runs every 5 minutes to mark overdue requests and notify the assigned officer and managers.

**Demo deadline values** (configurable by Admin):
| Category | Deadline |
|---|---|
| ATM Services | 8 hours |
| Card Services | 12 hours |
| Mobile Banking | 24 hours |
| Transfer Issues | 24 hours |
| Account Services | 48 hours |
| General Complaint | 48 hours |

*These are demo values. Actual banking service deadlines would be configured per institutional policy.*

---

## Future Improvements

- Email / SMS notifications
- File attachments on requests
- Branch-level filtering for multi-branch banks
- Officer performance reports
- Excel/PDF export
- Real-time updates via WebSockets
- Mobile application
- Integration with core banking APIs (out of scope for MVP)

---

## Important Disclaimer

This is an **academic prototype** built as a university internship project. It:
- Does not connect to real banking infrastructure
- Does not process real financial transactions
- Uses only fake/demo data
- Should not be deployed to production without a full security audit

---

*Built with React, Express, Prisma, and PostgreSQL.*

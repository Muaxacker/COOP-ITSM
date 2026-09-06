# COOP-ITSM — IT Service Request & Incident Management System

**Cooperative Bank of Oromia (COOP Bank)**  
*Centralized IT Infrastructure, Branch Problem Reporting, and Technical Incident Resolution Platform*

---

## 🎯 Problem Statement & Background

Commercial bank branches depend heavily on diverse IT infrastructure:
- Automatic Teller Machines (ATMs)
- Core Banking Applications & Transaction Gateways
- Network Infrastructure (LAN, WAN, VPN, Telecom links)
- Hardware, Workstations, Receipt & Passbook Printers

When branch staff experience technical failures (such as card reader jams, ATM cash dispenser hardware faults, database connection timeouts, switch port dropouts, or computer malware infections), support requests often get delayed or lost when handled through informal phone calls or messaging.

**COOP-ITSM** centralizes problem reporting, technician workload assignment, step-by-step diagnostic logging, resolution verification, and SLA deadline tracking across all bank branches.

---

## 🏛️ IT Technical Divisions

Directly modeled from COOP Bank operational infrastructure:

| Division Code | Division Name | Scope of Problems |
|---|---|---|
| **ATM** | ATM Support Division | Cash dispenser faults, card reader jams, ATM network offline, receipt printer failures, vault lock sensor errors |
| **APPLICATION** | Application Support Division | Core banking transaction timeouts, user account lockouts, mobile banking sync, report export crashes |
| **NETWORKING** | Network & Telecom Division | Branch WAN disconnection, router interface flaps, VPN tunnel failures, branch switch PoE drops |
| **MAINTENANCE** | Hardware & Maintenance Division | Teller PC motherboard failures, passbook printer head damage, UPS battery failures, malware disinfection |

---

## 👥 User Roles & Access Control

| Role | Portal / Responsibility | Key Capabilities |
|---|---|---|
| **BRANCH_USER** | Branch Portal | Reports IT incidents, filters by division, tracks ticket status in real-time, responds to technician info requests, and **verifies resolution** ("Problem Solved" or "Problem Still Exists"). |
| **IT_SUPERVISOR** | Supervisor Operations Desk | Reviews unassigned branch tickets, assesses priority/category, assigns tickets to technicians based on workload, and views operational analytics. |
| **TECHNICIAN** | Technician Workbench | Views assigned queue, begins investigations, records **Troubleshooting Logs** (Action, Observation, Result), requests branch clarification, and submits formal resolutions. |
| **ADMIN** | System Administration | Manages user accounts, configures bank branch directory, manages IT divisions, and sets SLA response deadlines. |

---

## 🔄 Incident Lifecycle & Resolution Loop

```
Branch Staff Submits Incident (INC-YYYY-XXXXX)
                     ↓
        STATUS: OPEN (Priority & Category set)
                     ↓
IT Supervisor Reviews & Assigns to Technician (Least active workload)
                     ↓
             STATUS: ASSIGNED
                     ↓
Technician Begins Diagnostic Investigation
                     ↓
            STATUS: IN_PROGRESS
           ├── Request More Info ──→ STATUS: WAITING_FOR_INFO
           │                             ↓ (Branch responds)
           │                        STATUS: IN_PROGRESS
           └── Step-by-Step Diagnostic Logs:
               • Action Taken
               • Technical Observation
               • Result / Finding
                     ↓
Technician Submits Resolution (Root Cause + Fix Summary)
                     ↓
             STATUS: RESOLVED
                     ↓
Branch User Resolution Verification:
   ├── Confirms "Problem Solved"  ──→ STATUS: CLOSED
   └── Rejects "Problem Exists"   ──→ STATUS: REOPENED (Returns to In-Progress)
```

---

## ⚡ Key Technical Features

1. **Step-by-Step Troubleshooting Logs**:
   Technicians document diagnostic steps (`action`, `observation`, `result`, timestamp, technician name). An interactive visual timeline displays these diagnostic logs for supervisors, branches, and auditors.

2. **Branch Resolution Verification**:
   When a technician marks an incident resolved, branch staff must verify whether the machine/system is genuinely functional. If confirmed, the ticket transitions to `CLOSED`. If rejected, it transitions to `REOPENED` with feedback explaining the ongoing symptoms.

3. **Automated SLA Breach Monitor**:
   Background cron scheduler runs every 5 minutes (`server/src/server.ts`), checking SLA deadlines against real-time timestamps and flagging breached incidents automatically with in-app alerts.

4. **Realistic Demo Data**:
   Populated with 8 actual Ethiopian branches (Hawassa, Bole, Finfinnee, Jimma, Adama, Shashemene, Nekemte, Dire Dawa), 20 diagnostic incident categories, and 10 pre-configured accounts.

---

## 🔑 Pre-Configured Demo Credentials

All demo accounts use the standard password: **`Password123!`**

| Role | Account Name | Email | Division / Branch |
|---|---|---|---|
| **Branch User** | Hawassa Branch Teller | `teller.hawassa@coopbank.et` | Hawassa Central Branch |
| **Branch User** | Bole Branch Operations | `bole.ops@coopbank.et` | Bole Branch (Finfinnee) |
| **Branch User** | Finfinnee Main Teller | `finfinnee.teller@coopbank.et` | Finfinnee Main Branch |
| **IT Supervisor** | IT Support Supervisor | `supervisor@coopbank.et` | Central IT Support Desk |
| **Technician** | ATM Field Engineer | `tech.atm@coopbank.et` | ATM Division |
| **Technician** | Application Analyst | `tech.app@coopbank.et` | Application Division |
| **Technician** | Networking Specialist | `tech.network@coopbank.et` | Networking Division |
| **Technician** | Hardware Support Tech | `tech.hardware@coopbank.et` | Maintenance Division |
| **Administrator** | System Administrator | `admin@coopbank.et` | IT Operations HQ |

*Quick login buttons for all roles are available directly on the login screen.*

---

## 🚀 Quick Start Guide

### 1. Database Setup (Docker Postgres)
```bash
# Start PostgreSQL container on port 5435
docker compose up -d postgres
```

### 2. Backend Setup & Seed
```bash
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run build
npm start   # Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run build
npm run dev   # Runs on http://localhost:3003
```

### Root Scripts
From the repository root (`COOP-ITSM/`):
```bash
npm run build         # Builds both server and client
npm run dev:server    # Starts backend in dev mode
npm run dev:client    # Starts frontend in dev mode
```

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL 16, JWT, Bcrypt, Zod, node-cron
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, Lucide Icons, React Router v6, react-hot-toast
- **Infrastructure**: Docker Compose, PostgreSQL Container

# EazyMoveApp

**EazyMoveApp** is a delivery management web application built as a final project for a university Database Systems course. The focus is on modeling and implementing the core workflows of a delivery platform — managing customers, orders, drivers, and delivery status — using a relational database backend and a Next.js/TypeScript frontend.

> This is an academic project. Authentication is handled locally (no external services), and delivery cost is calculated mathematically based on stored distance data — not live GPS.

---

## Features

- **Account System** — Customer registration and login with password hashing. Sessions are managed via Next.js middleware. No external auth provider; credentials are stored and validated against the local database.
- **Order Management** — Create and track delivery orders with metadata including addresses, timestamps, pricing, and status.
- **Driver Assignment** — Assign drivers/riders to orders and update delivery state: `pending → in progress → delivered / cancelled`.
- **Cost Calculation** — Shipping price is computed from a mathematical formula using pre-stored distance values between locations and vehicle type parameters. No GPS or mapping API involved.
- **Admin Views** — Inspect entities (customers, drivers, orders) to demonstrate the underlying relational schema.
- **Clean UI** — Responsive interface built with Tailwind CSS and shadcn/ui components.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Auth | Local DB + password encryption (no OAuth) |
| Distance/Cost | Mathematical calculation (no GPS/Maps API) |
| Runtime | Node.js / npm |
| Linting | ESLint, TypeScript strict config |

---

## Project Structure

```
EazyMoveApp/
├── src/
│   ├── app/          # Next.js routes and page layouts
│   ├── lib/          # Utility functions, cost calculation logic
│   └── db/           # Database schema, queries, and access layer
├── components/
│   └── ui/           # shadcn/ui primitives and shared components
├── public/           # Static assets
├── middleware.ts     # Session and routing middleware
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Design

This project was built to demonstrate relational database concepts, including:

- Normalized schema across entities: `Customers`, `Drivers`, `Orders`, `Transactions`
- Foreign key relationships and referential integrity
- Password encryption for stored credentials
- Pre-computed distance table used for cost calculation queries

---

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- npm

### Installation

```bash
git clone https://github.com/Zylocope/EazyMoveApp.git
cd EazyMoveApp
npm install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Course Context

Built for a **Database Systems** university course. The goal was to design and implement a realistic relational schema, write meaningful queries, and integrate the database with a working web frontend — not to build a production-ready logistics platform.

---

## Author

**La Min Oo** — [github.com/Zylocope](https://github.com/Zylocope)

<p align="center">
  <img src="src/img/logowhite.png" alt="Myggdrasil Logo" width="180" />
</p>

# Myggdrasil

[![Node.js](https://img.shields.io/badge/Node.js-20.x-%2343853D)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-9.x-%23E0234E)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-%2361DAFB)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-%23007AB9)](https://www.mysql.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-%23F55036)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-%23000000)](LICENSE)

**Myggdrasil is a full-stack decision journal that turns choices into a navigable tree of context, consequences, and reflection — with an AI layer that reads your own history back to you.**

Live at **[myggdrasilmuseumofdecisions.vercel.app](https://myggdrasilmuseumofdecisions.vercel.app)** · Backend on Render · MySQL on Aiven.

## Product Snapshot

Myggdrasil helps people record meaningful decisions, connect them as parent → child relationships, and revisit the path that led them forward. It is not a task manager, calendar, or social feed — it's a personal decision map built for reflection, clarity, and long-term context.

## Why It Matters

Most tools tell you what happened. Myggdrasil is built to help answer:

- What led to this decision?
- What did it lead to next?
- Which themes repeat across my path?
- Which choices were useful, and which categories deserve more attention?

The AI analyzer takes a first pass at those questions directly — reading the decision graph and returning a personal, second-person analysis instead of a generic summary.

## What It Does

**Core**
- Secure signup and login with HttpOnly cookie sessions, JWT signed with RS256
- Decision CRUD with categorization — including **custom, user-owned decision types** created inline (not just the built-in defaults)
- Parent/child relationships between decisions, with protection against self-links and duplicate links
- Ownership-aware access control on every resource

**Exploring the tree**
- Debounced real-time search by decision name
- Drag-and-drop: drop one decision card onto another to link them instantly, no dialog needed
- Two ways to view the tree: chronological list, or an auto-laid-out **visual graph** with parent → child edges
- Hub dashboard with decision counts, relationship counts, and top categories at a glance
- Keyboard shortcuts (`Cmd/Ctrl+K` to search, `N` for a new decision)
- Export the current tree to PDF straight from the browser's print pipeline

**AI analyzer**
- Groq-backed analysis (free tier, no billing friction) that identifies your most impactful decisions, which ones produced the best downstream consequences, concrete next steps, and which categories need more attention
- Written in second person, like a mentor who already knows your history — not a generic report
- Results are cached per user against a hash of the decision graph, so re-opening the analyzer doesn't burn API quota unless something actually changed
- Falls back to a local, rule-based analysis if the AI call fails, so the feature never fully breaks

**Account**
- Profile management (name, email, birth date)
- Password change with a live strength checklist, and a show/hide toggle on every password field
- Account deletion with password confirmation

> **Note on Kafka/email:** an earlier version of this project used Kafka for an async
> welcome-email flow. It was removed for the free-tier deployment — see
> [`docs/kafka-email-removal.md`](docs/kafka-email-removal.md) for the full reasoning.
> Password recovery for logged-out users is intentionally out of scope until an
> email channel is reintroduced; changing your password while logged in is fully
> supported today.

## Tech Stack

- **Backend:** Node.js, NestJS, TypeScript, TypeORM, MySQL
- **AI:** Groq API (free tier) for decision-history analysis, with a local rule-based fallback and per-user result caching
- **Frontend:** React, Vite, wouter, Framer Motion, Tailwind, shadcn/ui-based components
- **Infra:** Docker (backend build), Render (backend hosting), Vercel (frontend hosting), Aiven (managed MySQL, free tier)

## System Model

```text
user               — account credentials and profile
event              — recorded decisions / actions
event_type         — decision categories (built-in defaults + per-user custom types)
event_relationship — parent-child links between decisions
analysis_cache      — cached AI analysis per user, invalidated by a hash of the decision graph
```

This model supports a flexible decision tree, where each choice can branch into multiple outcomes and multiple predecessors.

## Repo Structure

```text
src/
  auth/
  users/
  database/
    entities/
  event/
  event-relationship/
  analysis/
  utils/
  app.module.ts
  main.ts
frontend/
  client/
    src/
docs/
  kafka-email-removal.md
migrations/
```

## Setup

Create a `.env` file in the project root:

```env
MYSQLHOST=host
MYSQLPORT=1111
MYSQLUSER=your_user
MYSQLPASSWORD=your_password
BDNAME=project
PORT=11111

JWT_PRIVATE_KEY=./private.key
JWT_PUBLIC_KEY=./public.key

# Set MYSQL_SSL=true when connecting to a managed DB (e.g. Aiven) that requires TLS
MYSQL_SSL=false

# Free at console.groq.com/keys
GROQ_API_KEY=your_groq_key

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Generate RSA keys:

```bash
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

Run the SQL files in `migrations/` against your database before starting the app for the first time.

## Run Locally

**Backend**

```bash
npm install
npm run start:dev
```

**Frontend**

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173. In development, the frontend proxies `/api` to the backend at `http://localhost:3000`.

## Deployment

- **Frontend (Vercel):** Root Directory `frontend`, Output Directory `dist/public`, env var `VITE_API_URL` pointing at the backend.
- **Backend (Render):** Docker web service built from the root `Dockerfile`; `/healthz` as the health check path; env vars mirror the `.env` above with `NODE_ENV=production` and `MYSQL_SSL=true`.
- **Database (Aiven):** free-tier managed MySQL; TLS required, no CA pinning needed for the current setup.

CORS is locked to a single `FRONTEND_URL` origin, and the auth cookie is set with `sameSite: "none"` and `secure: true` in production so it survives the cross-domain hop between Vercel and Render.

## API Summary

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/user/signup` | Register a new user | Public |
| GET | `/user/profile` | Get the current user | Protected |
| PUT | `/user/profile/update` | Update name/email/birth date | Protected |
| PUT | `/user/profile/password` | Change password | Protected |
| DELETE | `/user/profile/delete` | Delete account | Protected |
| POST | `/auth/login` | Request a JWT and set the auth cookie | Public |
| GET | `/auth/me` | Get the current user from the cookie session | Protected |
| POST | `/auth/logout` | Clear the auth cookie | Public |
| GET | `/events` | List the signed-in user's decisions | Protected |
| POST | `/events` | Create a new decision | Protected |
| PUT | `/events/:id` | Update a decision | Protected |
| DELETE | `/events/:id` | Delete a decision | Protected |
| GET | `/event-types` | List default + user-owned decision types | Protected |
| POST | `/event-types` | Create a custom decision type | Protected |
| PUT / DELETE | `/event-types/:id` | Update/delete a custom decision type (own types only) | Protected |
| POST | `/event-relationships` | Link two decisions as parent and child | Protected |
| GET | `/event-relationships` | List all relationships for the current user | Protected |
| GET | `/events/:id/relationships` | List relationships for a single decision | Protected |
| DELETE | `/event-relationships/:id` | Remove a relationship | Protected |
| GET | `/analysis` | Run (or fetch cached) AI analysis of the decision graph | Protected |
| GET | `/healthz` | Health check | Public |

## Authentication Model

- Login sets an HttpOnly cookie named `mg_token` containing the JWT.
- The frontend includes cookies on every API request (`withCredentials: true`).
- `GET /auth/me` restores the session from the cookie.
- `POST /auth/logout` clears the session.
- In production, `NODE_ENV=production` marks the cookie `secure` and `sameSite: "none"`, required for the frontend and backend living on different domains.

## Security Highlights

- Passwords hashed with **bcrypt**
- JWT signed with **RS256**
- Protected routes guarded globally by an authentication middleware, with an explicit `@SkipAuth()` opt-out for public routes
- Input validation via **class-validator**, including enforced password strength on signup and password change
- Relationship creation blocks self-referencing decisions and duplicate direct links
- CORS restricted to a single known frontend origin

## Roadmap

- [x] Auth and signup/login
- [x] JWT guard
- [x] Decision CRUD
- [x] Parent/child decision linking
- [x] React frontend connected to the API
- [x] Modern UI refresh aligned with the product brief
- [x] Debounced search
- [x] Drag-and-drop relationship creation
- [x] Hub statistics dashboard
- [x] AI analyzer (Groq) with caching and local fallback
- [x] Custom, user-owned decision types
- [x] Visual tree view, PDF export, keyboard shortcuts
- [x] Deployment (Vercel + Render + Aiven)

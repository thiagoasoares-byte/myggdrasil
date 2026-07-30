<p align="center">
  <img src="src/img/logowhite.png" alt="Myggdrasil Logo" width="180" />
</p>

# Myggdrasil

[![Node.js](https://img.shields.io/badge/Node.js-18.x-%2343853D)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-9.x-%23E0234E)](https://nestjs.com/)
[![Kafka](https://img.shields.io/badge/Kafka-Event--driven-%23231F20)](https://kafka.apache.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-%2361DAFB)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-%23007AB9)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-%23000000)](LICENSE)

**Myggdrasil is a full-stack decision journal that turns choices into a navigable tree of context, consequences, and reflection.**

It pairs a NestJS backend with a React + Vite frontend, cookie-based authentication, and a product direction designed to feel calm, editorial, and recruiter-ready.

## Product Snapshot

Myggdrasil helps people record meaningful decisions, connect them as parent/child relationships, and revisit the path that led them forward.

It is not a task manager, calendar, or social feed. It is a personal decision map built for reflection, clarity, and long-term context.

## Why It Matters

Most tools tell you what happened. Myggdrasil is built to help answer:

- What led to this decision?
- What did it lead to next?
- Which themes repeat across my path?
- Which choices were useful, and which deserve a second look?

The result is a more structured way to learn from life decisions over time.

## Current Status

The product is already functional end to end:

- Frontend and backend are connected and working together.
- Users can sign up, log in, manage their profile, and sign out.
- Decisions can be created, updated, deleted, and linked as parent/child relationships.
- The UI already follows a modern dark editorial direction with protected routes, motion, toasts, and a side-panel detail workflow.

## What It Does

- Secure user signup and login with HttpOnly cookie sessions
- JWT authentication with **RS256**
- Decision CRUD with structured categorization
- Parent/child relationships between decisions, with protection against self-links and duplicate links
- Ownership-aware access control
- Kafka-driven welcome/confirmation email flow through a consumer that reacts to signup events
- React frontend for signup, login, profile management, and decision graph navigation

## Product Direction

The interface follows the product brief in [PRODUCT_DOSSIER.md](PRODUCT_DOSSIER.md):

- Calm, reflective, and editorial rather than corporate or task-oriented
- A tree or timeline mental model instead of a generic data table
- Strong visual hierarchy for title, context, category, and status
- Clear empty states that encourage the first meaningful decision
- Accessible interactions on desktop and mobile

## Tech Stack

- **Backend:** Node.js, NestJS, TypeScript, TypeORM, MySQL, Kafka
- **Mail:** Nodemailer with Mailgun, plus SMTP/Ethereal/MailHog fallbacks for development
- **Frontend:** React, Vite, wouter, Framer Motion, utility-first styling, shadcn/ui-based components

## System Model

```text
user               — account credentials and profile
event              — recorded decisions / actions
event_type         — decision categories
event_relationship — parent-child links between decisions
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
  kafka/
  utils/
  app.module.ts
  main.ts
frontend/
  client/
    src/
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
```

Generate RSA keys:

```bash
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

## Run Locally

**Backend**

```bash
npm install
npm run start:dev
npm run build
```

**Frontend**

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173. In development, the frontend proxies `/api` to the backend at `http://localhost:3000`.

## API Summary

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/user/signup` | Register a new user | Public |
| POST | `/auth/login` | Request a JWT and set the auth cookie | Public |
| GET | `/auth/me` | Get the current user from the cookie session | Protected |
| POST | `/auth/logout` | Clear the auth cookie | Public |
| GET | `/events` | List the signed-in user's decisions | Protected |
| POST | `/events` | Create a new decision | Protected |
| PUT | `/events/:id` | Update a decision | Protected |
| DELETE | `/events/:id` | Delete a decision | Protected |
| POST | `/event-relationships` | Link two decisions as parent and child | Protected |
| GET | `/events/:id/relationships` | List relationships for a decision | Protected |
| DELETE | `/event-relationships/:id` | Remove a relationship | Protected |

## Frontend Experience

The `frontend/` app is a React + Vite experience that consumes the backend API directly and is already wired for the main product flow:

- Signup and login with cookie-based sessions (`withCredentials: true`)
- Auth bootstrap via `GET /auth/me` on app load
- Decision list, detail, create, edit, delete, and relationship management
- Modern dark editorial UI with motion, toasts, protected routes, and responsive panels
- Development proxy support plus an environment-driven API URL for production

## Authentication Model

- Login sets an HttpOnly cookie named `mg_token` containing the JWT.
- The frontend includes cookies on API requests through the shared HTTP client.
- `GET /auth/me` restores the session from the cookie.
- `POST /auth/logout` clears the session.

For production, keep `NODE_ENV=production` so the cookie is marked `secure`, and consider adding CSRF protection.

## Security Highlights

- Passwords hashed with **bcrypt**
- JWT signed with **RS256**
- Protected routes guarded by authentication middleware
- Input validation via **class-validator**
- Relationship creation blocks self-referencing decisions and duplicate direct links

## Roadmap

- [x] Auth and signup/login
- [x] JWT guard
- [x] Decision CRUD
- [x] Parent/child decision linking
- [x] React frontend connected to the API
- [x] Modern UI refresh aligned with the product brief
- [ ] Search with debounce to filter decisions by name in real time
- [ ] Drag-and-drop linking between cards without opening a dialog
- [ ] Hub statistics with counters, most-used categories, and AI insights
- [ ] AI analyzer to surface the most beneficial decisions and categories that need more attention
- [ ] Deployment

## Planned Product Updates

The next product steps are focused on making the decision tree faster to explore and more useful as a reflection tool:

1. Search with debounce to keep filtering smooth while users type.
2. Drag-and-drop relationship creation to reduce friction when branching from one decision to another.
3. A small hub dashboard with counts, category trends, and an AI layer that analyzes outcomes, useful decisions, and areas that deserve more attention.

The AI analyzer should eventually highlight which decisions were most beneficial, which ones produced better outcomes, which choices should probably have been different, and which categories need more focus.

## Relationship Notes

The `event-relationship` module currently blocks two specific cases: an event linking to itself, and an exact duplicate parent-child pair. It does not yet traverse the full graph to detect indirect cycles such as A → B → C → A. Full cycle detection remains on the roadmap.

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

**Decisions as a clean, secure backend graph.**

A full-stack app for tracking meaningful decisions, categorizing them, and modeling relationships between events, with a simple React frontend consuming the backend API.

---

## What it does

- Secure user signup and login, with cookie-based session (HttpOnly)
- JWT-based authentication with **RS256**
- Event creation, reading, updating, deleting
- Event types for structured categorization
- Parent/child relationships between events, preventing self-referencing and duplicate links
- Ownership-aware access control
- Event-driven welcome/confirmation email: a Kafka consumer listens for the user-signup event and triggers a transactional email (Nodemailer, with Mailgun as provider and SMTP/Ethereal/MailHog as dev fallbacks)
- React frontend for signup, login, and managing events end to end

---

## Why it matters

Myggdrasil is designed to capture how choices connect over time. Each event can be linked to others, categorized, and owned, enabling a personal decision graph rather than a flat list.

---

## Tech stack

**Backend:** Node.js, NestJS, TypeScript, TypeORM, MySQL, Kafka (event-driven mail trigger)
**Mail:** Nodemailer, with Mailgun as provider (SMTP/Ethereal/MailHog as dev fallbacks)
**Frontend:** React, Vite

---

## System model

```
user               — account credentials and profile
event              — recorded decisions / actions
event_type         — categories for events
event_relationship — parent-child links between events
```

This setup supports multiple parents and children per event, making the dataset flexible and graph-compatible.

---

## Structure overview

```text
src/
  auth/
  users/
  database/
    entities/
  event/
  event-relationship/
  mail/
  utils/
  app.module.ts
  main.ts
frontend/
  src/
```

---

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

---

## Run

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

Open http://localhost:5173. The frontend proxies `/api` to the backend (`http://localhost:3000`).

---

## API summary

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/users/signup` | Register user | Public |
| POST | `/auth/login` | Request JWT (sets HttpOnly cookie) | Public |
| GET | `/auth/me` | Get current user (reads HttpOnly cookie) | Public (reads cookie) |
| POST | `/auth/logout` | Clear auth cookie | Public |
| GET | `/event` | List user events | Protected |
| POST | `/event/create` | Create event | Protected |
| PUT | `/event/update` | Update event | Protected |
| DELETE | `/event/delete` | Delete event | Protected |
| POST | `/event/relationship` | Link two events as parent/child | Protected |
| GET | `/event/:id/relationships` | List relationships for an event | Protected |
| DELETE | `/event/relationship/:id` | Remove a relationship | Protected |

---

## Frontend

The `frontend/` folder holds a React + Vite single-page app that consumes the backend API directly:

- Signup and login forms, using cookie-based session (`withCredentials: true`)
- Loads the current user via `GET /auth/me` on app start
- Lists, creates, updates, and deletes events through the `/event` endpoints
- Lets the user link events together as parent/child relationships via `/event/relationship`

---

## Cookie-based authentication

- Login (`POST /auth/login`) sets an HttpOnly cookie named `mg_token` containing the JWT.
- Client requests include credentials (cookies); the frontend `api` client is configured with `withCredentials: true`.
- Use `GET /auth/me` to fetch the current user from the server (reads the cookie).
- Use `POST /auth/logout` to clear the cookie.

For production, ensure `NODE_ENV=production` so the cookie is marked `secure`, and consider adding CSRF protection.

---

## Security highlights

- Passwords hashed with **bcrypt**
- JWT signed with **RS256**
- Protected routes guarded by JWT auth
- Input validation via **class-validator**
- Relationship creation blocks self-referencing events (`parentId === childId`) and duplicate direct links

---

## Roadmap

- [x] Auth and signup/login
- [x] JWT guard
- [x] Event CRUD
- [x] Event relationship linking (parent/child)
- [x] React frontend (basic)
- [ ] Event type management UI
- [ ] Full cycle detection across multi-hop relationships (currently only self-reference and duplicate direct links are blocked)
- [ ] Deployment

---

## Notes on the relationship graph

The `event-relationship` module currently blocks two specific cases: an event linking to itself, and an exact duplicate parent-child pair. It does **not** yet perform a graph traversal to catch indirect cycles (for example, A → B → C → A). Full cycle detection is on the roadmap.

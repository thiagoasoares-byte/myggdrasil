<p align="center">
  <img src="src/img/logowhite.png" alt="Myggdrasil Logo" width="180" />
</p>

# Myggdrasil

[![Node.js](https://img.shields.io/badge/Node.js-18.x-%2343853D)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-9.x-%23E0234E)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-%23007AB9)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-%23000000)](LICENSE)

**Decisions as a clean, secure backend graph.**

A developer-focused backend for tracking meaningful decisions, categorizing them, and modeling relationships between events.

---

## What it does

- Secure user signup and login
- JWT-based authentication with **RS256**
- Event creation, reading, updating, deleting
- Event types for structured categorization
- Graph-ready event relationships
- Ownership-aware access control

---

## Why it matters

Myggdrasil is designed to capture how choices connect over time. Each event can be linked, categorized, and owned, enabling a personal decision graph rather than a flat list.

---

## Tech stack

- Node.js
- NestJS
- TypeScript
- TypeORM
- MySQL

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
  utils/
  app.module.ts
  main.ts
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

```bash
npm install
npm run start:dev
npm run build
```

---

## API summary

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/users/signup` | Register user | Public |
| POST | `/auth/login` | Request JWT | Public |
| GET | `/auth/me` | Get current user (reads HttpOnly cookie) | Public (reads cookie) |
| POST | `/auth/logout` | Clear auth cookie | Public |
| GET | `/event` | List user events | Protected |
| POST | `/event/create` | Create event | Protected |
| PUT | `/event/update` | Update event | Protected |
| DELETE | `/event/delete` | Delete event | Protected |
```

---

## Cookie-based authentication

- Login (`POST /auth/login`) now sets an HttpOnly cookie named `mg_token` containing the JWT.
- Client requests should include credentials (cookies). The frontend `api` client is configured with `withCredentials: true`.
- Use `GET /auth/me` to fetch the current user from the server (reads the cookie).
- Use `POST /auth/logout` to clear the cookie.

For production, ensure `NODE_ENV=production` so the cookie is marked `secure`, and consider adding CSRF protection.

---

## Frontend (Vite)

- Frontend is in the `frontend/` folder (Vite + React).
- It uses cookie-based auth and calls `/auth/me` to populate the user on app load.
- Start the frontend dev server from the project root:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173. The frontend proxies `/api` to the backend (`http://localhost:3000`).


## Security highlights

- Passwords hashed with **bcrypt**
- JWT signed with **RS256**
- Protected routes guarded by JWT auth
- Input validation via **class-validator**

---

## Roadmap

- [x] Auth and signup/login
- [x] JWT guard
- [ ] Event CRUD
- [ ] Event type management
- [ ] Ownership validation
- [ ] Event relation graph logic
- [ ] React frontend
- [ ] Deployment

---

## LinkedIn-ready highlight

Clean, minimal, backend-first architecture with an elegant white logo presentation. Designed to stand out as a polished project snippet on professional profiles.

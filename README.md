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
| GET | `/event` | List user events | Protected |
| POST | `/event/create` | Create event | Protected |
| PUT | `/event/update` | Update event | Protected |
| DELETE | `/event/delete` | Delete event | Protected |
```

---

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

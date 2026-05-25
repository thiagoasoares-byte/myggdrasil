# 🌳 Myggdrasil

> A personal decision museum — register the important choices in your life and watch how one decision led to another, which led to another.

## What is it?

Myggdrasil is a fullstack application where users register important life decisions — moving to a new city, changing jobs, ending a relationship — and track how they unfold over time. Each decision can connect to others, forming a personal cause-and-effect graph.

The name comes from Norse mythology: the tree that connects all worlds.

## Tech Stack

**Backend**
- Node.js + NestJS
- TypeScript
- TypeORM
- MySQL

**Frontend** *(in development)*
- React
- TypeScript

## Database Architecture

```
user               — user data and credentials
event              — registered decisions/events
event_type         — categories (professional, relationships, personal, quality of life)
event_relationship — parent-child relations between events (N:N graph)
```

The `event_relationship` table solves the multiple-ancestor problem — a decision can have multiple parents and multiple children. Temporal cycle prevention (A caused B, B caused A) is handled in the backend before any insertion.

## Project Structure

```
src/
  auth/
    dto/
    interface/
    auth.controller.ts
    auth.service.ts
    auth.module.ts
  users/
    dto/
    entities/
    users.controller.ts
    users.service.ts
    users.module.ts
  database/
    entities/
    data-source.ts
  utils/
    hash.ts
  app.module.ts
  main.ts
```

## Environment Variables

Create a `.env` file at the root of the project:

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
## Generating RSA Keys

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate public key from private
openssl rsa -in private.key -pubout -out public.key
```

## Running the Project

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Build
npm run build
```

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/users/signup` | Register a new user | Public |
| POST | `/auth/login` | Authenticate and receive JWT | Public |

## Security

- Passwords hashed with **bcrypt** (saltRounds: 10)
- JWT signed with **RS256** (asymmetric RSA key pair)
- Email duplication check returns **409 Conflict**
- Invalid credentials always return **401 Unauthorized** (no email enumeration)
- Input validation via **class-validator**

## Roadmap

- [x] Database architecture and modeling
- [x] NestJS + TypeORM setup
- [x] MySQL local connection
- [x] User entity and DTOs
- [x] POST /signup with bcrypt password hashing
- [x] POST /auth/login with JWT RS256
- [ ] JWT Guard for protected routes
- [ ] Events module (CRUD)
- [ ] Decision graph with cycle detection
- [ ] React frontend
- [ ] Cloud deployment
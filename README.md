# MotoTribe

**India''s motorcycle marketplace and community — built by riders, for riders.**

MotoTribe brings together everything a motorcyclist needs under one roof: a multi-seller marketplace for gear and parts, Reddit-style riding communities, a virtual garage to track your bikes, and tools for organising group rides. Think of it as the love child of Amazon, Reddit, and Strava — but exclusively for the Indian motorcycle scene.

---

## Why This Exists

Every Indian rider knows the pain. You want a crash guard for your Himalayan 450, so you check five different Instagram sellers, three WhatsApp groups, and a couple of shady websites before maybe finding the right part. Then you hop onto a Facebook group to ask if it is any good. Then you open Google Maps to find a mechanic who can fit it.

MotoTribe fixes that. One platform where you can:

- **Shop** for accessories, protection gear, luggage, and spare parts — filtered by your exact bike model and year.
- **Talk** to fellow owners in dedicated communities, upvote helpful answers, and share ride stories.
- **Track** your bikes in a virtual garage with service logs and odometer history.
- **Ride** together by discovering and RSVPing to group rides and meetups near you.

---

## What is Inside

This is a full-stack monorepo with a clear separation between the frontend, backend, database layer, and shared packages.

```
mototribe/
+-- apps/
|   +-- web/          -> Next.js 15 frontend (App Router, React 19)
|   +-- api/          -> NestJS 11 REST API
|
+-- packages/
|   +-- database/     -> Prisma schema, migrations, and seed data
|   +-- contracts/    -> Shared Zod validation schemas
|   +-- types/        -> Shared TypeScript type definitions
|   +-- ui/           -> Reusable UI components and design tokens
|
+-- docker-compose.yml
+-- turbo.json
+-- pnpm-workspace.yaml
```

### The Frontend (apps/web)

The customer-facing app is a Next.js 15 project using the App Router with React 19. It is structured around route groups that map to distinct user experiences:

| Route Group | What It Does |
|---|---|
| `(marketplace)` | Product browsing, search, product detail pages, cart, and checkout flow |
| `(community)` | Community hub, individual community pages with posts and discussions, group rides listing |
| `(garage)` | Virtual garage — add your bikes, log services, track odometer |
| `(seller)` | Seller dashboard — manage products, orders, inventory, shipping, payouts, analytics |
| `(admin)` | Platform admin console — user management, seller approvals, disputes, system settings |
| `(platform)` | Sign in, sign up, user profile |

**Key frontend choices:**
- **State management**: Zustand with localStorage persistence for cart state. React Query for server state.
- **Styling**: Tailwind CSS v4 with a custom design token system (CSS custom properties) supporting dark and light themes.
- **Animations**: Framer Motion for page transitions and micro-interactions.
- **Auth**: Edge middleware (middleware.ts) that verifies JWT cookies and protects routes based on user roles. No client-side auth hacks — the middleware runs at the edge before the page even loads.
- **API communication**: A custom apiClient wrapper with automatic token refresh, retry on 401, and typed responses.

### The Backend (apps/api)

A NestJS 11 application with 30+ feature modules, each following the standard controller -> service -> module pattern. The API is prefixed with /v1 and uses cookie-based JWT authentication.

**Core modules and what they handle:**

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, JWT token pair (access + refresh), cookie management |
| `users` | Profile management, role queries |
| `products` | CRUD for product listings, image management, search, fitment queries |
| `orders` | Multi-seller order creation — a single buyer order splits into per-seller child orders |
| `inventory` | Stock reservation system with TTL-based expiry to prevent overselling |
| `checkout` | Session-based checkout flow with address selection and order finalisation |
| `payments` | Razorpay integration with automatic mock fallback for local development |
| `shipping` | Shiprocket integration with tracking, also mocked locally |
| `community` | Community CRUD, membership, post creation and listing |
| `reviews` | Product review submission and aggregation |
| `chat` | Buyer-to-seller messaging threads |
| `rides` | Group ride creation and RSVP management |
| `garage` | Virtual bike garage, service log tracking |
| `admin` | Platform-wide admin operations |
| `disputes` | Buyer-seller dispute creation and resolution |
| `coupons` | Discount coupon management per seller |
| `returns` | Return request flow with status tracking |
| `payouts` | Seller payout calculation and disbursement |
| `marketing` | Seller marketing campaigns |
| `analytics` | Sales and traffic analytics |
| `roles` | Granular RBAC with permissions |
| `audit` | Audit trail logging via interceptors |
| `outbox` | Transactional outbox pattern for reliable event dispatch |
| `notifications` | In-app notification delivery |
| `blog` | Blog and article management |
| `events` | Motorcycle events and meetups |
| `creators` | Creator profiles and content |

**Infrastructure modules:**
- **BullMQ + Redis**: Background job processing for emails, notifications, and async order operations.
- **Event Emitter**: Synchronous in-process event bus for decoupled module communication.
- **Throttler**: Rate limiting on all endpoints.
- **Helmet + CORS**: Security headers and origin whitelisting.
- **Correlation Middleware**: Request tracing with correlation IDs across the stack.

### The Database (packages/database)

PostgreSQL with Prisma ORM. The schema has 50+ models covering:

- **Users and auth**: Users with roles (Rider, Seller, Admin), addresses, seller approval workflow.
- **Product catalog**: Products with images, categories, tags, SKUs, and a bike fitment matrix that links products to specific bike makes, models, and year ranges.
- **Inventory**: Enterprise-grade stock management — available, reserved, damaged, returned, incoming, and blocked stock tracked separately.
- **Orders**: A multi-seller order architecture. When a buyer places an order containing items from multiple sellers, it creates one parent Order and multiple SellerOrder children, each tracked independently through a full lifecycle (packing -> shipped -> delivered -> return requested -> refunded).
- **Payments**: Payment intents, transaction records, and a double-entry ledger system for financial reconciliation.
- **Community**: Communities with rules, membership roles, posts with upvotes and bookmarks, threaded comments.
- **Garage**: Bike ownership records linked to a standardised make/model catalog, with service logs and odometer tracking.
- **Platform operations**: Audit logs, disputes, commission rules, platform configuration, outbox events.

The seed script (prisma/seed.ts) populates demo data — sample users, products with images, communities, and posts — so you can explore the app immediately after setup.

### Shared Packages

- **packages/contracts**: Zod schemas shared between frontend and backend. Currently covers order creation and Razorpay payment verification. This is where you would add any new request/response validation that needs to stay consistent across the stack.
- **packages/types**: TypeScript type definitions used across apps — UserRole, ProductSummary, BikeSelection, etc.
- **packages/ui**: A small component library with Button, Badge, Card, and SectionHeading. Uses a cn() utility for className merging. The components use the MotoTribe design system colours (that signature orange #ff5c1a).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Monorepo tooling | pnpm workspaces + Turborepo |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| Backend | NestJS 11, Express, Passport JWT |
| Database | PostgreSQL 15, Prisma ORM 6 |
| Cache and Queues | Redis 7, BullMQ |
| Payments | Razorpay (with mock fallback) |
| Shipping | Shiprocket (with mock fallback) |
| Media uploads | Cloudinary |
| Validation | Zod (shared contracts) |
| State management | Zustand (client), React Query (server) |
| Animations | Framer Motion |
| Auth | JWT (access + refresh tokens), httpOnly cookies, Edge middleware |
| CI/CD | GitHub Actions |
| Icons | Lucide React |
| Fonts | Inter (Google Fonts) |

---

## Getting Started

### Prerequisites

You will need these installed on your machine:

- **Node.js** 20+ (tested with v24)
- **pnpm** 9+ (npm install -g pnpm)
- **Docker** and **Docker Compose** (for PostgreSQL and Redis)

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/praveen-kumary/mototribe.git
cd mototribe
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

The defaults work out of the box for local development. The .env.example file has comments explaining every variable. Razorpay, Shiprocket, and Cloudinary keys are optional — the app runs in mock mode without them.

**3. Start the database and cache**

```bash
docker compose up -d
```

This spins up PostgreSQL 15 on port 5432 and Redis 7 on port 6379.

**4. Install dependencies**

```bash
pnpm install
```

**5. Generate the Prisma client and push the schema**

```bash
pnpm db:generate
pnpm db:push
```

**6. Seed demo data (optional but recommended)**

```bash
cd packages/database
pnpm exec ts-node prisma/seed.ts
cd ../..
```

**7. Start the development servers**

```bash
pnpm dev
```

This starts both the Next.js frontend and the NestJS API concurrently via Turborepo.

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/v1
- **Health check**: http://localhost:4000/v1/health

### Demo Accounts

After seeding, you can log in with these accounts (password for all: `password`):

| Role | Email | What You Can Do |
|---|---|---|
| Rider | rider@mototribe.demo | Browse products, join communities, manage garage |
| Seller | seller@mototribe.demo | All rider features + seller dashboard, product management |
| Admin | admin@mototribe.demo | Full platform access, user management, system settings |

---

## How Key Features Work

### Multi-Seller Order Splitting

When a buyer''s cart contains items from different sellers, the checkout flow creates:
1. A parent Order with the aggregated total.
2. Separate SellerOrder records for each seller, each with its own status lifecycle.
3. Individual OrderItem records linked to both the parent order and the seller sub-order.

This means Seller A can mark their items as "Shipped" while Seller B is still packing — the buyer sees a unified order view with per-seller tracking.

### Inventory Reservation

When a buyer starts checkout, the system creates time-limited InventoryReservation records that decrement available stock. If the buyer does not complete payment within the TTL window, a scheduled job releases the reservation and restores the stock. This prevents the classic "I added it to cart but someone else bought it" race condition.

### Payment Flow

The payment module wraps Razorpay with a gateway abstraction. In development (when RAZORPAY_KEY_ID is not set), it automatically switches to a mock gateway that simulates successful payments. The flow:
1. Checkout service creates a CheckoutSession.
2. Payment service creates a PaymentIntent with a Razorpay order (or mock order).
3. Frontend completes payment and sends verification data.
4. Backend verifies the signature and transitions the order status.

### Authentication

The auth system uses a dual-token approach:
- **Access token** (short-lived): Stored as an httpOnly cookie, verified by NestJS Passport on every API request.
- **Refresh token** (long-lived): Also httpOnly, used to silently rotate access tokens.
- **Edge middleware**: The Next.js middleware (middleware.ts) independently verifies the access token using jose to protect routes before they even render. This runs at the edge, so there is no round-trip to the API for auth checks on page navigation.

### Community System

Communities follow a Reddit-like model:
- Anyone can create a community with a name, slug, and description.
- Communities have rules and moderation.
- Posts support upvoting (with score tracking) and bookmarking.
- Threaded comments on posts.
- Members can have different roles within a community.

---

## Environment Variables

All configuration is done through environment variables. See .env.example for the full list with descriptions.

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for signing access tokens |
| JWT_REFRESH_SECRET | Yes | Secret for signing refresh tokens |
| REDIS_HOST | Yes | Redis hostname (default: localhost) |
| REDIS_PORT | Yes | Redis port (default: 6379) |
| NEXT_PUBLIC_APP_URL | Yes | Frontend URL (default: http://localhost:3000) |
| NEXT_PUBLIC_API_URL | Yes | API URL (default: http://localhost:4000) |
| RAZORPAY_KEY_ID | No | Razorpay key — app uses mock mode if not set |
| RAZORPAY_KEY_SECRET | No | Razorpay secret |
| SHIPROCKET_EMAIL | No | Shiprocket credentials — app uses mock mode if not set |
| CLOUDINARY_CLOUD_NAME | No | Cloudinary config for image uploads |

---

## Available Scripts

Run these from the repository root:

| Command | What It Does |
|---|---|
| `pnpm dev` | Start all apps in development mode (Turborepo) |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run ESLint across all workspaces |
| `pnpm format` | Format code with Prettier |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:push` | Push schema changes to the database (dev only) |
| `pnpm test:e2e` | Run end-to-end tests for the API |

---

## CI/CD

The GitHub Actions workflow (.github/workflows/ci.yml) runs on every push and PR to main and develop. It:

1. Spins up PostgreSQL and Redis service containers.
2. Installs dependencies with pnpm install --frozen-lockfile.
3. Generates the Prisma client and pushes the schema to the test database.
4. Runs ESLint across all workspaces.
5. Builds the entire monorepo.
6. Runs end-to-end API tests.

---

## Design System

The visual identity uses a dark-first theme with an orange accent (#ff5c1a) and the Inter typeface. Design tokens are defined as CSS custom properties in globals.css and mapped to Tailwind v4 theme values.

The app supports light and dark themes — switch between them via the theme provider. Both themes are fully tokenised, so adding a new theme is just a matter of defining a new set of CSS variables.

Key design tokens:
- **Background**: #08090b (dark) / #ffffff (light)
- **Surface**: #12161b (dark) / #f1f3f5 (light)
- **Primary/Accent**: #ff5c1a (the MotoTribe orange)
- **Text**: #f0f0ee (dark) / #1a1a1a (light)

---

## Contributing

Contributions are welcome. If you want to add a feature or fix a bug:

1. Fork the repo.
2. Create a branch from main (git checkout -b feature/your-feature).
3. Make your changes and test them locally.
4. Push your branch and open a pull request.

Please keep PRs focused — one feature or fix per PR makes review much easier.

---

## Roadmap

Things that are planned or in progress:

- [ ] Real-time notifications via WebSockets
- [ ] Image upload to Cloudinary from the seller dashboard
- [ ] Full-text search with PostgreSQL tsvector across products and posts
- [ ] Mobile-responsive overhaul for the seller and admin dashboards
- [ ] Email notifications (order confirmations, shipping updates)
- [ ] Rate and review system for sellers (not just products)
- [ ] Ride route sharing with map integration
- [ ] PWA support for the rider experience

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Built with coffee and late-night rides.**

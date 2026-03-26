<!-- # Golf Charity Platform

A full-stack subscription golf platform combining performance tracking, monthly prize draws, and charitable giving.

Built with **Next.js 14 · Supabase · Stripe · Tailwind CSS · Vercel**

---

## Features

### User Features
- ⛳ **Score tracking** — Enter and manage your last 5 Stableford scores (1–45)
- 🎯 **Monthly draws** — Automatic entry into prize draws based on your scores
- 💚 **Charity selection** — Choose your charity and set contribution % (min 10%)
- 🏆 **Winnings dashboard** — Track your prizes and upload verification proof
- 💳 **Subscription management** — Monthly (£9.99) or Yearly (£89.99) via Stripe

### Draw System
- **Random** — Standard lottery-style number generation
- **Algorithmic** — Weighted by least frequent user scores
- **3 prize tiers** — 5 match (40%), 4 match (35%), 3 match (25%)
- **Jackpot rollover** — Unclaimed 5-match jackpot carries to next month

### Admin Features
- 👥 User management — view all users, subscriptions, roles
- 🎯 Draw management — simulate, run, and publish draws
- 💚 Charity management — full CRUD for charity listings + events
- 🏆 Winner verification — approve/reject proofs, mark payouts as paid
- 📊 Analytics — revenue, prize pool, charity contribution totals

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Storage | Supabase Storage |
| Deployment | Vercel |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Fill in all values (see DEPLOYMENT.md)

# 3. Run the database migrations in Supabase SQL Editor:
#    supabase/migrations/001_initial_schema.sql
#    supabase/migrations/002_storage_policies.sql
#    supabase/migrations/003_seed_data.sql  (optional: sample data)

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
golf-charity-platform/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── (auth)/                   # Login + Register
│   ├── (dashboard)/dashboard/    # User dashboard + scores + charity + winnings
│   ├── admin/                    # Admin panel (overview, users, draws, charities, winners)
│   ├── charities/                # Public charity directory
│   ├── draws/                    # Public draw results
│   ├── subscribe/                # Subscription page
│   └── api/                      # API routes
│       ├── auth/                 # Signout + callback
│       ├── subscriptions/        # Create, portal, webhook
│       ├── scores/               # CRUD
│       ├── draws/                # Run, publish, list
│       ├── charities/            # List, create
│       ├── profile/              # Get, update
│       └── admin/                # Users, winners, analytics
├── components/                   # Reusable UI components
│   ├── layout/                   # Navbar, Footer
│   ├── dashboard/                # DashboardNav, ScoreEntry, ScoreList, SubscriptionStatus
│   ├── charity/                  # CharityCard
│   ├── draw/                     # DrawResult
│   ├── admin/                    # AdminSidebar
│   └── ui/                       # Modal, Toast, Skeletons
├── lib/                          # Utilities
│   ├── supabase/                 # Client, server, middleware
│   ├── stripe/                   # Stripe helpers
│   ├── draw-engine.ts            # Draw logic
│   ├── prize-calculator.ts       # Prize pool math
│   └── utils.ts                  # Shared helpers
├── types/                        # TypeScript types + constants
└── supabase/migrations/          # SQL schema + seed data
```

---

## Environment Variables

See `.env.local.example` for all required variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` — Stripe monthly price ID
- `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID` — Stripe yearly price ID
- `NEXT_PUBLIC_APP_URL` — Your deployed app URL

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete step-by-step guide covering:

1. Supabase project setup + schema migration
2. Stripe product + price creation
3. Vercel deployment + environment variables
4. Admin user setup
5. Webhook configuration
6. Full testing checklist

---

## Test Credentials (after setup)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yourdomain.com | your-password |
| User | testuser@yourdomain.com | your-password |

### Stripe Test Card
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

## Draw Logic

Scores are checked against 5 winning numbers (range 1–45 Stableford):

| Match | Pool Share | Rollover |
|-------|-----------|---------|
| 5 numbers | 40% | Yes (jackpot) |
| 4 numbers | 35% | No |
| 3 numbers | 25% | No |

Multiple winners in the same tier split the prize equally.

---

# golf-charity-platform -->





# Golf Charity Platform

A full-stack web application that combines golf score tracking with a charity-driven prize system.

Built with Next.js · Supabase · Tailwind CSS · Vercel

---

## 🚀 Features

### User Features
⛳ Score tracking — Add and manage your latest golf scores  
🔢 Score limit logic — Only the latest 5 scores are stored per user  
🎯 Draw readiness — Scores are structured for use in prize draw logic  
💚 Charity section — View available charity partners  

---

### Core Logic Implemented
- Latest 5 scores per user (automatic replacement of oldest)
- Backend API for score management
- Supabase database integration
- Basic UI for score entry and display

---

## 🛠 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js (App Router) |
| Styling    | Tailwind CSS |
| Backend    | Next.js API Routes |
| Database   | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## ⚙️ Setup Instructions

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Add your Supabase credentials

# Run database migrations (Supabase SQL Editor)
# 001_initial_schema.sql
# 003_seed_data.sql (optional)

# Start development server
npm run dev
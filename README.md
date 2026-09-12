# 🎰 Lass777 - White-Label Online Casino Platform

A complete, production-ready, mobile-first iGaming casino platform inspired by **[lass777.com](https://lass777.com)** (flashy slots-focused brand). Built with a white-label architecture allowing seamless plug-and-play integration with certified external game provider aggregators (SoftSwiss, Slotegrator, SoftGamings, etc.) or standalone self-hosted operation.

---

## 💎 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Obsidian dark theme, gold accents, neon cyan/magenta glows)
- **Animations**: Framer Motion & CSS custom keyframes
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: Lucide React
- **Celebration FX**: Canvas Confetti

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Session & Caching**: Redis (with automatic in-memory cache fallback for zero-friction local setup)
- **Authentication**: Passport JWT with role-based access control (`USER` and `ADMIN`)
- **Game Provider Layer**: Modular Aggregator Adapter Pattern (`IGameAggregatorAdapter`)

---

## 🚀 Key Features

1. **Glamorous Lass777 Landing Page**:
   - Full-screen high-roller hero section with golden coins and blonde VIP hostess aesthetics.
   - Dynamic live progressive jackpot counter ticking up in real time.
   - Live real-time Big Winners ticker.
   - Prominent **"GET $20 FREE"** registration bonus CTA.
   - Mobile APK Download section with QR code and one-click Android APK trigger.
   - Smooth navigation through Featured Games, Promotions, and VIP Club tiers.

2. **Full Casino Lobby**:
   - 25+ certified games across **Video Slots**, **Crash Games** (Aviator, JetX), **Fish Arcade**, and **Live Casino**.
   - Filter by Game Category and Provider (PG Soft, Pragmatic Play, JILI, Spribe, BigSix, NetEnt, Evolution).
   - Real-time instant search bar.
   - Interactive Game Cards displaying RTP (e.g. 96.8%), volatility badges, and dual action buttons (**Play Real Money** / **Demo Play**).

3. **Interactive Game Engine & Launchers**:
   - **5-Reel Spinning Video Slot Simulator**: 5x3 reel grid with authentic symbols (777, Diamonds, Bells, Cherries), payline checks, audio synthesis, Turbo mode, and celebratory confetti animations.
   - **Crash Game Simulator**: Social multiplier climbing curve (1.00x → 50.00x) with real-time "Cash Out" button and live crash history strip.
   - **Aggregator Iframe Ready**: Switches automatically to external game provider iframe URLs when connected to live aggregators.

4. **User & Wallet System**:
   - JWT authentication (Register / Login / Profile).
   - Real-time balances: Real Money, Bonus Credits, and Locked/Pending funds.
   - Instant Cashier: Deposit via Crypto (USDT TRC20/ERC20, BTC, ETH) or Fiat/Cards/Pix.
   - Withdrawal queue with compliance balance locking and admin review.
   - Bonus engine: $20 registration chip, 100% deposit match promo code (`WELCOME200`), and wagering requirement tracking.

5. **Operator Admin Panel** (`/admin`):
   - **Dashboard**: Live Gross Gaming Revenue (GGR = Bets - Wins), total volume, active player sessions.
   - **Player Management**: View player profiles, toggle active/suspended status, manual balance credit/debit adjustments.
   - **Game Management**: Toggle games on/off in real time.
   - **Withdrawal Approvals**: Approve or reject pending cashout requests with automated wallet release/refund.

---

## 📂 Project Structure

```
casino/
├── backend/                        # NestJS Backend API
│   ├── prisma/
│   │   ├── schema.prisma           # Complete relational schema
│   │   └── seed.ts                 # 27 seeded games + admin & demo users
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/               # JWT authentication & registration bonus
│   │   │   ├── users/              # Profiles, VIP status, wagering stats
│   │   │   ├── wallet/             # Deposit, withdraw, atomic ledger
│   │   │   ├── games/              # Catalog, categories, providers, search
│   │   │   ├── provider/           # Game Aggregator Layer & Adapters
│   │   │   │   ├── adapters/       # Mock, SoftSwiss, Slotegrator
│   │   │   │   └── provider.service.ts
│   │   │   ├── bonus/              # Welcome bonus & voucher redemption
│   │   │   └── admin/              # GGR metrics, player & game controls
│   │   ├── common/                 # PrismaService, RedisService, Guards
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
│
├── frontend/                       # Next.js 14 App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (casino)/           # Public Casino Routes
│   │   │   │   ├── page.tsx        # High-glamour Landing Page
│   │   │   │   ├── lobby/page.tsx  # Casino Lobby & Game Filters
│   │   │   │   ├── play/[slug]/page.tsx # Game Launch Viewport
│   │   │   │   ├── wallet/page.tsx # Cashier & Transactions
│   │   │   │   └── profile/page.tsx# VIP Club & Wagering Tracker
│   │   │   ├── admin/              # Operator Console
│   │   │   │   ├── page.tsx        # Dashboard, Users, Games, Cashouts
│   │   │   │   └── layout.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/             # Reusable UI components & Game simulators
│   │   ├── store/                  # Zustand state stores
│   │   ├── lib/                    # API client, utilities, constants
│   │   └── types/                  # TypeScript interfaces
│   ├── tailwind.config.ts
│   └── package.json
│
├── docker-compose.yml              # 1-Click PostgreSQL + Redis containers
├── package.json                    # Root package scripts
└── README.md
```

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- *(Optional)* Docker Desktop (for containerized PostgreSQL & Redis)

### 2. Database Setup
You can run PostgreSQL locally via Docker Compose or use any managed PostgreSQL URL (e.g. Supabase, Neon, Railway):

```bash
# Start PostgreSQL & Redis in background
docker compose up -d
```

Update `backend/.env` with your connection string:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/casino_db?schema=public"
```

Push the schema and seed default games and accounts:
```bash
cd backend
npx prisma db push
npm run prisma:seed
cd ..
```

*(Note: If testing without a database initially, the backend and frontend run with built-in in-memory fallbacks and instant demo modes!)*

### 3. Run Development Servers
From the root directory:

```bash
# Terminal 1 - Start NestJS Backend API (runs on http://localhost:4000)
npm run dev:backend

# Terminal 2 - Start Next.js 14 Frontend (runs on http://localhost:3000)
npm run dev:frontend
```

Now open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Pre-Configured Test Accounts

Use the **1-Click Demo Login** buttons inside the Sign In modal or use these credentials:

| Role | Email | Password | Initial Balance |
|---|---|---|---|
| **Demo Player** | `demo@lass777.com` | `DemoPass777!` | **$2,500.00** Real + **$500.00** Bonus |
| **Operator Admin** | `admin@lass777.com` | `AdminPass777!` | **$50,000.00** Operator Vault |

---

## 🎮 Game Launch API & Aggregator Documentation

The platform implements standard iGaming aggregator integration standards.

### 1. Game Launch Endpoint
- **Method**: `POST /api/v1/provider/launch`
- **Access**: Public for `DEMO` mode, JWT Bearer Token for `REAL` mode
- **Request Body**:
```json
{
  "gameSlug": "gates-of-olympus",
  "mode": "REAL",
  "returnUrl": "https://lass777.com/lobby"
}
```
- **Response**:
```json
{
  "launchUrl": "http://localhost:3000/play/gates-of-olympus?session=sess_1a2b3c4d5e&mode=REAL",
  "sessionToken": "sess_1a2b3c4d5e",
  "mode": "REAL",
  "game": {
    "id": "uuid",
    "slug": "gates-of-olympus",
    "title": "Gates of Olympus",
    "provider": "PRAGMATIC",
    "rtp": 96.5,
    "thumbnail": "https://..."
  },
  "currentBalance": 3000.00
}
```

### 2. Bet Callback (Wallet Debit)
- **Method**: `POST /api/v1/provider/callback/bet`
- **Headers**: `X-REQUEST-SIGN` (HMAC-SHA256 signature)
- **Request Body**:
```json
{
  "sessionToken": "sess_1a2b3c4d5e",
  "roundId": "round_987654",
  "transactionId": "bet_tx_12345",
  "amount": 10.00,
  "gameSlug": "gates-of-olympus"
}
```
- **Response**:
```json
{
  "success": true,
  "transactionId": "bet_tx_12345",
  "newBalance": {
    "realBalance": 2990.00,
    "bonusBalance": 500.00,
    "totalBalance": 3490.00
  }
}
```

### 3. Win Callback (Wallet Credit)
- **Method**: `POST /api/v1/provider/callback/win`
- **Headers**: `X-REQUEST-SIGN` (HMAC-SHA256 signature)
- **Request Body**:
```json
{
  "sessionToken": "sess_1a2b3c4d5e",
  "roundId": "round_987654",
  "transactionId": "win_tx_67890",
  "amount": 55.00,
  "gameSlug": "gates-of-olympus"
}
```

---

## 🔌 Connecting Real Aggregators (SoftSwiss, Slotegrator, SoftGamings)

To switch from the built-in simulator to a live aggregator feed:

1. Open `backend/.env`.
2. Set `ACTIVE_AGGREGATOR=SOFTSWISS` or `ACTIVE_AGGREGATOR=SLOTEGRATOR`.
3. Provide your merchant credentials:
```env
# SoftSwiss
SOFTSWISS_API_URL=https://api.softswiss.net/api/v2
SOFTSWISS_CASINO_ID=your_casino_id
SOFTSWISS_AUTH_KEY=your_secret_auth_key

# Slotegrator
SLOTEGRATOR_API_URL=https://api.slotegrator.com/v1
SLOTEGRATOR_MERCHANT_ID=your_merchant_id
SLOTEGRATOR_MERCHANT_KEY=your_merchant_key
```
4. Point your aggregator callback webhook URL to `https://your-api-domain.com/api/v1/provider/callback/bet` and `/win`.

---

## ⚖️ White-Label Legal & Responsible Gaming Note

This codebase is configured for an enterprise white-label operator model where game licensing, remote RNG certification, and hosting are supplied through external licensed aggregators. Ensure you comply with local jurisdictions before offering real-money wagering.

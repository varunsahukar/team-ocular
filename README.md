# Helix - AI Financial Survival Engine

Helix is a mobile-first, predictive financial intelligence system built with Next.js, Express, PostgreSQL, Prisma, and Socket.io.

## 🚀 Key Features

- **Dashboard**: Real-time "Days to Zero" runway counter and risk score.
- **Transaction Simulator**: Fake UPI UI that triggers real-time updates via WebSockets.
- **Decision Simulator**: Interactive slider to see the future impact of a purchase.
- **Real-time Engine**: Express + Socket.io updates the UI instantly when data changes.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js (Express), Socket.io (Real-time), Prisma (ORM)
- **Database**: PostgreSQL (e.g., Neon / Supabase)
- **UI Components**: shadcn/ui

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (or use SQLite for local testing by changing the provider in `server/prisma/schema.prisma`)

### 2. Backend Setup
```bash
cd server
npm install
# Add DATABASE_URL to your .env file
npx prisma generate
npm run dev
```

### 3. Frontend Setup
```bash
# In the root directory
npm install
# Add NEXT_PUBLIC_API_URL=http://localhost:3001 to your .env.local
npm run dev
```

## 🏗️ Architecture

- `server/`: Express API, Prisma schema, and Socket.io logic.
- `src/app/`: Next.js pages and layouts.
- `src/components/providers/socket-provider.tsx`: Handles WebSocket connection and global metrics state.

## 🌐 Deployment

### Backend (Render/Railway)
- Connect your repo, set the root directory to `server`.
- Add `DATABASE_URL` environment variable.

### Frontend (Vercel)
- Connect your repo, set the root directory to the root.
- Add `NEXT_PUBLIC_API_URL` pointing to your deployed backend.

### Database (Neon/Supabase)
- Create a PostgreSQL instance and copy the connection string.

---
Built with ❤️ by Helix Team.

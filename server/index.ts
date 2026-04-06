import express from "express";
import http from "http";
import type { Transaction } from "@prisma/client";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import prisma from "./prisma.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Mock User ID for simulation (In real app, this would come from Auth)
const MOCK_USER_ID = "mock-user-id";
const SEED_BALANCE = 100000;

type DashboardMetrics = {
  balance: number;
  daysToZero: number;
  riskScore: number;
  spendingTrend: Array<{
    date: string;
    amount: number;
  }>;
  insight: string;
};

type CreateTransactionBody = {
  amount?: number;
  merchant?: string;
  category?: string;
};

// Helper to calculate metrics
const calculateMetrics = async (userId: string): Promise<DashboardMetrics | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { transactions: true },
  });

  if (!user) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentTransactions = user.transactions.filter(
    (transaction) => transaction.timestamp >= thirtyDaysAgo
  );

  const totalSpent30Days = recentTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );
  const avgDailySpend = Math.max(totalSpent30Days / 30, 100); // Floor at 100 for stability
  const daysToZero = Math.max(Math.floor(user.balance / avgDailySpend), 0);

  // Risk Score calculation
  let riskScore = 0;
  
  // 1. Runway risk (0-40 points)
  // < 15 days = 40, 30 days = 20, > 90 days = 0
  riskScore += Math.max(0, 40 - (daysToZero / 2));

  // 2. Volatility risk (0-30 points)
  if (recentTransactions.length > 5) {
    const dailyTotals: Record<string, number> = {};
    recentTransactions.forEach((transaction) => {
      const day = transaction.timestamp.toISOString().slice(0, 10);
      dailyTotals[day] = (dailyTotals[day] || 0) + transaction.amount;
    });
    
    const totals = Object.values(dailyTotals);
    const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
    const variance = totals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / totals.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher standard deviation relative to mean = more volatile
    riskScore += Math.min(30, (stdDev / (mean || 1)) * 10);
  }

  // 3. Frequency risk (0-30 points)
  // More transactions = higher frequency risk (behavioral)
  riskScore += Math.min(30, recentTransactions.length * 2);

  riskScore = Math.min(Math.round(riskScore), 100);

  // Spending trend (last 7 days)
  const sevenDaysTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const dayTotal = user.transactions
      .filter((transaction) => transaction.timestamp >= startOfDay && transaction.timestamp <= endOfDay)
      .reduce((total, transaction) => total + transaction.amount, 0);
      
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      amount: dayTotal,
    };
  });

  return {
    balance: user.balance,
    daysToZero,
    riskScore,
    spendingTrend: sevenDaysTrend,
    insight: getInsight(riskScore, daysToZero),
  };
};

const getInsight = (riskScore: number, daysToZero: number) => {
  if (riskScore > 75) return "Critical: Extreme spending volatility. Your runway is dangerously short.";
  if (riskScore > 50) return "Warning: Behavior indicates rising risk. Defer major purchases.";
  if (daysToZero < 15) return "Alert: Less than two weeks of runway left based on current trends.";
  if (riskScore < 20 && daysToZero > 60) return "Optimal: Behavior is stable. Runway is healthy.";
  return "Stable: Maintain current habits for long-term stability.";
};

const ensureDatabaseSchema = async () => {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "balance" REAL NOT NULL DEFAULT 100000.0
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Transaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "amount" REAL NOT NULL,
      "merchant" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "userId" TEXT NOT NULL,
      CONSTRAINT "Transaction_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Transaction_userId_idx"
    ON "Transaction"("userId")
  `);
};

const seedMockData = async () => {
  await prisma.user.create({
    data: {
      id: MOCK_USER_ID,
      name: "Demo User",
      balance: SEED_BALANCE,
    },
  });

  const merchants = ["Starbucks", "Amazon", "Uber", "Apple Store", "Netflix", "Whole Foods"];
  const categories = ["Coffee", "Shopping", "Transport", "Tech", "Entertainment", "Groceries"];
  const now = new Date();

  const mockTransactions: Omit<Transaction, "id">[] = Array.from({ length: 20 }, (_, index) => {
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const merchantIndex = index % merchants.length;

    return {
      amount: Math.floor(Math.random() * 2000) + 100,
      merchant: merchants[merchantIndex]!,
      category: categories[merchantIndex]!,
      timestamp: date,
      userId: MOCK_USER_ID,
    };
  });

  await prisma.transaction.createMany({
    data: mockTransactions,
  });
};

const hasValidTransactionBody = (
  body: CreateTransactionBody
): body is Required<CreateTransactionBody> => {
  return (
    typeof body.amount === "number" &&
    Number.isFinite(body.amount) &&
    body.amount > 0 &&
    typeof body.merchant === "string" &&
    body.merchant.trim().length > 0 &&
    typeof body.category === "string" &&
    body.category.trim().length > 0
  );
};

// API Routes
app.get("/api/health", async (_req, res) => {
  try {
    let metrics = await calculateMetrics(MOCK_USER_ID);

    if (!metrics) {
      await seedMockData();
      metrics = await calculateMetrics(MOCK_USER_ID);
    }

    return res.json(metrics);
  } catch (error) {
    console.error("Failed to load dashboard metrics", error);
    return res.status(500).json({ error: "Failed to load dashboard metrics" });
  }
});

app.post("/api/transactions", async (req, res) => {
  const transactionBody = req.body as CreateTransactionBody;

  if (!hasValidTransactionBody(transactionBody)) {
    return res.status(400).json({ error: "Amount, merchant, and category are required" });
  }

  const { amount, merchant, category } = transactionBody;
  
  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          amount,
          merchant,
          category,
          userId: MOCK_USER_ID,
        },
      });

      await tx.user.update({
        where: { id: MOCK_USER_ID },
        data: { balance: { decrement: amount } },
      });

      return t;
    });

    const updatedMetrics = await calculateMetrics(MOCK_USER_ID);
    io.emit("metrics-update", updatedMetrics);
    
    return res.status(201).json(transaction);
  } catch (error) {
    console.error("Failed to create transaction", error);
    return res.status(500).json({ error: "Failed to create transaction" });
  }
});

app.get("/api/transactions", async (_req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return res.json(transactions);
  } catch (error) {
    console.error("Failed to list transactions", error);
    return res.status(500).json({ error: "Failed to list transactions" });
  }
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await ensureDatabaseSchema();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database schema", error);
    process.exit(1);
  }
};

void startServer();

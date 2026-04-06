import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import prisma from "./prisma.js";
import { fetchStockPrice } from "./services/stock-price.js";
import { calculateDashboardMetrics, calculatePortfolioSummary, createPortfolioPosition, serializeDashboardTransaction, } from "../shared/financial-engine.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(cors());
app.use(express.json());
const MOCK_USER_ID = "mock-user-id";
const SEED_BALANCE = 100000;
const PORTFOLIO_ROUTES = ["/api/portfolio", "/portfolio"];
const PORTFOLIO_VALUE_ROUTES = ["/api/portfolio/value", "/portfolio/value"];
function normalizeSymbol(symbol) {
    return symbol.trim().toUpperCase().replace(/\.(NS|BO)$/, "");
}
async function buildPortfolioSnapshot(userId, cashBalance) {
    const entries = await prisma.portfolio.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    const positions = await Promise.all(entries.map(async (entry) => {
        const currentPrice = await fetchStockPrice(entry.symbol);
        return createPortfolioPosition({
            ...entry,
            symbol: normalizeSymbol(entry.symbol),
            createdAt: entry.createdAt,
        }, currentPrice);
    }));
    positions.sort((left, right) => right.currentValue - left.currentValue);
    return {
        positions,
        summary: calculatePortfolioSummary({
            cashBalance,
            positions,
        }),
    };
}
async function buildDashboardSnapshot(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return null;
    }
    const [transactions, portfolio] = await Promise.all([
        prisma.transaction.findMany({
            where: { userId },
            orderBy: { timestamp: "desc" },
        }),
        buildPortfolioSnapshot(userId, user.balance),
    ]);
    return {
        metrics: calculateDashboardMetrics({
            balance: user.balance,
            portfolioValue: portfolio.summary.currentValue,
            transactions,
        }),
        transactions: transactions.slice(0, 12).map((transaction) => serializeDashboardTransaction({
            ...transaction,
            timestamp: transaction.timestamp,
        })),
        portfolio,
    };
}
async function broadcastDashboardSnapshot() {
    const snapshot = await buildDashboardSnapshot(MOCK_USER_ID);
    if (!snapshot) {
        return null;
    }
    io.emit("dashboard-update", snapshot);
    io.emit("metrics-update", snapshot.metrics);
    io.emit("portfolio-update", snapshot.portfolio);
    return snapshot;
}
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    void buildDashboardSnapshot(MOCK_USER_ID)
        .then((snapshot) => {
        if (snapshot) {
            socket.emit("dashboard-update", snapshot);
        }
    })
        .catch((error) => {
        console.error("Failed to emit initial dashboard snapshot", error);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
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
    CREATE TABLE IF NOT EXISTS "Portfolio" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "symbol" TEXT NOT NULL,
      "quantity" REAL NOT NULL,
      "buyPrice" REAL NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Portfolio_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    )
  `);
    await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Transaction_userId_idx"
    ON "Transaction"("userId")
  `);
    await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Portfolio_userId_idx"
    ON "Portfolio"("userId")
  `);
};
const seedMockData = async () => {
    await prisma.user.upsert({
        where: { id: MOCK_USER_ID },
        update: {},
        create: {
            id: MOCK_USER_ID,
            name: "Demo User",
            balance: SEED_BALANCE,
        },
    });
    const merchants = ["Starbucks", "Amazon", "Uber", "Apple Store", "Netflix", "Whole Foods"];
    const categories = ["Coffee", "Shopping", "Transport", "Tech", "Entertainment", "Groceries"];
    const now = new Date();
    const mockTransactions = Array.from({ length: 20 }, (_, index) => {
        const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const merchantIndex = index % merchants.length;
        return {
            amount: Math.floor(Math.random() * 2000) + 100,
            merchant: merchants[merchantIndex],
            category: categories[merchantIndex],
            timestamp: date,
            userId: MOCK_USER_ID,
        };
    });
    await prisma.transaction.createMany({
        data: mockTransactions,
    });
};
const ensureDemoData = async () => {
    const user = await prisma.user.findUnique({
        where: { id: MOCK_USER_ID },
    });
    if (!user) {
        await seedMockData();
        return;
    }
    const transactionCount = await prisma.transaction.count({
        where: { userId: MOCK_USER_ID },
    });
    if (transactionCount === 0) {
        await seedMockData();
    }
};
const hasValidTransactionBody = (body) => {
    return (typeof body.amount === "number" &&
        Number.isFinite(body.amount) &&
        body.amount > 0 &&
        typeof body.merchant === "string" &&
        body.merchant.trim().length > 0 &&
        typeof body.category === "string" &&
        body.category.trim().length > 0);
};
const hasValidPortfolioBody = (body) => {
    return (typeof body.symbol === "string" &&
        body.symbol.trim().length > 0 &&
        typeof body.quantity === "number" &&
        Number.isFinite(body.quantity) &&
        body.quantity > 0 &&
        typeof body.buyPrice === "number" &&
        Number.isFinite(body.buyPrice) &&
        body.buyPrice > 0);
};
app.get("/api/dashboard", async (_req, res) => {
    try {
        await ensureDemoData();
        const snapshot = await buildDashboardSnapshot(MOCK_USER_ID);
        if (!snapshot) {
            return res.status(404).json({ error: "Demo user not found" });
        }
        return res.json(snapshot);
    }
    catch (error) {
        console.error("Failed to load dashboard snapshot", error);
        return res.status(500).json({ error: "Failed to load dashboard snapshot" });
    }
});
app.get("/api/health", async (_req, res) => {
    try {
        await ensureDemoData();
        const snapshot = await buildDashboardSnapshot(MOCK_USER_ID);
        if (!snapshot) {
            return res.status(404).json({ error: "Demo user not found" });
        }
        return res.json(snapshot.metrics);
    }
    catch (error) {
        console.error("Failed to load dashboard metrics", error);
        return res.status(500).json({ error: "Failed to load dashboard metrics" });
    }
});
app.post("/api/transactions", async (req, res) => {
    const transactionBody = req.body;
    if (!hasValidTransactionBody(transactionBody)) {
        return res.status(400).json({ error: "Amount, merchant, and category are required" });
    }
    const { amount, merchant, category } = transactionBody;
    try {
        await ensureDemoData();
        const transaction = await prisma.$transaction(async (tx) => {
            const createdTransaction = await tx.transaction.create({
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
            return createdTransaction;
        });
        const snapshot = await broadcastDashboardSnapshot();
        return res.status(201).json({
            transaction: serializeDashboardTransaction({
                ...transaction,
                timestamp: transaction.timestamp,
            }),
            metrics: snapshot?.metrics ?? null,
        });
    }
    catch (error) {
        console.error("Failed to create transaction", error);
        return res.status(500).json({ error: "Failed to create transaction" });
    }
});
app.get("/api/transactions", async (_req, res) => {
    try {
        await ensureDemoData();
        const transactions = await prisma.transaction.findMany({
            where: { userId: MOCK_USER_ID },
            orderBy: { timestamp: "desc" },
            take: 50,
        });
        return res.json(transactions.map((transaction) => serializeDashboardTransaction({
            ...transaction,
            timestamp: transaction.timestamp,
        })));
    }
    catch (error) {
        console.error("Failed to list transactions", error);
        return res.status(500).json({ error: "Failed to list transactions" });
    }
});
app.post(PORTFOLIO_ROUTES, async (req, res) => {
    const portfolioBody = req.body;
    if (!hasValidPortfolioBody(portfolioBody)) {
        return res.status(400).json({ error: "Symbol, quantity, and buy price are required" });
    }
    try {
        await ensureDemoData();
        const portfolioEntry = await prisma.portfolio.create({
            data: {
                userId: MOCK_USER_ID,
                symbol: normalizeSymbol(portfolioBody.symbol),
                quantity: portfolioBody.quantity,
                buyPrice: portfolioBody.buyPrice,
            },
        });
        const snapshot = await broadcastDashboardSnapshot();
        const portfolioItem = snapshot?.portfolio.positions.find((position) => position.id === portfolioEntry.id) ?? null;
        return res.status(201).json({
            portfolioItem,
            summary: snapshot?.portfolio.summary ?? null,
            metrics: snapshot?.metrics ?? null,
        });
    }
    catch (error) {
        console.error("Failed to create portfolio entry", error);
        return res.status(500).json({ error: "Failed to create portfolio entry" });
    }
});
app.get(PORTFOLIO_ROUTES, async (_req, res) => {
    try {
        await ensureDemoData();
        const user = await prisma.user.findUnique({
            where: { id: MOCK_USER_ID },
        });
        if (!user) {
            return res.status(404).json({ error: "Demo user not found" });
        }
        const portfolio = await buildPortfolioSnapshot(MOCK_USER_ID, user.balance);
        return res.json(portfolio.positions);
    }
    catch (error) {
        console.error("Failed to list portfolio holdings", error);
        return res.status(500).json({ error: "Failed to list portfolio holdings" });
    }
});
app.get(PORTFOLIO_VALUE_ROUTES, async (_req, res) => {
    try {
        await ensureDemoData();
        const user = await prisma.user.findUnique({
            where: { id: MOCK_USER_ID },
        });
        if (!user) {
            return res.status(404).json({ error: "Demo user not found" });
        }
        const portfolio = await buildPortfolioSnapshot(MOCK_USER_ID, user.balance);
        return res.json(portfolio.summary);
    }
    catch (error) {
        console.error("Failed to load portfolio valuation", error);
        return res.status(500).json({ error: "Failed to load portfolio valuation" });
    }
});
const PORT = process.env.PORT || 3001;
const startServer = async () => {
    try {
        await ensureDatabaseSchema();
        await ensureDemoData();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to initialize database schema", error);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=index.js.map
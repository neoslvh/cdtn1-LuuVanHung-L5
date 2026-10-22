const express = require("express");
const PartRepository = require("./repositories/part.repository");
const InventoryService = require("./services/inventory.service");
const createPartRoutes = require("./routes/part.routes");
const StockRepository = require("./repositories/stock.repository");
const TransactionRepository = require("./repositories/transaction.repository");
const TicketRepository = require("./repositories/ticket.repository");
const TicketPartRepository = require("./repositories/ticket-part.repository");
const StockTransactionService = require("./services/stock-transaction.service");
const TicketPartService = require("./services/ticket-part.service");
const createStockRoutes = require("./routes/stock.routes");
const createTicketPartRoutes = require("./routes/ticket-part.routes");
const { requireAuth } = require("./middleware/auth-context");
const { AppError } = require("./errors/AppError");

function buildApp(pool) {
  const app = express();
  const inventoryService = new InventoryService(new PartRepository(pool));
  const stockRepository = new StockRepository(pool);
  const ticketRepository = new TicketRepository(pool);
  const ticketPartRepository = new TicketPartRepository(pool);
  const stockTransactionService = new StockTransactionService(
    pool, stockRepository, new TransactionRepository(pool), ticketRepository, ticketPartRepository,
  );
  const ticketPartService = new TicketPartService(ticketRepository, ticketPartRepository);

  app.use(express.json({ limit: "256kb" }));
  app.use((req, res, next) => {
    const allowedOrigins = [process.env.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
    const origin = req.get("origin");
    if (origin && allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({ status: "ok", db: "ok" });
    } catch {
      res.status(503).json({ status: "degraded", db: "không kết nối được" });
    }
  });

  app.use("/api/parts", createPartRoutes(inventoryService));
  app.post("/api/auth/demo-login", (req, res) => {
    const role = req.body?.role;
    if (role === "CENTER_MANAGER") return res.json({ token: "demo-manager", role, center_id: 1 });
    if (role === "TECHNICIAN") return res.json({ token: "demo-technician", role, center_id: 1 });
    return res.status(400).json({ error: { code: "VALIDATION_FAILED", message: "Vai trò đăng nhập không hợp lệ.", fields: { role: "Chọn một vai trò." } } });
  });
  app.use("/api", requireAuth, createStockRoutes(stockTransactionService));
  app.use("/api", requireAuth, createTicketPartRoutes(stockTransactionService, ticketPartService));

  app.use((error, req, res, next) => {
    if (error instanceof AppError) {
      const statusByCode = { PART_NOT_FOUND: 404, TICKET_NOT_FOUND: 404, UNAUTHORIZED: 401, FORBIDDEN: 403, INSUFFICIENT_STOCK: 409 };
      const status = statusByCode[error.code] ?? 400;
      return res.status(status).json({
        error: { code: error.code, message: error.message, fields: error.details ?? {} },
      });
    }
    if (error.code === "23505") {
      return res.status(409).json({
        error: { code: "PART_CODE_EXISTS", message: "Mã linh kiện đã tồn tại.", fields: {} },
      });
    }
    if (error.code === "23503") {
      return res.status(409).json({
        error: { code: "PART_IN_USE", message: "Linh kiện đang được tham chiếu, không thể xóa.", fields: {} },
      });
    }
    console.error(error);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ.", fields: {} },
    });
  });

  return app;
}

module.exports = { buildApp };

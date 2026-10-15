const express = require("express");
const PartRepository = require("./repositories/part.repository");
const InventoryService = require("./services/inventory.service");
const createPartRoutes = require("./routes/part.routes");
const { AppError } = require("./errors/AppError");

function buildApp(pool) {
  const app = express();
  const inventoryService = new InventoryService(new PartRepository(pool));

  app.use(express.json({ limit: "256kb" }));

  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({ status: "ok", db: "ok" });
    } catch {
      res.status(503).json({ status: "degraded", db: "không kết nối được" });
    }
  });

  app.use("/api/parts", createPartRoutes(inventoryService));

  app.use((error, req, res, next) => {
    if (error instanceof AppError) {
      const status = error.code === "PART_NOT_FOUND" ? 404 : 400;
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

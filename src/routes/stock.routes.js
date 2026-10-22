const express = require("express");
const { validateStockReceipt } = require("../validators/stock-receipt.validator");
const { requireRole } = require("../middleware/auth-context");

module.exports = function createStockRoutes(stockTransactionService) {
  const router = express.Router();

  router.get("/part-stocks", async (req, res) => {
    const items = await stockTransactionService.listStocks(req.auth.centerId);
    res.json({ center_id: req.auth.centerId, items, total: items.length });
  });

  router.get("/stock-alerts", requireRole("CENTER_MANAGER"), async (req, res) => {
    const items = await stockTransactionService.listStocks(req.auth.centerId, { lowOnly: true });
    res.json({ center_id: req.auth.centerId, items, total: items.length });
  });

  router.post("/stock-receipts", requireRole("CENTER_MANAGER"), async (req, res) => {
    const data = await stockTransactionService.receive(req.auth.centerId, validateStockReceipt(req.body));
    res.status(201).json(data);
  });

  router.get("/parts/:partId/availability", async (req, res) => {
    const partId = Number(req.params.partId);
    const requestedQuantity = Number(req.query.requested_quantity || 1);
    const items = await stockTransactionService.listStocks(req.auth.centerId);
    const item = items.find((stock) => stock.part_id === partId);
    if (!item) return res.status(404).json({ error: { code: "PART_NOT_FOUND", message: "Không tìm thấy linh kiện.", fields: {} } });
    res.json({ ...item, requested_quantity: requestedQuantity, available: item.quantity >= requestedQuantity });
  });

  return router;
};

const express = require("express");
const { validateStockReceipt } = require("../validators/stock-receipt.validator");
const { validatePagination } = require("../validators/pagination.validator");
const { requireRole } = require("../middleware/auth-context");

module.exports = function createStockRoutes(stockTransactionService) {
  const router = express.Router();

  router.get("/part-stocks", async (req, res) => {
    const { page, size } = validatePagination(req.query);
    const data = await stockTransactionService.listStocks(req.auth.centerId, { page, size });
    res.json({ center_id: req.auth.centerId, ...data });
  });

  router.get("/stock-alerts", requireRole("CENTER_MANAGER"), async (req, res) => {
    const { page, size } = validatePagination(req.query);
    const data = await stockTransactionService.listStocks(req.auth.centerId, { lowOnly: true, page, size });
    res.json({ center_id: req.auth.centerId, ...data });
  });

  router.post("/stock-receipts", requireRole("CENTER_MANAGER"), async (req, res) => {
    const data = await stockTransactionService.receive(req.auth.centerId, validateStockReceipt(req.body));
    res.status(201).json(data);
  });

  router.get("/parts/:partId/availability", async (req, res) => {
    const partId = Number(req.params.partId);
    const requestedQuantity = Number(req.query.requested_quantity || 1);
    const item = await stockTransactionService.getAvailability(req.auth.centerId, partId, requestedQuantity);
    res.json(item);
  });

  return router;
};

const express = require("express");
const { validateStockReceipt } = require("../validators/stock-receipt.validator");
const { validatePagination } = require("../validators/pagination.validator");
const { requireRole } = require("../middleware/auth-context");
const { AppError } = require("../errors/AppError");

module.exports = function createStockRoutes(stockTransactionService) {
  const router = express.Router();

  function partId(value) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", {
        part_id: "part_id phải là số nguyên dương.",
      });
    }
    return id;
  }

  function requestedQuantity(value) {
    const quantity = Number(value);
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", {
        requested_quantity: "requested_quantity phải là số nguyên lớn hơn 0.",
      });
    }
    return quantity;
  }

  router.get("/part-stocks", async (req, res) => {
    const { page, size } = validatePagination(req.query);
    const lowOnly = String(req.query.low_only || "false").toLowerCase() === "true";
    const keyword = String(req.query.keyword || "").trim();
    const data = await stockTransactionService.listStocks(req.auth.centerId, {
      lowOnly,
      keyword,
      page,
      size,
    });
    res.json({ center_id: req.auth.centerId, ...data });
  });

  router.get("/stock-alerts", requireRole("CENTER_MANAGER"), async (req, res) => {
    const { page, size } = validatePagination(req.query);
    const data = await stockTransactionService.listStocks(req.auth.centerId, {
      lowOnly: true,
      page,
      size,
    });
    res.json({ center_id: req.auth.centerId, ...data });
  });

  router.get("/part-transactions", requireRole("CENTER_MANAGER"), async (req, res) => {
    const { page, size } = validatePagination(req.query);
    const data = await stockTransactionService.listTransactionHistory(
      req.auth.centerId,
      partId(req.query.part_id),
      { page, size },
    );
    res.json({ center_id: req.auth.centerId, ...data });
  });

  router.post("/stock-receipts", requireRole("CENTER_MANAGER"), async (req, res) => {
    const data = await stockTransactionService.receive(
      req.auth.centerId,
      validateStockReceipt(req.body),
    );
    res.status(201).json(data);
  });

  router.get("/parts/:partId/availability", async (req, res) => {
    const partId = Number(req.params.partId);
    const item = await stockTransactionService.getAvailability(
      req.auth.centerId,
      partId,
      requestedQuantity(req.query.requested_quantity || 1),
    );
    res.json(item);
  });

  return router;
};

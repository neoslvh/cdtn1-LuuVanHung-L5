const express = require("express");
const { AppError } = require("../errors/AppError");
const { validatePartIssue } = require("../validators/part-issue.validator");
const { requireRole } = require("../middleware/auth-context");

function ticketId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", { ticket_id: "ticket_id phải là số nguyên dương." });
  return id;
}

module.exports = function createTicketPartRoutes(stockTransactionService, ticketPartService) {
  const router = express.Router();
  router.get("/tickets", async (req, res) => res.json(await ticketPartService.listTickets(req.auth.centerId)));
  router.get("/tickets/:ticketId/parts", async (req, res) => res.json(await ticketPartService.listForTicket(req.auth.centerId, ticketId(req.params.ticketId))));
  router.post("/tickets/:ticketId/part-issues", requireRole("TECHNICIAN"), async (req, res) => {
    const data = await stockTransactionService.issue(req.auth.centerId, ticketId(req.params.ticketId), validatePartIssue(req.body));
    res.status(201).json(data);
  });
  return router;
};

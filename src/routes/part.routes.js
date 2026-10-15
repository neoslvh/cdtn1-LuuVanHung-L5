const express = require("express");
const { validatePartPayload } = require("../validators/part.validator");
const { AppError } = require("../errors/AppError");

function parsePartId(value) {
  const partId = Number(value);
  if (!Number.isSafeInteger(partId) || partId <= 0) {
    throw new AppError("INVALID_DATA", "partId không hợp lệ.");
  }
  return partId;
}

module.exports = function createPartRoutes(inventoryService) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const data = await inventoryService.listParts();
    res.status(200).json({ data });
  });

  router.get("/:partId", async (req, res) => {
    const data = await inventoryService.getPart(parsePartId(req.params.partId));
    res.status(200).json({ data });
  });

  router.post("/", async (req, res) => {
    const data = await inventoryService.createPart(validatePartPayload(req.body));
    res.status(201).json({ data });
  });

  router.patch("/:partId", async (req, res) => {
    const data = await inventoryService.updatePart(
      parsePartId(req.params.partId),
      validatePartPayload(req.body, { partial: true }),
    );
    res.status(200).json({ data });
  });

  router.delete("/:partId", async (req, res) => {
    await inventoryService.deletePart(parsePartId(req.params.partId));
    res.status(204).send();
  });

  return router;
};

import { StockAdjustment } from "../models/stockAdjustment.model.js";
import { StockLevel } from "../models/stockLevel.model.js";
import { applyStockMovement } from "../utils/stock.service.js";

export const createStockAdjustment = async (req, res) => {
  try {
    const { documentNo, warehouse, adjustmentDate, lines } = req.body;

    if (!documentNo || !warehouse || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "documentNo, warehouse and at least one line are required",
      });
    }

    const exists = await StockAdjustment.findOne({ documentNo });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Stock adjustment with this documentNo already exists",
      });
    }

    // For each line, fetch current quantity and compute difference
    const enrichedLines = [];
    for (const line of lines) {
      const { product, location, countedQuantity, unit, reason } = line;
      const current = await StockLevel.findOne({
        product,
        warehouse,
        location,
      });

      const previousQuantity = current?.quantity || 0;
      const difference = countedQuantity - previousQuantity;

      enrichedLines.push({
        product,
        location,
        countedQuantity,
        previousQuantity,
        difference,
        unit,
        reason,
      });
    }

    const adj = await StockAdjustment.create({
      documentNo,
      warehouse,
      adjustmentDate,
      status: "DRAFT",
      lines: enrichedLines,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: adj,
      message: "Stock adjustment created (DRAFT)",
    });
  } catch (err) {
    console.error("createStockAdjustment error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const confirmStockAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const adj = await StockAdjustment.findById(id);

    if (!adj) {
      return res
        .status(404)
        .json({ success: false, message: "Stock adjustment not found" });
    }

    if (adj.status === "DONE") {
      return res
        .status(400)
        .json({ success: false, message: "Adjustment already confirmed" });
    }

    for (const line of adj.lines) {
      if (line.difference === 0) continue;

      await applyStockMovement({
        docType: "ADJUSTMENT",
        docId: adj._id,
        lineId: line._id,
        product: line.product,
        warehouse: adj.warehouse,
        location: line.location,
        quantityChange: line.difference,
        userId: req.user?._id,
        note: `Adjustment ${adj.documentNo}`,
      });
    }

    adj.status = "DONE";
    await adj.save();

    res.json({
      success: true,
      data: adj,
      message: "Stock adjustment applied",
    });
  } catch (err) {
    console.error("confirmStockAdjustment error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

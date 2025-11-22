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

export const getStockAdjustments = async (req, res) => {
  try {
    const { status, warehouse, fromDate, toDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (warehouse) filter.warehouse = warehouse;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const adjustments = await StockAdjustment.find(filter)
      .populate("warehouse")
      .populate("lines.product")
      .populate("lines.location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: adjustments });
  } catch (err) {
    console.error("getStockAdjustments error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStockAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const adjustment = await StockAdjustment.findById(id)
      .populate("warehouse")
      .populate("lines.product")
      .populate("lines.location")
      .populate("createdBy", "name email");

    if (!adjustment) {
      return res
        .status(404)
        .json({ success: false, message: "Stock adjustment not found" });
    }

    res.json({ success: true, data: adjustment });
  } catch (err) {
    console.error("getStockAdjustmentById error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStockAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const adjustment = await StockAdjustment.findById(id);
    if (!adjustment) {
      return res
        .status(404)
        .json({ success: false, message: "Stock adjustment not found" });
    }

    if (adjustment.status === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Cannot update confirmed adjustment",
      });
    }

    // If lines are being updated, recalculate differences
    if (updateData.lines && Array.isArray(updateData.lines)) {
      const enrichedLines = [];
      for (const line of updateData.lines) {
        const { product, location, countedQuantity, unit, reason } = line;
        const current = await StockLevel.findOne({
          product,
          warehouse: adjustment.warehouse,
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
      updateData.lines = enrichedLines;
    }

    Object.assign(adjustment, updateData);
    await adjustment.save();

    res.json({
      success: true,
      data: adjustment,
      message: "Stock adjustment updated",
    });
  } catch (err) {
    console.error("updateStockAdjustment error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelStockAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const adjustment = await StockAdjustment.findById(id);

    if (!adjustment) {
      return res
        .status(404)
        .json({ success: false, message: "Stock adjustment not found" });
    }

    if (adjustment.status === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel confirmed adjustment",
      });
    }

    adjustment.status = "CANCELED";
    await adjustment.save();

    res.json({
      success: true,
      data: adjustment,
      message: "Stock adjustment canceled",
    });
  } catch (err) {
    console.error("cancelStockAdjustment error", err);
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

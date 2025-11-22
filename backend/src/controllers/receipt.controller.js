import { Receipt } from "../models/receipt.model.js";
import { applyStockMovement } from "../utils/stock.service.js";

export const createReceipt = async (req, res) => {
  try {
    const { documentNo, supplierName, supplierCode, warehouse, expectedDate,
      lines } = req.body;

    if (!documentNo || !warehouse || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "documentNo, warehouse and at least one line are required",
      });
    }

    const exists = await Receipt.findOne({ documentNo });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Receipt with this documentNo already exists",
      });
    }

    const receipt = await Receipt.create({
      documentNo,
      supplierName,
      supplierCode,
      warehouse,
      expectedDate,
      lines,
      status: "DRAFT",
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: receipt,
      message: "Receipt created (DRAFT)",
    });
  } catch (err) {
    console.error("createReceipt error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReceipts = async (req, res) => {
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

    const receipts = await Receipt.find(filter)
      .populate("warehouse")
      .populate("lines.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: receipts });
  } catch (err) {
    console.error("getReceipts error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Validate / confirm receipt -> stock increases, ledger entries
export const confirmReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }

    if (receipt.status === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Receipt already confirmed",
      });
    }

    // Apply stock movements for each line
    for (const line of receipt.lines) {
      await applyStockMovement({
        docType: "RECEIPT",
        docId: receipt._id,
        lineId: line._id,
        product: line.product,
        warehouse: receipt.warehouse,
        location: line.location,
        quantityChange: line.quantity,
        userId: req.user?._id,
        note: `Receipt ${receipt.documentNo}`,
      });
    }

    receipt.status = "DONE";
    receipt.receivedDate = new Date();
    await receipt.save();

    res.json({
      success: true,
      data: receipt,
      message: "Receipt confirmed and stock increased",
    });
  } catch (err) {
    console.error("confirmReceipt error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

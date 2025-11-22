import { Transfer } from "../models/transfer.model.js";
import { applyStockMovement } from "../utils/stock.service.js";

export const createTransfer = async (req, res) => {
  try {
    const { documentNo, fromWarehouse, toWarehouse, transferDate, lines } =
      req.body;

    if (
      !documentNo ||
      !fromWarehouse ||
      !toWarehouse ||
      !Array.isArray(lines) ||
      lines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "documentNo, fromWarehouse, toWarehouse and at least one line are required",
      });
    }

    const exists = await Transfer.findOne({ documentNo });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Transfer with this documentNo already exists",
      });
    }

    const transfer = await Transfer.create({
      documentNo,
      fromWarehouse,
      toWarehouse,
      transferDate,
      lines,
      status: "DRAFT",
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: transfer,
      message: "Transfer created (DRAFT)",
    });
  } catch (err) {
    console.error("createTransfer error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    const { status, fromWarehouse, toWarehouse } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (fromWarehouse) filter.fromWarehouse = fromWarehouse;
    if (toWarehouse) filter.toWarehouse = toWarehouse;

    const transfers = await Transfer.find(filter)
      .populate("fromWarehouse")
      .populate("toWarehouse")
      .populate("lines.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: transfers });
  } catch (err) {
    console.error("getTransfers error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Confirm -> move stock source -> dest (total stock unchanged)
export const confirmTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await Transfer.findById(id);
    if (!transfer) {
      return res
        .status(404)
        .json({ success: false, message: "Transfer not found" });
    }

    if (transfer.status === "DONE") {
      return res
        .status(400)
        .json({ success: false, message: "Transfer already confirmed" });
    }

    for (const line of transfer.lines) {
      // 1) deduct from source
      await applyStockMovement({
        docType: "TRANSFER",
        docId: transfer._id,
        lineId: line._id,
        product: line.product,
        warehouse: transfer.fromWarehouse,
        location: line.fromLocation,
        quantityChange: -Math.abs(line.quantity),
        userId: req.user?._id,
        note: `Transfer OUT ${transfer.documentNo}`,
      });

      // 2) add to destination
      await applyStockMovement({
        docType: "TRANSFER",
        docId: transfer._id,
        lineId: line._id,
        product: line.product,
        warehouse: transfer.toWarehouse,
        location: line.toLocation,
        quantityChange: Math.abs(line.quantity),
        userId: req.user?._id,
        note: `Transfer IN ${transfer.documentNo}`,
      });
    }

    transfer.status = "DONE";
    await transfer.save();

    res.json({
      success: true,
      data: transfer,
      message: "Transfer confirmed and stock moved",
    });
  } catch (err) {
    console.error("confirmTransfer error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

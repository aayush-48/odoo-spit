import { DeliveryOrder } from "../models/deliveryOrder.model.js";
import { applyStockMovement } from "../utils/stock.service.js";

export const createDeliveryOrder = async (req, res) => {
  try {
    const { documentNo, customerName, customerCode, warehouse, shipDate, lines } =
      req.body;

    if (!documentNo || !warehouse || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "documentNo, warehouse and at least one line are required",
      });
    }

    const exists = await DeliveryOrder.findOne({ documentNo });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Delivery order with this documentNo already exists",
      });
    }

    const order = await DeliveryOrder.create({
      documentNo,
      customerName,
      customerCode,
      warehouse,
      shipDate,
      lines,
      status: "DRAFT",
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: "Delivery order created (DRAFT)",
    });
  } catch (err) {
    console.error("createDeliveryOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDeliveryOrders = async (req, res) => {
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

    const orders = await DeliveryOrder.find(filter)
      .populate("warehouse")
      .populate("lines.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("getDeliveryOrders error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDeliveryOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DeliveryOrder.findById(id)
      .populate("warehouse")
      .populate("lines.product")
      .populate("createdBy", "name email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery order not found" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("getDeliveryOrderById error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await DeliveryOrder.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery order not found" });
    }

    if (order.status === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Cannot update confirmed delivery",
      });
    }

    Object.assign(order, updateData);
    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Delivery order updated",
    });
  } catch (err) {
    console.error("updateDeliveryOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const pickDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DeliveryOrder.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery order not found" });
    }

    if (order.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Can only pick draft delivery orders",
      });
    }

    order.status = "WAITING"; // Picked status
    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Items marked as picked",
    });
  } catch (err) {
    console.error("pickDeliveryOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const packDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DeliveryOrder.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery order not found" });
    }

    if (order.status !== "WAITING") {
      return res.status(400).json({
        success: false,
        message: "Can only pack picked delivery orders",
      });
    }

    order.status = "READY"; // Packed status
    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Items marked as packed",
    });
  } catch (err) {
    console.error("packDeliveryOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DeliveryOrder.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery order not found" });
    }

    if (order.status === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel confirmed delivery",
      });
    }

    order.status = "CANCELED";
    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Delivery order canceled",
    });
  } catch (err) {
    console.error("cancelDeliveryOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Confirm -> stock decreases
export const confirmDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await DeliveryOrder.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery order not found" });
    }

    if (order.status === "DONE") {
      return res
        .status(400)
        .json({ success: false, message: "Delivery already confirmed" });
    }

    for (const line of order.lines) {
      await applyStockMovement({
        docType: "DELIVERY",
        docId: order._id,
        lineId: line._id,
        product: line.product,
        warehouse: order.warehouse,
        location: line.location,
        quantityChange: -Math.abs(line.quantity),
        userId: req.user?._id,
        note: `Delivery ${order.documentNo}`,
      });
    }

    order.status = "DONE";
    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Delivery confirmed and stock decreased",
    });
  } catch (err) {
    console.error("confirmDeliveryOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

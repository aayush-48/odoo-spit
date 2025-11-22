import { StockLedger } from "../models/stockLedger.model.js";

export const getStockMovements = async (req, res) => {
  try {
    const { 
      docType, 
      product, 
      warehouse, 
      fromDate, 
      toDate,
      page = 1,
      limit = 50
    } = req.query;
    
    const filter = {};
    if (docType) filter.docType = docType;
    if (product) filter.product = product;
    if (warehouse) filter.warehouse = warehouse;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const movements = await StockLedger.find(filter)
      .populate("product")
      .populate("warehouse")
      .populate("location")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await StockLedger.countDocuments(filter);

    res.json({
      success: true,
      data: { items: movements, total },
    });
  } catch (err) {
    console.error("getStockMovements error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await StockLedger.findById(id)
      .populate("product")
      .populate("warehouse")
      .populate("location")
      .populate("createdBy", "name email");

    if (!movement) {
      return res
        .status(404)
        .json({ success: false, message: "Stock movement not found" });
    }

    res.json({ success: true, data: movement });
  } catch (err) {
    console.error("getStockMovementById error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


import { StockLevel } from "../models/stockLevel.model.js";
import { Product } from "../models/product.model.js";
import { Receipt } from "../models/receipt.model.js";
import { DeliveryOrder } from "../models/deliveryOrder.model.js";
import { Transfer } from "../models/transfer.model.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const { warehouse } = req.query;
    const stockFilter = warehouse ? { warehouse } : {};

    // Total products in stock (>0)
    const productsInStockAgg = await StockLevel.aggregate([
      { $match: { ...stockFilter, quantity: { $gt: 0 } } },
      { $group: { _id: "$product" } },
      { $count: "count" },
    ]);
    const totalProductsInStock = productsInStockAgg[0]?.count || 0;

    // Low stock/Out of stock
    // 1) get current stock per product
    const stockPerProduct = await StockLevel.aggregate([
      { $match: stockFilter },
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
        },
      },
    ]);

    const stockMap = {};
    for (const row of stockPerProduct) {
      stockMap[row._id.toString()] = row.totalQty;
    }

    const products = await Product.find();
    const lowStock = [];
    const outOfStock = [];
    for (const p of products) {
      const qty = stockMap[p._id.toString()] || 0;
      if (qty <= 0) outOfStock.push({ product: p, quantity: qty });
      else if (p.reorderPoint && qty <= p.reorderPoint)
        lowStock.push({ product: p, quantity: qty });
    }

    // Pending docs (not DONE / CANCELED)
    const pendingFilter = { status: { $nin: ["DONE", "CANCELED"] } };
    if (warehouse) pendingFilter.warehouse = warehouse;

    const [pendingReceipts, pendingDeliveries, pendingTransfers] =
      await Promise.all([
        Receipt.countDocuments(pendingFilter),
        DeliveryOrder.countDocuments(pendingFilter),
        Transfer.countDocuments({
          status: { $nin: ["DONE", "CANCELED"] },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalProductsInStock,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStock,
        outOfStock,
        pendingReceipts,
        pendingDeliveries,
        pendingTransfers,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

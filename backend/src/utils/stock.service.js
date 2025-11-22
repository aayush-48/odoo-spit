import { StockLevel } from "../models/stockLevel.model.js";
import { StockLedger } from "../models/stockLedger.model.js";

/**
 * Adjust stock for a single product-location and write ledger entry.
 * quantityChange: +ve (incoming) or -ve (outgoing)
 */
export async function applyStockMovement({
  docType,
  docId,
  lineId,
  product,
  warehouse,
  location,
  quantityChange,
  userId,
  note,
}) {
  // Update stock level (upsert)
  const stock = await StockLevel.findOneAndUpdate(
    { product, warehouse, location },
    { $inc: { quantity: quantityChange } },
    { new: true, upsert: true }
  );

  if (stock.quantity < 0) {
    // revert and throw
    await StockLevel.findOneAndUpdate(
      { product, warehouse, location },
      { $inc: { quantity: -quantityChange } }
    );
    throw new Error("Insufficient stock for this movement");
  }

  // Ledger entry
  await StockLedger.create({
    docType,
    docId,
    lineId,
    product,
    warehouse,
    location,
    quantityChange,
    createdBy: userId || null,
    note,
  });

  return stock;
}

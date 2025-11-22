import mongoose from "mongoose";

const stockAdjustmentLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    countedQuantity: { type: Number, required: true, min: 0 },
    previousQuantity: { type: Number, required: true, min: 0 },
    difference: { type: Number, required: true }, // counted - previous
    unit: { type: String, required: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    reason: String,
  },
  { _id: true }
);

const stockAdjustmentSchema = new mongoose.Schema(
  {
    documentNo: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"],
      default: "DRAFT",
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    adjustmentDate: Date,
    lines: [stockAdjustmentLineSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const StockAdjustment = mongoose.model(
  "StockAdjustment",
  stockAdjustmentSchema
);

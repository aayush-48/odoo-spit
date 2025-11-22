import mongoose from "mongoose";

const stockLevelSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    quantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

stockLevelSchema.index(
  { product: 1, warehouse: 1, location: 1 },
  { unique: true }
);

export const StockLevel = mongoose.model("StockLevel", stockLevelSchema);

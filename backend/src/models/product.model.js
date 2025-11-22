import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    unit: {
      type: String,
      required: true, // e.g. "pcs", "kg", "box"
    },
    description: String,
    imageUrl: String,
    isActive: { type: Boolean, default: true },
    reorderPoint: { type: Number, default: 0 }, // used for low-stock alerts
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text" });

export const Product = mongoose.model("Product", productSchema);

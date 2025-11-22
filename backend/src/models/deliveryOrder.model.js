import mongoose from "mongoose";

const deliveryLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    note: String,
  },
  { _id: true }
);

const deliveryOrderSchema = new mongoose.Schema(
  {
    documentNo: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"],
      default: "DRAFT",
    },
    customerName: String,
    customerCode: String,
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    shipDate: Date,
    lines: [deliveryLineSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const DeliveryOrder = mongoose.model(
  "DeliveryOrder",
  deliveryOrderSchema
);

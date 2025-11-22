import mongoose from "mongoose";

const receiptLineSchema = new mongoose.Schema(
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

const receiptSchema = new mongoose.Schema(
  {
    documentNo: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"],
      default: "DRAFT",
    },
    supplierName: String,
    supplierCode: String,
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    expectedDate: Date,
    receivedDate: Date,
    lines: [receiptLineSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Receipt = mongoose.model("Receipt", receiptSchema);

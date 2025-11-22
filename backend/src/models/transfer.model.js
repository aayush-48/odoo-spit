import mongoose from "mongoose";

const transferLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    fromLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    toLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    note: String,
  },
  { _id: true }
);

const transferSchema = new mongoose.Schema(
  {
    documentNo: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"],
      default: "DRAFT",
    },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    transferDate: Date,
    lines: [transferLineSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Transfer = mongoose.model("Transfer", transferSchema);

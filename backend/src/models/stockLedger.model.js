import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema(
  {
    docType: {
      type: String,
      enum: ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"],
      required: true,
    },
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    lineId: {
      type: mongoose.Schema.Types.ObjectId, // optional
    },
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
    quantityChange: {
      type: Number, // +ve for incoming, -ve for outgoing
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: String,
  },
  { timestamps: true }
);

export const StockLedger = mongoose.model("StockLedger", stockLedgerSchema);

import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    type: {
      type: String,
      enum: ["RACK", "BIN", "FLOOR", "STAGING", "OTHER"],
      default: "OTHER",
    },
    isDefaultReceiving: { type: Boolean, default: false },
    isDefaultShipping: { type: Boolean, default: false },
  },
  { timestamps: true }
);

locationSchema.index({ warehouse: 1, code: 1 }, { unique: true });

export const Location = mongoose.model("Location", locationSchema);

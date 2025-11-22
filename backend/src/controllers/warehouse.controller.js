import { Warehouse } from "../models/warehouse.model.js";
import { Location } from "../models/location.model.js";

export const createWarehouse = async (req, res) => {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Name and code are required" });
    }

    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Warehouse code already exists" });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      address,
    });

    res
      .status(201)
      .json({ success: true, data: warehouse, message: "Warehouse created" });
  } catch (err) {
    console.error("createWarehouse error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    console.error("getWarehouses error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Locations under a warehouse

export const createLocation = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { name, code, type, isDefaultReceiving, isDefaultShipping } =
      req.body;

    if (!name || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Name and code are required" });
    }

    const location = await Location.create({
      name,
      code,
      type,
      warehouse: warehouseId,
      isDefaultReceiving,
      isDefaultShipping,
    });

    res.status(201).json({
      success: true,
      data: location,
      message: "Location created",
    });
  } catch (err) {
    console.error("createLocation error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLocationsByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const locations = await Location.find({ warehouse: warehouseId }).sort({
      name: 1,
    });
    res.json({ success: true, data: locations });
  } catch (err) {
    console.error("getLocationsByWarehouse error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

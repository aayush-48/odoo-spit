import { Product } from "../models/product.model.js";
import { StockLevel } from "../models/stockLevel.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, unit, description, imageUrl, reorderPoint } =
      req.body;

    if (!name || !sku || !unit) {
      return res.status(400).json({
        success: false,
        message: "Name, SKU and unit are required",
      });
    }

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Product with this SKU exists" });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category,
      unit,
      description,
      imageUrl,
      reorderPoint: reorderPoint ?? 0,
    });

    res
      .status(201)
      .json({ success: true, data: product, message: "Product created" });
  } catch (err) {
    console.error("createProduct error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: { items: products, total },
    });
  } catch (err) {
    console.error("getProducts error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("category");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    console.error("getProductById error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // If SKU is being updated, check for duplicates
    if (updateData.sku && updateData.sku !== product.sku) {
      const existing = await Product.findOne({ sku: updateData.sku.toUpperCase() });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Product with this SKU exists" });
      }
      updateData.sku = updateData.sku.toUpperCase();
    }

    Object.assign(product, updateData);
    await product.save();

    res.json({
      success: true,
      data: product,
      message: "Product updated",
    });
  } catch (err) {
    console.error("updateProduct error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if product is used in any transactions
    // This is a simplified check - you might want to check receipts, deliveries, etc.
    const hasStock = await StockLevel.findOne({ product: productId });
    if (hasStock && hasStock.quantity > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product with existing stock",
      });
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    console.error("deleteProduct error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductStockByLocation = async (req, res) => {
  try {
    const { productId } = req.params;

    const stock = await StockLevel.find({ product: productId })
      .populate("warehouse")
      .populate("location");

    res.json({ success: true, data: stock });
  } catch (err) {
    console.error("getProductStockByLocation error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

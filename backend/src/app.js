import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import productRoutes from "./routes/product.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import transferRoutes from "./routes/transfer.routes.js";
import adjustmentRoutes from "./routes/stockAdjustment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
// import ledgerRoutes from "./routes/ledger.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/ledger", ledgerRoutes);

export default app;

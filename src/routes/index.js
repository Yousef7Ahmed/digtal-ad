import { Router } from "express";
import mongoose from "mongoose";

import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import quoteRoutes from "./quote.routes.js";
import messageRoutes from "./message.routes.js";
import userRoutes from "./user.routes.js";
import { serviceRouter, workRouter } from "./content.routes.js";
import { settingRouter, reportRouter } from "./setting.routes.js";
import pageContentRoutes from "./pageContent.routes.js";
import homeCardRoutes from "./homeCard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/quotes", quoteRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);
router.use("/services", serviceRouter);
router.use("/works", workRouter);
router.use("/settings", settingRouter);
router.use("/reports", reportRouter);
router.use("/page-content", pageContentRoutes);
router.use("/home-cards", homeCardRoutes);

// المسارات الجاية (كل مرحلة بتضيف الملف بتاعها هنا):
// router.use("/payments", paymentRoutes);

router.get("/health", (req, res) => {
  const states = ["منفصل", "متصل", "بيتصل", "بيقفل"];
  res.json({
    success: true,
    message: "السيرفر شغّال",
    db: states[mongoose.connection.readyState] || "غير معروف",
    time: new Date().toISOString(),
  });
});

export default router;

import { Router } from "express";

import * as controller from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  cancelOrderSchema,
  createOrderSchema,
  updateStatusSchema,
} from "../validators/order.validators.js";

const router = Router();

router.use(protect);

// العميل
router.post("/", validate(createOrderSchema), controller.createOrder);
router.get("/my", controller.myOrders);
router.patch("/:id/cancel", validate(cancelOrderSchema), controller.cancelOrder);

// الإدارة
router.get("/", authorize("admin", "staff"), controller.listOrders);
router.get("/stats", authorize("admin", "staff"), controller.orderStats);
router.patch(
  "/:id/status",
  authorize("admin", "staff"),
  validate(updateStatusSchema),
  controller.updateOrderStatus,
);

// لازم يفضل آخر واحد عشان ما يخطفش /my و /stats
router.get("/:id", controller.getOrder);

export default router;

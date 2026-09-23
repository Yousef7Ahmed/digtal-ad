import { Router } from "express";

import * as controller from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { addItemSchema, updateItemSchema } from "../validators/order.validators.js";

const router = Router();

// السلة لازمها تسجيل دخول
router.use(protect);

router.get("/", controller.getCart);
router.post("/items", validate(addItemSchema), controller.addItem);
router.patch("/items/:itemId", validate(updateItemSchema), controller.updateItem);
router.delete("/items/:itemId", controller.removeItem);
router.delete("/", controller.clearCart);

export default router;

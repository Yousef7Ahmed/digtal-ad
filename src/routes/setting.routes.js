import { Router } from "express";

import * as controller from "../controllers/setting.controller.js";
import * as reports from "../controllers/report.controller.js";
import { adminOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { updateSettingsSchema } from "../validators/setting.validators.js";
import { PRICING } from "../config/pricing.js";

export const settingRouter = Router();

settingRouter.get("/", controller.getSettings);
settingRouter.patch("/", ...adminOnly, validate(updateSettingsSchema), controller.updateSettings);

// إعدادات الحساب (ضريبة/شحن/دفع) عشان الواجهة تعرض نفس القواعد
settingRouter.get("/pricing", (req, res) => {
  res.json({
    success: true,
    data: {
      currency: PRICING.currency,
      vat: { enabled: PRICING.vat.enabled, rate: PRICING.vat.rate, inclusive: PRICING.vat.inclusive },
      shipping: { enabled: PRICING.shipping.enabled },
      payment: { enabled: PRICING.payment.enabled, methods: PRICING.payment.methods },
    },
  });
});

export const reportRouter = Router();

reportRouter.get("/sales", ...adminOnly, reports.salesReport);
reportRouter.get("/orders.csv", ...adminOnly, reports.exportOrders);

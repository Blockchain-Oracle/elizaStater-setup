"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferDataParamsSchema = void 0;
const zod_1 = require("zod");
exports.transferDataParamsSchema = zod_1.z.object({
    amount: zod_1.z.string(),
    accountId: zod_1.z.string(),
});

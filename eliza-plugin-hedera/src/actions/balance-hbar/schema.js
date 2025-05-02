"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaHbarBalanceParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaHbarBalanceParamsSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    address: zod_1.z.string(),
});

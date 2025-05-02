"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaHtsBalanceParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaHtsBalanceParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
    address: zod_1.z.string(),
});

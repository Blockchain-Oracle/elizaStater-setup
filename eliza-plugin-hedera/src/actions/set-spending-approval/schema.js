"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaSetSpendingApprovalParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaSetSpendingApprovalParamsSchema = zod_1.z.object({
    spenderAccountId: zod_1.z.string(),
    amount: zod_1.z.coerce.number(),
    tokenId: zod_1.z.string().nullable().optional(),
});

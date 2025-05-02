"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airdropTokenParamsSchema = void 0;
const zod_1 = require("zod");
exports.airdropTokenParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
    recipients: zod_1.z.array(zod_1.z.string()),
    amount: zod_1.z.coerce.number(),
});

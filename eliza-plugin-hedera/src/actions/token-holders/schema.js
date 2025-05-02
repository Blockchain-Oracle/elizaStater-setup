"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaTokenHoldersParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaTokenHoldersParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
    threshold: zod_1.z.coerce.number().optional(),
});

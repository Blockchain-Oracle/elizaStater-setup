"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaRejectTokenParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaRejectTokenParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
});

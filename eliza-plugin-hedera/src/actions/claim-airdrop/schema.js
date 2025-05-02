"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimAirdropParamsSchema = void 0;
const zod_1 = require("zod");
exports.claimAirdropParamsSchema = zod_1.z.object({
    senderId: zod_1.z.string(),
    tokenId: zod_1.z.string(),
});

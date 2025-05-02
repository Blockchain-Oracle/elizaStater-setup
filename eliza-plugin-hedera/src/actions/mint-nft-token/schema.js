"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaMintNFTTokenParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaMintNFTTokenParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
    tokenMetadata: zod_1.z.string()
});

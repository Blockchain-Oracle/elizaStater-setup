"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaMintTokenParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaMintTokenParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
    amount: zod_1.z.coerce.number(),
});

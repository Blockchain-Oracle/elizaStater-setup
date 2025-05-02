"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaDissociateTokenParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaDissociateTokenParamsSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
});

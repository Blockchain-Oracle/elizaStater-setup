"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaAllTokensBalancesParamsSchema = void 0;
const zod_1 = require("zod");
const utils_ts_1 = require("../../shared/utils.ts");
exports.hederaAllTokensBalancesParamsSchema = zod_1.z.object({
    address: zod_1.z.string().optional().nullable().transform(utils_ts_1.castToNull),
});

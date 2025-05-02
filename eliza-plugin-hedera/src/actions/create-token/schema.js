"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenParamsSchema = void 0;
const zod_1 = require("zod");
const utils_ts_1 = require("../../shared/utils.ts");
exports.createTokenParamsSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    name: zod_1.z.string(),
    decimals: zod_1.z.coerce.number(),
    initialSupply: zod_1.z.coerce.number(),
    isSupplyKey: utils_ts_1.castToBoolean,
    isMetadataKey: utils_ts_1.castToBoolean,
    isAdminKey: utils_ts_1.castToBoolean,
    tokenMetadata: zod_1.z.string().nullable().transform(utils_ts_1.castToEmptyString),
    memo: zod_1.z.string().nullable().transform(utils_ts_1.castToEmptyString),
});

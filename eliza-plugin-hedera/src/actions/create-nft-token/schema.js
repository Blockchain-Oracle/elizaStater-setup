"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNFTTokenParamsSchema = void 0;
const zod_1 = require("zod");
const utils_ts_1 = require("../../shared/utils.ts");
exports.createNFTTokenParamsSchema = zod_1.z.object({
    name: zod_1.z.string(),
    symbol: zod_1.z.string(),
    maxSupply: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .optional()
        .nullable()
        .transform(utils_ts_1.castToNull)
        .transform((value) => {
        if (value === null) {
            return null;
        }
        return Number(value);
    }),
    isMetadataKey: utils_ts_1.castToBoolean,
    isAdminKey: utils_ts_1.castToBoolean,
    tokenMetadata: zod_1.z.string().nullable().transform(utils_ts_1.castToEmptyString),
    memo: zod_1.z.string().nullable().transform(utils_ts_1.castToEmptyString),
});

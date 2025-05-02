import { z } from "zod";
import { castToBoolean, castToEmptyString, castToNull } from "../../shared/utils.ts";

export const createNFTTokenParamsSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    maxSupply: z
        .union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(castToNull)
        .transform((value) => {
            if (value === null) {
                return null;
            }
            return Number(value);
        }),
    isMetadataKey: castToBoolean,
    isAdminKey: castToBoolean,
    tokenMetadata: z.string().nullable().transform(castToEmptyString),
    memo: z.string().nullable().transform(castToEmptyString),
});

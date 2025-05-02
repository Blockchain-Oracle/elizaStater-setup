import { z } from "zod";
import { castToBoolean, castToEmptyString } from "../../shared/utils.ts";

export const createTokenParamsSchema = z.object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.coerce.number(),
    initialSupply: z.coerce.number(),
    isSupplyKey: castToBoolean,
    isMetadataKey: castToBoolean,
    isAdminKey: castToBoolean,
    tokenMetadata: z.string().nullable().transform(castToEmptyString),
    memo: z.string().nullable().transform(castToEmptyString),
});

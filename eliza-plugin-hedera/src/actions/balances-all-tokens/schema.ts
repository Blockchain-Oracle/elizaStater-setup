import { z } from "zod";
import { castToNull } from "../../shared/utils.ts";

export const hederaAllTokensBalancesParamsSchema = z.object({
    address: z.string().optional().nullable().transform(castToNull),
});

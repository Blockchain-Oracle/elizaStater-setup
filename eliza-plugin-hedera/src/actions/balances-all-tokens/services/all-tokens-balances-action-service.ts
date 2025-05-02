import { HederaProvider } from "../../../providers/client";
import {
    AllTokensBalancesResult,
    HederaAllTokensBalancesParams,
} from "../types.ts";
import {
    DetailedTokenBalance,
    HederaNetworkType,
} from "hedera-agent-kit";
import { TxStatus } from "../../../shared/constants.ts";

export class AllTokensBalancesActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaAllTokensBalancesParams,
        networkType: HederaNetworkType
    ): Promise<AllTokensBalancesResult> {
        if (!params.address) {
            throw new Error("No receiver address");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();
        const balancesArray: Array<DetailedTokenBalance> =
            await agentKit.getAllTokensBalances(networkType, params.address as string);

        return {
            status: TxStatus.SUCCESS,
            balancesArray: balancesArray,
        };
    }
}

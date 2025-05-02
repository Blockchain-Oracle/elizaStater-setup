import type { HederaHtsBalanceParams } from "../types.ts";
import { HederaProvider } from "../../../providers/client";
import { TokenId } from "@hashgraph/sdk";
import { RejectTokenResult } from "hedera-agent-kit";

export class RejectTokenActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(params: HederaHtsBalanceParams): Promise<RejectTokenResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        return await agentKit.rejectToken(TokenId.fromString(params.tokenId));
    }
}

import { HederaProvider } from "../../../providers/client";
import { HederaDissociateTokenParams } from "../types.ts";
import { AssociateTokenResult } from "hedera-agent-kit";
import { TokenId } from "@hashgraph/sdk";

export class DissociateTokenActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaDissociateTokenParams
    ): Promise<AssociateTokenResult> {
        if (!params.tokenId) {
            throw new Error("No token id");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();

        return await agentKit.dissociateToken(
            TokenId.fromString(params.tokenId)
        );
    }
}

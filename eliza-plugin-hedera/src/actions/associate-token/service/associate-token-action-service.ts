import { HederaProvider } from "../../../providers/client";
import { HederaAssociateTokenParams } from "../types.ts";
import { AssociateTokenResult } from "hedera-agent-kit";
import { TokenId } from "@hashgraph/sdk";

export class AssociateTokenActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaAssociateTokenParams
    ): Promise<AssociateTokenResult> {
        if (!params.tokenId) {
            throw new Error("No token id");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();

        return await agentKit.associateToken(
            TokenId.fromString(params.tokenId)
        );
    }
}

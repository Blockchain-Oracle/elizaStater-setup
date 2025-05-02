import { HederaProvider } from "../../../providers/client";
import { MintTokenResult } from "hedera-agent-kit";
import { HederaMintNFTTokenParams } from "../types.ts";
import { TokenId } from "@hashgraph/sdk";

export class MintNftActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaMintNFTTokenParams,
    ): Promise<MintTokenResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        return agentKit.mintNFTToken(
            TokenId.fromString(params.tokenId),
            new TextEncoder().encode(params.tokenMetadata)
        );
    }
}

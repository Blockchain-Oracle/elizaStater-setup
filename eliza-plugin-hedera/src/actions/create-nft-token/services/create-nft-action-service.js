"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNftActionService = void 0;
class CreateNftActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.name) {
            throw new Error("Missing name of token");
        }
        if (!params.symbol) {
            throw new Error("Missing symbol of token");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const options = {
            name: params.name,
            symbol: params.symbol,
            maxSupply: params.maxSupply, // NFT tokens always have decimals 0 so no parsing to base unit is needed
            isMetadataKey: params.isMetadataKey,
            isAdminKey: params.isAdminKey,
            tokenMetadata: new TextEncoder().encode(params.tokenMetadata),
            memo: params.memo,
        };
        return agentKit.createNFT(options);
    }
}
exports.CreateNftActionService = CreateNftActionService;

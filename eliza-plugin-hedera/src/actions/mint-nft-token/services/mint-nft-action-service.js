"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintNftActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class MintNftActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return agentKit.mintNFTToken(sdk_1.TokenId.fromString(params.tokenId), new TextEncoder().encode(params.tokenMetadata));
    }
}
exports.MintNftActionService = MintNftActionService;

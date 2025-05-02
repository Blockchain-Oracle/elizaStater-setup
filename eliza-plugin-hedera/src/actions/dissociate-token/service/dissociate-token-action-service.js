"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DissociateTokenActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class DissociateTokenActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.tokenId) {
            throw new Error("No token id");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return await agentKit.dissociateToken(sdk_1.TokenId.fromString(params.tokenId));
    }
}
exports.DissociateTokenActionService = DissociateTokenActionService;

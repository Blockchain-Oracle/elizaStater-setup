"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociateTokenActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class AssociateTokenActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.tokenId) {
            throw new Error("No token id");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return await agentKit.associateToken(sdk_1.TokenId.fromString(params.tokenId));
    }
}
exports.AssociateTokenActionService = AssociateTokenActionService;

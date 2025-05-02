"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectTokenActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class RejectTokenActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return await agentKit.rejectToken(sdk_1.TokenId.fromString(params.tokenId));
    }
}
exports.RejectTokenActionService = RejectTokenActionService;

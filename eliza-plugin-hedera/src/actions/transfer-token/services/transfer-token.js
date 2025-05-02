"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferTokenService = void 0;
const sdk_1 = require("@hashgraph/sdk");
const hedera_agent_kit_1 = require("hedera-agent-kit");
class TransferTokenService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        if (!params.tokenId) {
            throw new Error("Missing tokenId");
        }
        if (!params.toAccountId) {
            throw new Error("Missing recipient accountId");
        }
        if (!params.amount) {
            throw new Error("Missing amount of token");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const tokenId = sdk_1.TokenId.fromString(params.tokenId);
        return agentKit.transferToken(tokenId, params.toAccountId, await (0, hedera_agent_kit_1.toBaseUnit)(params.tokenId, params.amount, networkType).then((a) => a.toNumber()));
    }
}
exports.TransferTokenService = TransferTokenService;

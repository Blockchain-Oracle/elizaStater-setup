"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintTokenActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
const hedera_agent_kit_1 = require("hedera-agent-kit");
class MintTokenActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const baseUnitAmount = await (0, hedera_agent_kit_1.toBaseUnit)(params.tokenId, params.amount, networkType);
        return agentKit.mintToken(sdk_1.TokenId.fromString(params.tokenId), baseUnitAmount.toNumber());
    }
}
exports.MintTokenActionService = MintTokenActionService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSpendingApprovalTokenAction = void 0;
const sdk_1 = require("@hashgraph/sdk");
const hedera_agent_kit_1 = require("hedera-agent-kit");
class SetSpendingApprovalTokenAction {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        let parsedAmount = params.amount;
        if (params.tokenId) {
            parsedAmount = await (0, hedera_agent_kit_1.toBaseUnit)(params.tokenId, params.amount, networkType).then((a) => a.toNumber());
        }
        const parsedTokenId = params.tokenId ? sdk_1.TokenId.fromString(params.tokenId) : undefined;
        return await agentKit.approveAssetAllowance(sdk_1.AccountId.fromString(params.spenderAccountId), parsedAmount, parsedTokenId);
    }
}
exports.SetSpendingApprovalTokenAction = SetSpendingApprovalTokenAction;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirdropTokenService = void 0;
const sdk_1 = require("@hashgraph/sdk");
const hedera_agent_kit_1 = require("hedera-agent-kit");
class AirdropTokenService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        if (!params.tokenId) {
            throw new Error("Missing tokenId");
        }
        if (!params.recipients || !params.recipients.length) {
            throw new Error("Missing recipients");
        }
        if (!params.amount) {
            throw new Error("Missing amount to airdrop");
        }
        const tokenId = sdk_1.TokenId.fromString(params.tokenId);
        const recipients = await Promise.all(params.recipients.map(async (r) => ({
            accountId: r,
            amount: (await (0, hedera_agent_kit_1.toBaseUnit)(tokenId.toString(), params.amount, networkType)).toNumber(),
        })));
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return await agentKit.airdropToken(tokenId, recipients);
    }
}
exports.AirdropTokenService = AirdropTokenService;

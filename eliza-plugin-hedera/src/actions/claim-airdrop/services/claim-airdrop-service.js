"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimAirdropService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class ClaimAirdropService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, accountId) {
        if (!params.tokenId) {
            throw new Error("No tokenId provided");
        }
        if (!params.senderId) {
            throw new Error("No senderId provided");
        }
        if (!accountId) {
            throw new Error("No accountId provided");
        }
        const tokenId = sdk_1.TokenId.fromString(params.tokenId);
        const senderId = sdk_1.AccountId.fromString(params.senderId);
        const receiverId = sdk_1.AccountId.fromString(accountId);
        const pendingAirdrop = new sdk_1.PendingAirdropId({
            senderId,
            tokenId,
            receiverId,
        });
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return agentKit.claimAirdrop(pendingAirdrop);
    }
}
exports.ClaimAirdropService = ClaimAirdropService;

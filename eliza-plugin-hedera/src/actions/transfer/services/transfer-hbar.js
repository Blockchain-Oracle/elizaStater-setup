"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferHbarService = void 0;
class TransferHbarService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute({ amount, accountId, }) {
        if (!amount) {
            throw new Error("Missing amount");
        }
        if (!accountId) {
            throw new Error("Missing recipient accountId");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return agentKit.transferHbar(accountId, amount);
    }
}
exports.TransferHbarService = TransferHbarService;

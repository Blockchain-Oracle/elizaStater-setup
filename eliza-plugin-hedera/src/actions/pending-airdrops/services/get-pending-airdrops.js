"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingAirdropsService = void 0;
class GetPendingAirdropsService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(accountId, networkType) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return await agentKit.getPendingAirdrops(accountId, networkType);
    }
}
exports.GetPendingAirdropsService = GetPendingAirdropsService;
